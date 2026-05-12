use anchor_lang::prelude::*;

pub const BIREX_STATE_SEED: &[u8] = b"birex_state";
pub const TRADE_SEED: &[u8] = b"trade";
pub const ESCROW_SEED: &[u8] = b"escrow";

/// Global config PDA — seeds: ["birex_state"]
#[account]
pub struct BirexState {
    pub admin: Pubkey,               // 32
    pub bt_mint: Pubkey,             // 32
    pub bt_token_state: Pubkey,      // 32 — bt-token State PDA (for CPI)
    pub pyth_receiver_program: Pubkey, // 32 — expected owner of PriceUpdateV2 accounts
    pub slot_tolerance: u64,         // 8  — max slots a trade tx can be in-flight (default 2)
    pub min_duration_slots: u64,     // 8  — min trade window ≈ 5 s (default 13)
    pub max_duration_slots: u64,     // 8  — max trade window ≈ 1 min (default 150)
    pub bump: u8,                    // 1
    pub _padding: [u8; 7],           // 7
}

impl BirexState {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 8 + 8 + 8 + 1 + 7;
}

/// Per-user active trade — seeds: ["trade", trader]
/// Account is closed (rent returned) on settlement, allowing re-trade.
#[account]
pub struct TradeState {
    pub trader: Pubkey,      // 32
    pub feed_id: [u8; 32],   // 32 — Pyth feed ID for the asset
    pub direction: bool,     // 1  — true = UP, false = DOWN
    pub strike_price: i64,   // 8
    pub start_slot: u64,     // 8
    pub end_slot: u64,       // 8
    pub bt_amount: u64,      // 8
    pub bump: u8,            // 1
    pub escrow_bump: u8,     // 1
    pub _padding: [u8; 5],   // 5
}

impl TradeState {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 8 + 8 + 8 + 8 + 1 + 1 + 5;
}
