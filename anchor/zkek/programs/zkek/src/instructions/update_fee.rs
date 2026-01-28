use anchor_lang::prelude::*;

use crate::{error::ErrorCode, state::GlobalState, GLOBAL_STATE_SEED};

#[derive(Accounts)]
pub struct UpdateFee<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED.as_bytes()],
        bump = global_state.bump,
        constraint = global_state.admin == admin.key() @ ErrorCode::InvalidAdmin
    )]
    pub global_state: Account<'info, GlobalState>,
}

pub fn handler(ctx: Context<UpdateFee>, new_fee: u16) -> Result<()> {
    ctx.accounts.global_state.fee = new_fee;

    Ok(())
}
