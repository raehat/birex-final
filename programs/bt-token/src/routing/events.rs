use anchor_lang::prelude::*;

#[event]
pub struct ProtocolMintEvent {
    pub recipient: Pubkey,
    pub amount: u64,
    pub total_bt_after: u64,
}

#[event]
pub struct MintEvent {
    pub user: Pubkey,
    pub usdc_in: u64,
    pub bt_out: u64,
    pub corpus_after: u64,
    pub total_bt_after: u64,
}

#[event]
pub struct BurnEvent {
    pub user: Pubkey,
    pub bt_in: u64,
    pub usdc_out: u64,
    pub corpus_after: u64,
    pub total_bt_after: u64,
}