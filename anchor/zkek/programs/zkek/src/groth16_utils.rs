use ark_bn254::g1::G1Affine;
use ark_serialize::{CanonicalDeserialize, CanonicalSerialize, Compress, Validate};
use groth16_solana::{errors::Groth16Error, groth16::Groth16Verifier};
use std::ops::Neg;

use crate::VERIFYING_KEY;

// proof_a (G1 point): bytes 0..64
// proof_b (G2 point): bytes 64..192
// proof_c (G1 point): bytes 192..256
pub fn verify_groth16_proof<const NR_INPUTS: usize>(
    proof: &[u8; 256],
    public_inputs: &[[u8; 32]; NR_INPUTS],
) -> Result<(), Groth16Error> {
    let proof_a = negate_g1_point(&proof[0..64])?;

    let proof_b: [u8; 128] = proof[64..192]
        .try_into()
        .map_err(|_| Groth16Error::InvalidG2Length)?;

    let proof_c: [u8; 64] = proof[192..256]
        .try_into()
        .map_err(|_| Groth16Error::InvalidG1Length)?;

    let mut verifier =
        Groth16Verifier::new(&proof_a, &proof_b, &proof_c, public_inputs, &VERIFYING_KEY)?;

    verifier.verify()
}

fn negate_g1_point(point_bytes: &[u8]) -> Result<[u8; 64], Groth16Error> {
    let le_bytes = change_endianness(point_bytes);

    let point: G1Affine = G1Affine::deserialize_with_mode(
        &*[&le_bytes[..], &[0u8][..]].concat(),
        Compress::No,
        Validate::Yes,
    )
    .map_err(|_| Groth16Error::DecompressingG1Failed)?;

    let negated = point.neg();

    let mut negated_bytes = [0u8; 64];
    negated
        .x
        .serialize_with_mode(&mut negated_bytes[..32], Compress::No)
        .map_err(|_| Groth16Error::DecompressingG1Failed)?;
    negated
        .y
        .serialize_with_mode(&mut negated_bytes[32..64], Compress::No)
        .map_err(|_| Groth16Error::DecompressingG1Failed)?;

    Ok(change_endianness(&negated_bytes)
        .try_into()
        .map_err(|_| Groth16Error::InvalidG1Length)?)
}

fn change_endianness(bytes: &[u8]) -> Vec<u8> {
    let mut vec = Vec::new();
    for b in bytes.chunks(32) {
        for byte in b.iter().rev() {
            vec.push(*byte);
        }
    }
    vec
}
