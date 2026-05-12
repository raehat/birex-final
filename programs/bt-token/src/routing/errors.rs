use anchor_lang::prelude::*;

#[error_code]
pub enum BtError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Arithmetic overflow")]
    MathOverflow,
    #[msg("Resulting amount is too small (rounds to zero)")]
    TooSmallAmount,
    #[msg("Vault has insufficient USDC to fulfil redemption")]
    InsufficientVault,
    #[msg("Wrong mint address")]
    WrongMint,
    #[msg("Wrong vault address")]
    WrongVault,
    #[msg("Wrong token account owner")]
    WrongOwner,
    #[msg("Caller is not the authorized minter")]
    Unauthorized,
    #[msg("Authorized minter is not set")]
    MinterNotSet,
}