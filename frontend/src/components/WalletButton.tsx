import { useState, useRef, useEffect } from "react";
import { useWalletConnection } from "@solana/react-hooks";

export default function WalletButton() {
  const { connectors, connect, disconnect, wallet, status } =
    useWalletConnection();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  if (status === "connected" && wallet) {
    const address = wallet.account.address.toString();
    const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;

    return (
      <button
        onClick={disconnect}
        className="px-4 py-2 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 hover:from-red-900 hover:via-red-800 hover:to-red-900 border border-purple-500/50 hover:border-red-500/50 rounded-lg text-white text-sm font-medium transition-all"
      >
        {shortAddress}
      </button>
    );
  }

  if (connectors.length === 0) {
    return (
      <div className="px-4 py-2 text-slate-400 text-sm">
        No wallets detected
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-purple-500/50 rounded-lg text-white text-sm font-medium transition-all hover:border-purple-400"
      >
        Connect Wallet
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-purple-500/30 rounded-lg shadow-xl z-50">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => {
                connect(connector.id);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-white text-sm hover:bg-purple-800/50 first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
