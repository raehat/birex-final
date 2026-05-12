use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::routing::{
    errors::BirexError,
    events::TradeOpened,
    pyth::parse_price_update,
    state::{BirexState, TradeState, BIREX_STATE_SEED, ESCROW_SEED, TRADE_SEED},
};

#[derive(Accounts)]
pub struct Trade<'info> {
    #[account(mut)]
    pub trader: Signer<'info>,

    #[account(
        seeds = [BIREX_STATE_SEED],
        bump = birex_state.bump,
    )]
    pub birex_state: Account<'info, BirexState>,

    /// Created fresh for each trade; its existence enforces one-active-trade-per-user.
    /// Closed (rent refunded) on settlement so the trader can open a new trade.
    #[account(
        init,
        payer = trader,
        space = TradeState::LEN,
        seeds = [TRADE_SEED, trader.key().as_ref()],
        bump,
    )]
    pub trade_state: Account<'info, TradeState>,

    /// Escrow token account that holds the staked BT while the trade is live.
    /// Uses init_if_needed so it persists across trade cycles (zero-balance reuse).
    #[account(
        init_if_needed,
        payer = trader,
        token::mint = bt_mint,
        token::authority = birex_state,
        seeds = [ESCROW_SEED, trader.key().as_ref()],
        bump,
    )]
    pub escrow: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = bt_mint.key() == birex_state.bt_mint @ BirexError::WrongMint,
    )]
    pub bt_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = trader_bt_account.mint == birex_state.bt_mint @ BirexError::WrongMint,
        constraint = trader_bt_account.owner == trader.key(),
    )]
    pub trader_bt_account: Account<'info, TokenAccount>,

    /// CHECK: owner verified against birex_state.pyth_receiver_program in handler.
    pub price_update: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<Trade>,
    end_slot: u64,
    bt_amount: u64,
    feed_id: [u8; 32],
    direction: bool,
) -> Result<()> {
    require!(bt_amount > 0, BirexError::ZeroAmount);

    // Validate and parse price proof
    let price_update = &ctx.accounts.price_update;
    require!(
        price_update.owner == &ctx.accounts.birex_state.pyth_receiver_program,
        BirexError::WrongPythProgram
    );
    let price_data = parse_price_update(&price_update.data.borrow())?;

    // price_data.feed_id must match the asset the user claims to trade
    require!(price_data.feed_id == feed_id, BirexError::FeedIdMismatch);

    let current_slot = Clock::get()?.slot;
    let state = &ctx.accounts.birex_state;

    // Reject stale transaction: price proof must be recent
    require!(
        price_data.posted_slot
            >= current_slot.saturating_sub(state.slot_tolerance),
        BirexError::StaleProof
    );

    // end_slot must be within [current+min, current+max]
    require!(
        end_slot >= current_slot + state.min_duration_slots
            && end_slot <= current_slot + state.max_duration_slots,
        BirexError::InvalidEndSlot
    );

    // Transfer BT into escrow (hold, not burn)
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.trader_bt_account.to_account_info(),
                to: ctx.accounts.escrow.to_account_info(),
                authority: ctx.accounts.trader.to_account_info(),
            },
        ),
        bt_amount,
    )?;

    // Record trade
    let ts = &mut ctx.accounts.trade_state;
    ts.trader = ctx.accounts.trader.key();
    ts.feed_id = feed_id;
    ts.direction = direction;
    ts.strike_price = price_data.price;
    ts.start_slot = price_data.posted_slot;
    ts.end_slot = end_slot;
    ts.bt_amount = bt_amount;
    ts.bump = ctx.bumps.trade_state;
    ts.escrow_bump = ctx.bumps.escrow;

    emit!(TradeOpened {
        trader: ctx.accounts.trader.key(),
        feed_id,
        direction,
        strike_price: price_data.price,
        start_slot: price_data.posted_slot,
        end_slot,
        bt_amount,
    });

    Ok(())
}
