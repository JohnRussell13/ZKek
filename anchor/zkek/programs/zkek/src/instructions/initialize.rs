use anchor_lang::prelude::*;

use crate::{ACTIVE_ROOTS, ANCHOR_DISCRIMINATOR, GLOBAL_STATE_SEED, MERKLE_TREE_SEED, program::Zkek, state::{GlobalState, MerkleTree}};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        constraint = program.programdata_address()? == Some(program_data.key())
    )]
    pub program: Program<'info, Zkek>,

    #[account(
        constraint = program_data.upgrade_authority_address == Some(authority.key())
    )]
    pub program_data: Account<'info, ProgramData>,

    #[account(
        init,
        payer = authority,
        space = ANCHOR_DISCRIMINATOR + GlobalState::INIT_SPACE,
        seeds = [GLOBAL_STATE_SEED.as_bytes()],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        init,
        payer = authority,
        space = ANCHOR_DISCRIMINATOR + MerkleTree::INIT_SPACE,
        seeds = [MERKLE_TREE_SEED.as_bytes()],
        bump
    )]
    pub merkle_tree: Account<'info, MerkleTree>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<Initialize>,
    fee: u16, 
) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;
    let merkle_tree = &mut ctx.accounts.merkle_tree;

    global_state.admin = *ctx.accounts.authority.key;
    global_state.fee = fee;
    global_state.bump = ctx.bumps.global_state;

    // TODO: change with the merkle root of hashes of empty leaves
    let initial_root = [0; 32];
    merkle_tree.current_leaf_index = 0;
    merkle_tree.current_root_index = 0;
    merkle_tree.active_roots = [[0; 32]; ACTIVE_ROOTS];
    merkle_tree.active_roots[0] = initial_root;
    merkle_tree.bump = ctx.bumps.merkle_tree;

    Ok(())
}
