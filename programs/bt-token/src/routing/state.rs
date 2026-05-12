use anchor_lang::prelude::*;

pub const STATE_SEED: &[u8] = b"bt_state";
pub const VAULT_SEED: &[u8] = b"bt_vault";

#[account]
pub struct State {
    pub admin: Pubkey,             // 32
    pub bt_mint: Pubkey,           // 32
    pub usdc_mint: Pubkey,         // 32
    pub vault: Pubkey,             // 32
    pub authorized_minter: Pubkey, // 32 — birex-core State PDA
    pub corpus: u64,               // 8  — total USDC held
    pub total_bt_minted: u64,      // 8  — circulating BT supply
    pub bump: u8,                  // 1
    pub vault_bump: u8,            // 1
    pub bt_decimals: u8,           // 1
    pub _padding: [u8; 5],         // 5
}

impl State {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 32 + 8 + 8 + 1 + 1 + 1 + 5;
}