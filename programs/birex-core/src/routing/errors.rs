use anchor_lang::prelude::*;

#[error_code]
pub enum BirexError {
    #[msg("endSlot must be between currentSlot+5s and currentSlot+1min")]
    InvalidEndSlot,
    #[msg("Price proof is stale (startSlot too far behind current slot)")]
    StaleProof,
    #[msg("Trader already has an active trade")]
    ActiveTradeExists,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Arithmetic overflow")]
    MathOverflow,
    #[msg("Price proof account is not owned by the expected Pyth receiver program")]
    WrongPythProgram,
    #[msg("Price proof data is malformed or too short")]
    InvalidPriceProof,
    #[msg("Closing price proof feed ID does not match the trade's feed ID")]
    FeedIdMismatch,
    #[msg("Closing slot in price proof does not match the trade end slot")]
    WrongCloseSlot,
    #[msg("Wrong trader address")]
    TraderMismatch,
    #[msg("Wrong BT mint")]
    WrongMint,
    #[msg("Wrong bt-token State account")]
    WrongBtTokenState,
}
