use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Nullifier {
    pub is_spent: bool,
    pub bump: u8,
}
