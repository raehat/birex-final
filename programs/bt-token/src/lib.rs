use anchor_lang::prelude::*;
pub mod routing;

pub use routing::instructions::burn_bt::*;
pub use routing::instructions::initialize::*;
pub use routing::instructions::mint_bt::*;

declare_id!("2Jts3AVjULjhJBsQBWHCQCRpZ4F9PX3odewcbN4hKrXi");

#[program]
pub mod bt_token {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, bt_decimals: u8) -> Result<()> {
        routing::instructions::initialize::handler(ctx, bt_decimals)
    }

    pub fn mint_bt(ctx: Context<MintBT>, usdc_amount: u64) -> Result<()> {
        routing::instructions::mint_bt::handler(ctx, usdc_amount)
    }

    pub fn burn_bt(ctx: Context<BurnBT>, bt_amount: u64) -> Result<()> {
        routing::instructions::burn_bt::handler(ctx, bt_amount)
    }
}