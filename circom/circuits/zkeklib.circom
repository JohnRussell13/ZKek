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

template MerkleTreeHash() {
	signal input n2bMerkleIndexBit;
	signal input merkleHash;
	signal input merklePath;
	signal output out;

	component switcher = Switcher();
	n2bMerkleIndexBit ==> switcher.sel;
	merkleHash ==> switcher.L;
	merklePath ==> switcher.R;

	component poseidonComponent = Poseidon(2);
	switcher.outL ==> poseidonComponent.inputs[0];
	switcher.outR ==> poseidonComponent.inputs[1];
	poseidonComponent.out ==> out;
}

template MerkleTreeCheck(merkleDepth) {
	signal input merkleRoot;
	signal input merkleIndex;
	signal input merklePath[merkleDepth];
	signal input publicKey;

	signal merkleHash[merkleDepth+1]; // leaf + 1 node per layer
	var merkleSeed = 7;

	component n2bMerkleIndex = Num2Bits(merkleDepth); // little-endian
	merkleIndex ==> n2bMerkleIndex.in;

	component poseidonComponent = Poseidon(2);
	publicKey ==> poseidonComponent.inputs[0];
	merkleSeed ==> poseidonComponent.inputs[1];
	poseidonComponent.out ==> merkleHash[0];

	component merkleTreeHasher[merkleDepth];
	for (var i = 0; i < merkleDepth; i++) {
		merkleTreeHasher[i] = MerkleTreeHash();
		n2bMerkleIndex.out[i] ==> merkleTreeHasher[i].n2bMerkleIndexBit;
		merkleHash[i] ==> merkleTreeHasher[i].merkleHash;
		merklePath[i] ==> merkleTreeHasher[i].merklePath;
		merkleTreeHasher[i].out ==> merkleHash[i+1];
	}

	merkleRoot === merkleHash[merkleDepth];
}

template NullifierCheck() {
	signal input secretKey;
	signal input nullifierHash;

	component poseidonComponent = Poseidon(1);
	secretKey ==> poseidonComponent.inputs[0];
	poseidonComponent.out === nullifierHash;
}
