pragma circom 2.2.3;

include "./zkeklib.circom";

template Deposit(merkleDepth) {
	signal input publicKey;
	signal input merkleIndex;
	signal input merklePath[merkleDepth];

	signal input merkleRoot;
	signal input oldMerkleRoot;

	component merkleTreeChecker = MerkleTreeCheck(merkleDepth);
	merkleRoot ==> merkleTreeChecker.merkleRoot;
	merkleIndex ==> merkleTreeChecker.merkleIndex;
	merklePath ==> merkleTreeChecker.merklePath;
	publicKey ==> merkleTreeChecker.publicKey;

	signal dummy <== oldMerkleRoot * oldMerkleRoot;
}

component main{public [merkleRoot, oldMerkleRoot]} = Deposit(20);
