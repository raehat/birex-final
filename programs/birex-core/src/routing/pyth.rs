use anchor_lang::prelude::*;

use crate::routing::errors::BirexError;

/// Minimal fields extracted from a Pyth PriceUpdateV2 account.
pub struct PriceData {
    pub feed_id: [u8; 32],
    pub price: i64,
    pub posted_slot: u64,
}

/// Parses the relevant fields from a raw PriceUpdateV2 account data slice.
///
/// PriceUpdateV2 Borsh layout (no alignment padding):
///   [0..8]   Anchor discriminator
///   [8..40]  write_authority (Pubkey, 32 bytes)
///   [40]     VerificationLevel discriminant: 0=Partial, 1=Full
///   [41]     num_signatures (only present if Partial)
///   [41 or 42..] PriceFeedMessage:
///     feed_id: [u8; 32]
///     price:   i64  (8)
///     conf:    u64  (8)
///     exponent: i32 (4)
///     publish_time:      i64 (8)
///     prev_publish_time: i64 (8)
///     ema_price: i64 (8)
///     ema_conf:  u64 (8)   — total 84 bytes
///   posted_slot: u64 (8)
pub fn parse_price_update(data: &[u8]) -> Result<PriceData> {
    require!(data.len() >= 133, BirexError::InvalidPriceProof);

    let ver_disc = data[40];
    // Full = discriminant 1, occupies 1 byte. Partial = discriminant 0, occupies 2 bytes.
    let msg_offset: usize = if ver_disc == 1 { 41 } else { 42 };

    require!(
        data.len() >= msg_offset + 84 + 8,
        BirexError::InvalidPriceProof
    );

    let feed_id: [u8; 32] = data[msg_offset..msg_offset + 32]
        .try_into()
        .map_err(|_| error!(BirexError::InvalidPriceProof))?;

    let price = i64::from_le_bytes(
        data[msg_offset + 32..msg_offset + 40]
            .try_into()
            .map_err(|_| error!(BirexError::InvalidPriceProof))?,
    );

    // PriceFeedMessage is 84 bytes total; posted_slot follows immediately after.
    let posted_slot_offset = msg_offset + 84;
    let posted_slot = u64::from_le_bytes(
        data[posted_slot_offset..posted_slot_offset + 8]
            .try_into()
            .map_err(|_| error!(BirexError::InvalidPriceProof))?,
    );

    Ok(PriceData {
        feed_id,
        price,
        posted_slot,
    })
}
