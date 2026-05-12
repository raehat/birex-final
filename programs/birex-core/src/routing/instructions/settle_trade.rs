use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};

use crate::routing::{
    errors::BirexError,
    events::{TradeOutcome, TradeSettled},
    pyth::parse_price_update,
    state::{BirexState, TradeState, BIREX_STATE_SEED, ESCROW_SEED, TRADE_SEED},
};

#[derive(Accounts)]
#[instruction(trader: Pubkey)]
pub struct SettleTrade<'info> {
    /// Anyone may call settle — they pay the tx fee, not the trader.
    #[account(mut)]
    pub caller: Signer<'info>,

    /// Trader's system account — receives rent when TradeState is closed.
    /// CHECK: constrained to equal the trader instruction argument.
    #[account(
        mut,
        constraint = trader_wallet.key() == trader @ BirexError::TraderMismatch,
    )]
    pub trader_wallet: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [TRADE_SEED, trader.as_ref()],
        bump = trade_state.bump,
        close = trader_wallet,
        constraint = trade_state.trader == trader @ BirexError::TraderMismatch,
    )]
    pub trade_state: Account<'info, TradeState>,

    #[account(
        seeds = [BIREX_STATE_SEED],
        bump = birex_state.bump,
    )]
    pub birex_state: Account<'info, BirexState>,

    #[account(
        mut,
        seeds = [ESCROW_SEED, trader.as_ref()],
        bump = trade_state.escrow_bump,
        token::mint = bt_mint,
        token::authority = birex_state,
    )]
    pub escrow: Account<'info, TokenAccount>,

    /// Trader's BT token account — receives winnings/stake on win or tie.
    #[account(
        mut,
        constraint = trader_bt_account.mint == birex_state.bt_mint @ BirexError::WrongMint,
        constraint = trader_bt_account.owner == trader @ BirexError::TraderMismatch,
    )]
    pub trader_bt_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = bt_mint.key() == birex_state.bt_mint @ BirexError::WrongMint,
    )]
    pub bt_mint: Account<'info, Mint>,

    /// bt-token State PDA — used as CPI context for authorized_mint_bt.
    /// CHECK: key validated against birex_state.bt_token_state.
    #[account(
        mut,
        constraint = bt_token_state.key() == birex_state.bt_token_state @ BirexError::WrongBtTokenState,
    )]
    pub bt_token_state: UncheckedAccount<'info>,

    /// CHECK: owner verified against birex_state.pyth_receiver_program in handler.
    pub price_update: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,

    /// CHECK: verified as bt-token program via CPI call.
    pub bt_token_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SettleTrade>, trader: Pubkey) -> Result<()> {
    // Validate and parse closing price proof
    let price_update = &ctx.accounts.price_update;
    require!(
        price_update.owner == &ctx.accounts.birex_state.pyth_receiver_program,
        BirexError::WrongPythProgram
    );
    let price_data = parse_price_update(&price_update.data.borrow())?;

    let ts = &ctx.accounts.trade_state;

    // Closing proof must be for the same asset
    require!(price_data.feed_id == ts.feed_id, BirexError::FeedIdMismatch);

    // Closing slot must exactly match the agreed end slot
    require!(
        price_data.posted_slot == ts.end_slot,
        BirexError::WrongCloseSlot
    );

    let closing_price = price_data.price;
    let strike_price = ts.strike_price;
    let bt_amount = ts.bt_amount;
    let direction_up = ts.direction;

    let bump = ctx.accounts.birex_state.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[BIREX_STATE_SEED, &[bump]]];

    // Determine outcome
    let outcome = if (closing_price > strike_price && direction_up)
        || (closing_price < strike_price && !direction_up)
    {
        TradeOutcome::Win
    } else if closing_price == strike_price {
        TradeOutcome::Tie
    } else {
        TradeOutcome::Loss
    };

    let payout: u64;

    match outcome {
        TradeOutcome::Win => {
            // Release staked BT back to trader
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.key(),
                    Transfer {
                        from: ctx.accounts.escrow.to_account_info(),
                        to: ctx.accounts.trader_bt_account.to_account_info(),
                        authority: ctx.accounts.birex_state.to_account_info(),
                    },
                    signer_seeds,
                ),
                bt_amount,
            )?;

            // Mint 0.95x BT profit via bt-token's authorized_mint_bt
            let profit = bt_amount
                .checked_mul(95)
                .ok_or(BirexError::MathOverflow)?
                .checked_div(100)
                .ok_or(BirexError::MathOverflow)?;

            let cpi_accounts = bt_token::cpi::accounts::AuthorizedMintBt {
                authority: ctx.accounts.birex_state.to_account_info(),
                state: ctx.accounts.bt_token_state.to_account_info(),
                bt_mint: ctx.accounts.bt_mint.to_account_info(),
                recipient_bt_account: ctx.accounts.trader_bt_account.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.bt_token_program.key(),
                cpi_accounts,
                signer_seeds,
            );
            bt_token::cpi::authorized_mint_bt(cpi_ctx, profit)?;

            payout = bt_amount
                .checked_add(profit)
                .ok_or(BirexError::MathOverflow)?;
        }

        TradeOutcome::Tie => {
            // Release staked BT — no profit, no loss
            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.key(),
                    Transfer {
                        from: ctx.accounts.escrow.to_account_info(),
                        to: ctx.accounts.trader_bt_account.to_account_info(),
                        authority: ctx.accounts.birex_state.to_account_info(),
                    },
                    signer_seeds,
                ),
                bt_amount,
            )?;

            payout = bt_amount;
        }

        TradeOutcome::Loss => {
            // Burn the escrowed BT — birex_state owns the escrow so it may sign
            token::burn(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.key(),
                    Burn {
                        mint: ctx.accounts.bt_mint.to_account_info(),
                        from: ctx.accounts.escrow.to_account_info(),
                        authority: ctx.accounts.birex_state.to_account_info(),
                    },
                    signer_seeds,
                ),
                bt_amount,
            )?;

            payout = 0;
        }
    }

    emit!(TradeSettled {
        trader,
        closing_price,
        outcome,
        payout,
    });

    Ok(())
}
