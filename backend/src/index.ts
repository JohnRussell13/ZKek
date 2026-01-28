import express from "express";
import cors from "cors";
import { startDepositEventListener } from "./solana/helpers/listener";
import { merkleTreeRouter } from "./routes/merkleTree";
import { CONFIG } from "./common/config";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "X-CSRF-Token",
      "x-csrf-token",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
    ],
  }),
);

app.use("/api/tree", merkleTreeRouter);

app.listen(CONFIG.port, () => {
  console.log(`Example app listening on port ${CONFIG.port}`);
});

startDepositEventListener(CONFIG.solanaRpcUrl, CONFIG.solanaWsUrl).catch((error) => {
  console.error("Deposit event listener failed:", error);
  process.exit(1);
});
