pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod groth16_utils;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;

declare_id!("zKekB3jevvdaYM9HbQ4eqJq7kX6eqoGzVrBKkmUyK1k");

#[program]
pub mod zkek {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }
}
