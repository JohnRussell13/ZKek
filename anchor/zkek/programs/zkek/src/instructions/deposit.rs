use anchor_lang::prelude::*;

use crate::{ACTIVE_ROOTS, MAX_LEAVES, MERKLE_TREE_SEED, TRANSFER_AMOUNT_LAMPORTS, error::ErrorCode, state::MerkleTree};

#[event_cpi]
#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [MERKLE_TREE_SEED.as_bytes()],
        bump = merkle_tree.bump
    )]
    pub merkle_tree: Account<'info, MerkleTree>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<Deposit>,
    new_root: [u8; 32],
    old_root: [u8; 32],
    leaf_index: u32,
) -> Result<()> {
    let merkle_tree = &mut ctx.accounts.merkle_tree;

    if merkle_tree.current_leaf_index >= MAX_LEAVES {                                                                                                               
      return err!(ErrorCode::TreeFull);                                                                                                                           
    }              

    if merkle_tree.current_leaf_index + 1 != leaf_index {                                                                                                           
        return err!(ErrorCode::WrongLeafIndex);                                                                                                                     
    }

    let current_root_index = merkle_tree.current_root_index as usize % ACTIVE_ROOTS;
    if merkle_tree.active_roots[current_root_index] != old_root {
        return err!(ErrorCode::OldRootNotActive);
    }

    anchor_lang::system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.signer.to_account_info(),
                to: merkle_tree.to_account_info(),
            },
        ),
        TRANSFER_AMOUNT_LAMPORTS,
    )?;

    merkle_tree.current_root_index += 1;
    let next_index = merkle_tree.current_root_index as usize % ACTIVE_ROOTS;
    merkle_tree.active_roots[next_index] = new_root;
    merkle_tree.current_leaf_index += 1;

    emit_cpi!(DepositEvent { new_root: new_root });

    Ok(())
}

#[event]
pub struct DepositEvent {
    pub new_root: [u8; 32],
}