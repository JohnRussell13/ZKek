use anchor_lang::prelude::*;
use crate::{error::ErrorCode, groth16_utils::verify_groth16_proof};

#[derive(Accounts)]
pub struct Initialize {}

pub fn handler(
    ctx: Context<Initialize>, 
    proof: &[u8; 256],
    public_inputs: &[[u8; 32]; 2],
) -> Result<()> {
    verify_groth16_proof::<2>(proof, public_inputs).map_err(|_| ErrorCode::InvalidProof)?;
    Ok(())
}
