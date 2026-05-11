use crate::routing::errors::BtError;
use anchor_lang::prelude::*;

/// bt_out = total_bt * usdc_in / corpus     (or 1:1 if corpus == 0)
pub fn compute_mint_amount(corpus: u64, total_bt: u64, usdc_in: u64) -> Result<u64> {
    if corpus == 0 || total_bt == 0 {
        return Ok(usdc_in);
    }
    let numerator = (total_bt as u128)
        .checked_mul(usdc_in as u128)
        .ok_or(BtError::MathOverflow)?;
    let result = numerator
        .checked_div(corpus as u128)
        .ok_or(BtError::MathOverflow)?;
    require!(result > 0, BtError::TooSmallAmount);
    Ok(result as u64)
}

/// usdc_out = corpus * bt_in / total_bt     (or 1:1 if corpus == 0)
pub fn compute_burn_amount(corpus: u64, total_bt: u64, bt_in: u64) -> Result<u64> {
    if corpus == 0 || total_bt == 0 {
        return Ok(bt_in);
    }
    let numerator = (corpus as u128)
        .checked_mul(bt_in as u128)
        .ok_or(BtError::MathOverflow)?;
    let result = numerator
        .checked_div(total_bt as u128)
        .ok_or(BtError::MathOverflow)?;
    require!(result > 0, BtError::TooSmallAmount);
    Ok(result as u64)
}