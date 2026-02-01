import { Request, Response } from "express";
import { error } from "node:console";
import { json } from "node:stream/consumers";
import { addNewLeaf, getMerkleProof } from "../services/merkleTree";

export const initiateDeposit = async (req: Request, res: Response) => {
  const { leaf } = req.body;

  if (!leaf) {
    return res.json({ error: "Leaf must be provided!" });
  }

  const result = await addNewLeaf(leaf);

  if (!result) {
    return res.json({ error: "No empty leaf slots available in the merkle tree" });
  }

  return res.json({
    leafIndex: result.leafIndex,
    newRoot: result.newRoot,
    currentRoot: result.currentRoot,
    merklePath: result.merklePath,
  });
};

export const initiateWithdraw = async (req: Request, res: Response) => {
  const { leafIndex } = req.body;

  if (leafIndex === undefined || leafIndex === null) {
    return res.json({ error: "Leaf index must be provided!" });
  }

  const result = await getMerkleProof(leafIndex);

  if (!result) {
    return res.json({ error: "Leaf not found in the merkle tree" });
  }

  return res.json({
    merkleRoot: result.merkleRoot,
    merklePath: result.merklePath,
  });
};
