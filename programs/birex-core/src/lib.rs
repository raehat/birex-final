use anchor_lang::prelude::*;

pub mod routing;

pub use routing::instructions::initialize::*;
pub use routing::instructions::settle_trade::*;
pub use routing::instructions::trade::*;

// Placeholder — replace with `anchor keys list` output after first build.
declare_id!("37pwz8ZyR8wZ8KteXcX6cr4oEmguL9miwPMzHGZBGELp");

#[program]
pub mod birex_core {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        bt_mint: Pubkey,
        bt_token_state: Pubkey,
        pyth_receiver_program: Pubkey,
        slot_tolerance: u64,
        min_duration_slots: u64,
        max_duration_slots: u64,
    ) -> Result<()> {
        routing::instructions::initialize::handler(
            ctx,
            bt_mint,
            bt_token_state,
            pyth_receiver_program,
            slot_tolerance,
            min_duration_slots,
            max_duration_slots,
        )
    }

    /// Place a binary options trade.
    ///
    /// `end_slot`  — the Solana slot at which the trade expires (must satisfy
    ///               current+min_duration ≤ end_slot ≤ current+max_duration).
    /// `bt_amount` — BT tokens to stake (held in escrow; NOT burnt yet).
    /// `feed_id`   — 32-byte Pyth feed ID for the asset being traded.
    /// `direction` — true = UP (win if closing > strike), false = DOWN.
    /// `price_update` — Pyth PriceUpdateV2 account supplying the entry price.
    pub fn trade(
        ctx: Context<Trade>,
        end_slot: u64,
        bt_amount: u64,
        feed_id: [u8; 32],
        direction: bool,
    ) -> Result<()> {
        routing::instructions::trade::handler(ctx, end_slot, bt_amount, feed_id, direction)
    }

    /// Settle an expired trade.  Anyone may call this; payout always goes to the
    /// original trader, never to the caller.
    ///
    /// `trader`       — pubkey of the trader whose trade is being settled.
    /// `price_update` — Pyth PriceUpdateV2 account for the closing price.
    pub fn settle_trade(ctx: Context<SettleTrade>, trader: Pubkey) -> Result<()> {
        routing::instructions::settle_trade::handler(ctx, trader)
    }
}
