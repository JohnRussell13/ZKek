pragma circom 2.2.3;

include "./zkeklib.circom";

template Withdraw(merkleDepth) {
	signal input secretKey;
	signal input merkleIndex;
	signal input merklePath[merkleDepth];

	signal input merkleRoot;
	signal input nullifierHash;

	component publicKeyGetter = GetPublicKey();
	secretKey ==> publicKeyGetter.secretKey;
	signal publicKey <== publicKeyGetter.publicKey;

	component merkleTreeChecker = MerkleTreeCheck(merkleDepth);
	merkleRoot ==> merkleTreeChecker.merkleRoot;
	merkleIndex ==> merkleTreeChecker.merkleIndex;
	merklePath ==> merkleTreeChecker.merklePath;
	publicKey ==> merkleTreeChecker.publicKey;

	component nullifierChecker = NullifierCheck();
	secretKey ==> nullifierChecker.secretKey;
	nullifierHash ==> nullifierChecker.nullifierHash;
}

component main{public [merkleRoot, nullifierHash]} = Withdraw(20);
