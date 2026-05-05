use anchor_lang::prelude::*;

declare_id!("4ppdMWYwx6PVH3W25vC8xpstzxYhQnGQL766TA6TWjCW");

#[program]
pub mod session_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.owner = ctx.accounts.owner.key();
        counter.count = 0;
        counter.bump = ctx.bumps.counter;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter.count = ctx
            .accounts
            .counter
            .count
            .checked_add(1)
            .ok_or(CounterError::Overflow)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + CounterState::SIZE,
        seeds = [b"counter", owner.key().as_ref()],
        bump,
    )]
    pub counter: Account<'info, CounterState>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"counter", owner.key().as_ref()],
        bump = counter.bump,
        has_one = owner,
    )]
    pub counter: Account<'info, CounterState>,
}

#[account]
pub struct CounterState {
    pub owner: Pubkey,
    pub count: u64,
    pub bump: u8,
}

impl CounterState {
    pub const SIZE: usize = 32 + 8 + 1;
}

#[error_code]
pub enum CounterError {
    #[msg("Counter overflow")]
    Overflow,
}
