pragma circom 2.2.3;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/switcher.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template GetPublicKey() {
	signal input secretKey;
	signal output publicKey;

	var keySeed = 6;

	component poseidonComponent = Poseidon(2);
	secretKey ==> poseidonComponent.inputs[0];
	keySeed ==> poseidonComponent.inputs[1];
	poseidonComponent.out ==> publicKey;
}

template ZKek(merkleDepth) {
	// secret witnesses
	signal input secretKey;
	signal input merkleIndex;
	signal input merklePath[merkleDepth];

	// public witnesses
	signal input merkleRoot;
	signal input nullifierHash; // TODO

	// fake witnesses
	// ...

	// Req for public key
	signal publicKey;
	component publicKeyGetter = GetPublicKey();

	// Check Merkle tree root
	signal merkleHash[merkleDepth+1]; // leaf + 1 node per layer
	component hasherMerkle[merkleDepth+1];
	var merkleSeed = 7;
	component n2bMerkleIndex = Num2Bits(merkleDepth); // little-endian
	component switcher[merkleDepth];

	// 3rd check req
	component hasherNullifier;


	// Get public key
	secretKey ==> publicKeyGetter.secretKey;
	publicKeyGetter.publicKey ==> publicKey;


	// Check Merkle tree root
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

	merkleRoot === merkleHash[merkleDepth]

	// 3rd check -- nullifier hash
	hasherNullifier = Poseidon(1);
	secretKey ==> hasherNullifier.inputs[0];
	hasherNullifier.out === nullifierHash;

	// Dummy checks
	// ...
}

component main{public [merkleRoot, nullifierHash]} = ZKek(3);
