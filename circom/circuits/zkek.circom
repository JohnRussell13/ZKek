pragma circom 2.2.3;

include "../node_modules/circomlib/circuits/poseidon.circom";

template CheckSecretKey() {
	signal input secretKey;
	signal input publicKey;

	var seed = 67;

	component poseidonComponent = Poseidon(2);
	poseidonComponent.inputs[0] <== secretKey;
	poseidonComponent.inputs[1] <== seed;
	publicKey === poseidonComponent.out;
}

template ZKek(merkleDepth) {
	// secret witnesses
	signal input secretKey;
	signal input publicKey;
//	signal input merkleIndex;
//	signal input merklePath[merkleDepth];

	// public witnesses
//	signal input merkleRoot;

	component keyChecker = CheckSecretKey();
	keyChecker.secretKey <== secretKey;
	keyChecker.publicKey <== publicKey;

}

component main{public [merkleRoot]} = ZKek(20);
