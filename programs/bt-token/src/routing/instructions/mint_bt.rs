use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};

use crate::{
    routing::errors::BtError,
    routing::events::MintEvent,
    routing::math::compute_mint_amount,
    routing::state::{State, STATE_SEED, VAULT_SEED},
};

#[derive(Accounts)]
pub struct MintBT<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

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
        seeds = [VAULT_SEED],
        bump = state.vault_bump,
        constraint = vault.key() == state.vault @ BtError::WrongVault,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_usdc_account.mint == state.usdc_mint @ BtError::WrongMint,
        constraint = user_usdc_account.owner == user.key() @ BtError::WrongOwner,
    )]
    pub user_usdc_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_bt_account.mint == state.bt_mint @ BtError::WrongMint,
        constraint = user_bt_account.owner == user.key() @ BtError::WrongOwner,
    )]
    pub user_bt_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<MintBT>, usdc_amount: u64) -> Result<()> {
    require!(usdc_amount > 0, BtError::ZeroAmount);

    let state = &ctx.accounts.state;
    let bt_out = compute_mint_amount(state.corpus, state.total_bt_minted, usdc_amount)?;

    // Transfer USDC user → vault
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.key(),
            Transfer {
                from: ctx.accounts.user_usdc_account.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        usdc_amount,
    )?;

    // Mint BT to user
    let bump = state.bump;
    let signer_seeds: &[&[&[u8]]] = &[&[STATE_SEED, &[bump]]];

    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.key(),
            MintTo {
                mint: ctx.accounts.bt_mint.to_account_info(),
                to: ctx.accounts.user_bt_account.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
            signer_seeds,
        ),
        bt_out,
    )?;

    // Update state
    let state = &mut ctx.accounts.state;
    state.corpus = state
        .corpus
        .checked_add(usdc_amount)
        .ok_or(BtError::MathOverflow)?;
    state.total_bt_minted = state
        .total_bt_minted
        .checked_add(bt_out)
        .ok_or(BtError::MathOverflow)?;

    emit!(MintEvent {
        user: ctx.accounts.user.key(),
        usdc_in: usdc_amount,
        bt_out,
        corpus_after: state.corpus,
        total_bt_after: state.total_bt_minted,
    });

    Ok(())
}