use anchor_lang::prelude::*;

use crate::routing::{errors::BtError, state::{State, STATE_SEED}};

#[derive(Accounts)]
pub struct SetAuthorizedMinter<'info> {
    #[account(
        constraint = admin.key() == state.admin @ BtError::Unauthorized,
    )]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [STATE_SEED],
        bump = state.bump,
    )]
    pub state: Account<'info, State>,
}

pub fn handler(ctx: Context<SetAuthorizedMinter>, minter: Pubkey) -> Result<()> {
    ctx.accounts.state.authorized_minter = minter;
    Ok(())
}
