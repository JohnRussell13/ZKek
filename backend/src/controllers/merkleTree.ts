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
  });
};

export const initiateWithdraw = async (req: Request, res: Response) => {
  const { leaf } = req.body; // TODO: use index

  if (!leaf) {
    return res.json({ error: "Leaf must be provided!" });
  }

  const result = await getMerkleProof(leaf);

  if (!result) {
    return res.json({ error: "Leaf not found in the merkle tree" });
  }

  return res.json({
    leafIndex: result.leafIndex,
    merklePath: result.merklePath,
  });
};
