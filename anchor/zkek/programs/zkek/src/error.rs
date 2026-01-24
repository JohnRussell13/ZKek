use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Custom error message")]
    CustomError,
    #[msg("Invalid Groth16 proof")]
    InvalidProof,
    #[msg("Wrong leaf index")]
    WrongLeafIndex,
    #[msg("Old root not found in active roots")]
    OldRootNotActive,
    #[msg("Invalid admin")]
    InvalidAdmin,
    #[msg("Tree is full")]
    TreeFull,
}
