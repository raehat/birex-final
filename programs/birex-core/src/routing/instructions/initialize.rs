use anchor_lang::prelude::*;

use crate::routing::state::{BirexState, BIREX_STATE_SEED};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = BirexState::LEN,
        seeds = [BIREX_STATE_SEED],
        bump,
    )]
    pub birex_state: Account<'info, BirexState>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<Initialize>,
    bt_mint: Pubkey,
    bt_token_state: Pubkey,
    pyth_receiver_program: Pubkey,
    slot_tolerance: u64,
    min_duration_slots: u64,
    max_duration_slots: u64,
) -> Result<()> {
    let state = &mut ctx.accounts.birex_state;
    state.admin = ctx.accounts.admin.key();
    state.bt_mint = bt_mint;
    state.bt_token_state = bt_token_state;
    state.pyth_receiver_program = pyth_receiver_program;
    state.slot_tolerance = slot_tolerance;
    state.min_duration_slots = min_duration_slots;
    state.max_duration_slots = max_duration_slots;
    state.bump = ctx.bumps.birex_state;
    Ok(())
}
