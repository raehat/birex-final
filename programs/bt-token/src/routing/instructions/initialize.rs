use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::routing::state::{State, STATE_SEED, VAULT_SEED};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = State::LEN,
        seeds = [STATE_SEED],
        bump,
    )]
    pub state: Account<'info, State>,

    /// Pre-created with `state` PDA as mint authority
    #[account(mut)]
    pub bt_mint: Account<'info, Mint>,

    /// USDC mint (mainnet: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)
    pub usdc_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = usdc_mint,
        token::authority = state,
        seeds = [VAULT_SEED],
        bump,
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<Initialize>, bt_decimals: u8) -> Result<()> {
    let state = &mut ctx.accounts.state;
    state.admin = ctx.accounts.authority.key();
    state.bt_mint = ctx.accounts.bt_mint.key();
    state.usdc_mint = ctx.accounts.usdc_mint.key();
    state.vault = ctx.accounts.vault.key();
    state.authorized_minter = Pubkey::default();
    state.corpus = 0;
    state.total_bt_minted = 0;
    state.bump = ctx.bumps.state;
    state.vault_bump = ctx.bumps.vault;
    state.bt_decimals = bt_decimals;
    Ok(())
}