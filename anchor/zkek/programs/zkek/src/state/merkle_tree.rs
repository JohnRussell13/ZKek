use anchor_lang::prelude::*;
use crate::ACTIVE_ROOTS;

#[account]
#[derive(InitSpace)]
pub struct MerkleTree {
    pub active_roots: [[u8; 32]; ACTIVE_ROOTS],
    pub current_leaf_index: u32,
    pub current_root_index: u32,
    pub bump: u8,
}