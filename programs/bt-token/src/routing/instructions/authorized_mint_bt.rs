use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

use crate::routing::{
    errors::BtError,
    events::ProtocolMintEvent,
    state::{State, STATE_SEED},
};

#[derive(Accounts)]
pub struct AuthorizedMintBt<'info> {
    /// Must be the stored authorized_minter PDA (birex-core State PDA signs via CPI).
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [STATE_SEED],
        bump = state.bump,
    )]
    pub state: Account<'info, State>,

    #[account(
        mut,
        constraint = bt_mint.key() == state.bt_mint @ BtError::WrongMint,
    )]
    pub bt_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = recipient_bt_account.mint == state.bt_mint @ BtError::WrongMint,
    )]
    pub recipient_bt_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<AuthorizedMintBt>, amount: u64) -> Result<()> {
    require!(amount > 0, BtError::ZeroAmount);
    require!(
        ctx.accounts.state.authorized_minter != Pubkey::default(),
        BtError::MinterNotSet
    );
    require!(
        ctx.accounts.authority.key() == ctx.accounts.state.authorized_minter,
        BtError::Unauthorized
    );

    let bump = ctx.accounts.state.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[STATE_SEED, &[bump]]];

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            MintTo {
                mint: ctx.accounts.bt_mint.to_account_info(),
                to: ctx.accounts.recipient_bt_account.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    let state = &mut ctx.accounts.state;
    state.total_bt_minted = state
        .total_bt_minted
        .checked_add(amount)
        .ok_or(BtError::MathOverflow)?;

    emit!(ProtocolMintEvent {
        recipient: ctx.accounts.recipient_bt_account.owner,
        amount,
        total_bt_after: state.total_bt_minted,
    });

    Ok(())
}
