import { useState } from "react";
import { initiateDeposit, initiateWithdraw } from "../api/endpoints";
import { generateSecretKey } from "../helpers/secret";
import { hash } from "../helpers/poseidon";
import {
  makeProof,
  type DepositCircuitInputs,
  type WithdrawCircuitInputs,
} from "../helpers/snarkjs";
import { proofToBytes, toByteArray } from "../helpers/converter";
import { useWallet, useSendTransaction } from "@solana/react-hooks";

import {
  createDepositInstruction,
  createWithdrawInstruction,
} from "../solana/helpers";
import Header from "./Header";
import SecretKeyPage from "./pages/SecretKeyPage";
import DepositPage from "./pages/DepositPage";
import WithdrawPage from "./pages/WithdrawPage";

type Page = "secret" | "deposit" | "withdraw";

export default function TransactionForm() {
  const wallet = useWallet();
  const { send, isSending } = useSendTransaction();
  const [currentPage, setCurrentPage] = useState<Page>("secret");
  const [secretKey, setSecretKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [depositPublicKey, setDepositPublicKey] = useState("");
  const [leafIndex, setLeafIndex] = useState("");
  const [withdrawSecretKey, setWithdrawSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [publicKeyCopied, setPublicKeyCopied] = useState(false);

  const handleGenerateSecret = async () => {
    // Generate secret key as decimal string
    const newSecret = generateSecretKey();

    // Generate public key from secret key (pass as strings)
    const pubKey = await hash([newSecret, "6"]);

    setSecretKey(newSecret);
    setPublicKey(pubKey);
    setCopied(false);
    setMessage("");
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPublicKey = () => {
    navigator.clipboard.writeText(publicKey);
    setPublicKeyCopied(true);
    setTimeout(() => setPublicKeyCopied(false), 2000);
  };

  const handleDeposit = async () => {
    if (!depositPublicKey) {
      setMessage("Please enter a public key");
      return;
    }

    if (wallet.status !== "connected") {
      setMessage("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Send to backend using the provided public key
      const result = await initiateDeposit({ leaf: depositPublicKey });

      const proofInput: DepositCircuitInputs = {
        publicKey: depositPublicKey,
        merkleIndex: result.leafIndex.toString(),
        merklePath: result.merklePath,
        merkleRoot: result.newRoot,
        oldMerkleRoot: result.currentRoot,
      };

      console.log("Proof input:", proofInput);

      setMessage("Generating proof...");
      const { proof, publicSignals } = await makeProof(proofInput);

      console.log("Proof generated:", { proof, publicSignals });

      // Convert proof to 256-byte array
      const proofBytes = proofToBytes(proof);
      console.log("Proof bytes (256 bytes):", proofBytes);
      console.log("Proof bytes length:", proofBytes.length);

      // Split public signals into new and old merkle roots
      const newMerkleRoot = publicSignals[0];
      const oldMerkleRoot = publicSignals[1];

      // Convert merkle roots to byte arrays
      const newMerkleRootBytes = toByteArray(newMerkleRoot);
      const oldMerkleRootBytes = toByteArray(oldMerkleRoot);

      console.log("New Merkle Root:", newMerkleRoot);
      console.log("New Merkle Root bytes:", newMerkleRootBytes);
      console.log("Old Merkle Root:", oldMerkleRoot);
      console.log("Old Merkle Root bytes:", oldMerkleRootBytes);

      setMessage("Sending transaction...");

      const depositInstruction = await createDepositInstruction(
        wallet.session.account.address,
        newMerkleRootBytes,
        oldMerkleRootBytes,
        result.leafIndex,
        proofBytes,
      );

      const txSig = await send({ instructions: [depositInstruction] });

      const explorerUrl = `https://explorer.solana.com/tx/${txSig}?cluster=custom&customUrl=http://localhost:8899`;
      setMessage(
        `Deposit successful! Leaf Index: ${result.leafIndex}. <a href="${explorerUrl}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">View transaction</a>`,
      );
    } catch (error) {
      console.error("Deposit error:", error);
      setMessage("Failed to initiate deposit or generate proof");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!leafIndex) {
      setMessage("Please enter a leaf index");
      return;
    }

    if (!withdrawSecretKey) {
      setMessage("Please enter your secret key");
      return;
    }

    if (wallet.status !== "connected") {
      setMessage("Please connect your wallet first");
      return;
    }

    console.log("SECRET KEY: " + withdrawSecretKey);

    setLoading(true);
    setMessage("");

    try {
      // Get merkle proof from backend
      const result = await initiateWithdraw({ leafIndex: parseInt(leafIndex) });

      // Compute nullifier hash from secret key
      const nullifierHash = await hash([withdrawSecretKey]);

      // Create withdraw circuit inputs
      const proofInput: WithdrawCircuitInputs = {
        secretKey: withdrawSecretKey,
        merkleIndex: leafIndex,
        merklePath: result.merklePath,
        merkleRoot: result.merkleRoot,
        nullifierHash: nullifierHash,
      };

      console.log("Withdraw proof input:", proofInput);

      setMessage("Generating proof...");
      const { proof, publicSignals } = await makeProof(proofInput);

      console.log("Proof generated:", { proof, publicSignals });

      // Convert proof to 256-byte array
      const proofBytes = proofToBytes(proof);
      console.log("Proof bytes (256 bytes):", proofBytes);
      console.log("Proof bytes length:", proofBytes.length);

      // Public signals: [merkleRoot, nullifierHash]
      const merkleRootFromProof = publicSignals[0];
      const nullifierHashFromProof = publicSignals[1];

      // Convert to byte arrays
      const nullifierBytes = toByteArray(nullifierHashFromProof);
      const rootBytes = toByteArray(merkleRootFromProof);

      console.log("Nullifier Hash:", nullifierHashFromProof);
      console.log("Nullifier bytes:", nullifierBytes);
      console.log("Merkle Root:", merkleRootFromProof);
      console.log("Root bytes:", rootBytes);

      setMessage("Sending transaction...");

      const withdrawInstruction = await createWithdrawInstruction(
        wallet.session.account.address,
        nullifierBytes,
        rootBytes,
        proofBytes,
      );

      const txSig = await send({ instructions: [withdrawInstruction] });

      const explorerUrl = `https://explorer.solana.com/tx/${txSig}?cluster=custom&customUrl=http://localhost:8899`;
      setMessage(
        `Withdraw successful! <a href="${explorerUrl}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; text-decoration: underline;">View transaction</a>`,
      );
      setLeafIndex("");
      setWithdrawSecretKey("");
    } catch (error) {
      console.error("Withdraw error:", error);
      setMessage("Failed to complete withdraw");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setMessage("");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "secret":
        return (
          <SecretKeyPage
            secretKey={secretKey}
            publicKey={publicKey}
            copied={copied}
            publicKeyCopied={publicKeyCopied}
            onGenerateSecret={handleGenerateSecret}
            onCopySecret={handleCopySecret}
            onCopyPublicKey={handleCopyPublicKey}
          />
        );
      case "deposit":
        return (
          <DepositPage
            depositPublicKey={depositPublicKey}
            loading={loading}
            onDepositPublicKeyChange={setDepositPublicKey}
            onDeposit={handleDeposit}
          />
        );
      case "withdraw":
        return (
          <WithdrawPage
            withdrawSecretKey={withdrawSecretKey}
            leafIndex={leafIndex}
            loading={loading}
            onWithdrawSecretKeyChange={setWithdrawSecretKey}
            onLeafIndexChange={setLeafIndex}
            onWithdraw={handleWithdraw}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <Header currentPage={currentPage} onPageChange={handlePageChange} />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          {renderPage()}

          {message && (
            <div
              className={`mt-6 p-4 rounded-xl ${
                message.includes("Error") || message.includes("Failed")
                  ? "bg-red-500/10 border border-red-500/20 text-red-200"
                  : "bg-green-500/10 border border-green-500/20 text-green-200"
              }`}
            >
              <p
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: message }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
