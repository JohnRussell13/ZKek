import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { autoDiscover, createClient } from "@solana/client";
import { SolanaProvider } from "@solana/react-hooks";

const client = createClient({
  endpoint: "https://api.devnet.solana.com",
  websocket: "wss://api.devnet.solana.com",
  walletConnectors: autoDiscover(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SolanaProvider client={client}>
      <App />
    </SolanaProvider>
  </StrictMode>,
);
