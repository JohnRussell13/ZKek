use anchor_lang::prelude::*;

use crate::{ANCHOR_DISCRIMINATOR, BASIS_POINTS, GLOBAL_STATE_SEED, MERKLE_TREE_SEED, NULLIFIER_SEED, TRANSFER_AMOUNT_LAMPORTS, error::ErrorCode, groth16_utils::verify_groth16_proof, state::{GlobalState, MerkleTree, Nullifier}};

#[derive(Accounts)]
#[instruction(nullifier:[u8; 32])]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        seeds = [GLOBAL_STATE_SEED.as_bytes()],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [MERKLE_TREE_SEED.as_bytes()],
        bump = merkle_tree.bump
    )]
    pub merkle_tree: Account<'info, MerkleTree>,

    #[account(
        init,
        payer = signer,
        space = ANCHOR_DISCRIMINATOR + Nullifier::INIT_SPACE,
        seeds = [NULLIFIER_SEED.as_bytes(), &nullifier],
        bump
    )]
    pub nullifier_account: Account<'info, Nullifier>,

    pub admin: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<Withdraw>,
    nullifier: [u8; 32],
    root: [u8; 32],
    proof: [u8; 256],
) -> Result<()> {
    if ctx.accounts.admin.key() != ctx.accounts.global_state.admin {
        return err!(ErrorCode::InvalidAdmin);
    }

    if !ctx.accounts.merkle_tree.active_roots.iter().any(|active_root| active_root == &root) {
        return err!(ErrorCode::OldRootNotActive);
    }

    let public_inputs = [root, nullifier];
    verify_groth16_proof(&proof, &public_inputs)
        .map_err(|_| error!(ErrorCode::InvalidProof))?;

    let fee_amount = TRANSFER_AMOUNT_LAMPORTS
        * ctx.accounts.global_state.fee as u64
        / BASIS_POINTS as u64;
    let recipient_amount = TRANSFER_AMOUNT_LAMPORTS - fee_amount;

    let recipient_account_info = ctx.accounts.signer.to_account_info();
    let admin_account_info = ctx.accounts.admin.to_account_info();
    let merkle_tree_account_info = ctx.accounts.merkle_tree.to_account_info();

    **merkle_tree_account_info.try_borrow_mut_lamports()? -= TRANSFER_AMOUNT_LAMPORTS;
    **recipient_account_info.try_borrow_mut_lamports()? += recipient_amount;
    **admin_account_info.try_borrow_mut_lamports()? += fee_amount;

    Ok(())
}
