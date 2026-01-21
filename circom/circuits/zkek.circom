pragma circom 2.2.3;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/switcher.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template CheckSecretKey() {
	signal input secretKey;
	signal input publicKey;

	component poseidonComponent = Poseidon(1);
	secretKey ==> poseidonComponent.inputs[0];
	publicKey === poseidonComponent.out;
}

template ZKek(merkleDepth) {
	// secret witnesses
	signal input secretKey;
	signal input publicKey;
	signal input merkleIndex;
	signal input merklePath[merkleDepth];

	// public witnesses
	signal input merkleRoot;

	// 1st check req
	component keyChecker = CheckSecretKey();

	// 2nd check req
	signal merkleHash[merkleDepth+1]; // leaf + 1 node per layer
	component hasherMerkle[merkleDepth+1];
	var merkleSeed = 67;
	component n2bMerkleIndex = Num2Bits(merkleDepth); // little-endian
	component switcher[merkleDepth];

	// CHECKS

	// 1st check -- keys
	secretKey ==> keyChecker.secretKey;
	publicKey ==> keyChecker.publicKey;


	// 2nd check -- Merkle root
	merkleIndex ==> n2bMerkleIndex.in;

	hasherMerkle[0] = Poseidon(2);
	publicKey ==> hasherMerkle[0].inputs[0];
	merkleSeed ==> hasherMerkle[0].inputs[1];
	hasherMerkle[0].out ==> merkleHash[0];

	for (var i = 0; i < merkleDepth; i++) {
		switcher[i] = Switcher();
		n2bMerkleIndex.out[i] ==> switcher[i].sel;
		merkleHash[i] ==> switcher[i].L;
		merklePath[i] ==> switcher[i].R;

		hasherMerkle[i+1] = Poseidon(2);
		switcher[i].outL ==> hasherMerkle[i+1].inputs[0];
		switcher[i].outR ==> hasherMerkle[i+1].inputs[1];
		hasherMerkle[i+1].out ==> merkleHash[i+1];
	}

}

component main{public [merkleRoot]} = ZKek(3);
