import { Router } from "express";
import { initiateDeposit, initiateWithdraw } from "../controllers/merkleTree";

export const merkleTreeRouter = Router();

merkleTreeRouter.post("/initiate-deposit", initiateDeposit);
// TODO: send idx not leaf
merkleTreeRouter.post("/initiate-withdraw", initiateWithdraw);
