pub mod constants;
pub mod error;
pub mod groth16_utils;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;

declare_id!("zKekB3jevvdaYM9HbQ4eqJq7kX6eqoGzVrBKkmUyK1k");

#[program]
pub mod zkek {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, fee: u16) -> Result<()> {
        initialize::handler(ctx, fee)
    }

    pub fn deposit(
        ctx: Context<Deposit>,
        new_root: [u8; 32],
        old_root: [u8; 32],
        leaf_index: u32,
        proof: [u8; 256],
    ) -> Result<()> {
        deposit::handler(ctx, new_root, old_root, leaf_index)
    }

    pub fn withdraw(
        ctx: Context<Withdraw>,
        nullifier: [u8; 32],
        root: [u8; 32],
        proof: [u8; 256],
    ) -> Result<()> {
        withdraw::handler(ctx, nullifier, root, proof)
    }

    pub fn update_fee(ctx: Context<UpdateFee>, new_fee: u16) -> Result<()> {
        update_fee::handler(ctx, new_fee)
    }

    // TODO: update active roots
}
