import { Router } from "express";
import { initiateDeposit, initiateWithdraw } from "../controllers/merkleTree";

export const merkleTreeRouter = Router();

merkleTreeRouter.post("/initiate-deposit", initiateDeposit);
merkleTreeRouter.post("/initiate-withdraw", initiateWithdraw);
