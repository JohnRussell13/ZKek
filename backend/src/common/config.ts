import { config } from "dotenv-safe";
config();

const constructDBUrl = () => {
  return `postgres://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`;
};

export const CONFIG = {
  port: Number(process.env.PORT || 3000),
  dbUrl: constructDBUrl(),
  solanaRpcUrl: process.env.RPC_URL ?? "https://api.devnet.solana.com",
  solanaWsUrl: process.env.WS_URL ?? "wss://api.devnet.solana.com",
};
