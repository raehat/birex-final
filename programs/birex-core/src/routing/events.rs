use anchor_lang::prelude::*;

#[event]
pub struct TradeOpened {
    pub trader: Pubkey,
    pub feed_id: [u8; 32],
    pub direction: bool,
    pub strike_price: i64,
    pub start_slot: u64,
    pub end_slot: u64,
    pub bt_amount: u64,
}

#[event]
pub struct TradeSettled {
    pub trader: Pubkey,
    pub closing_price: i64,
    pub outcome: TradeOutcome,
    pub payout: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum TradeOutcome {
    Win,
    Loss,
    Tie,
}
