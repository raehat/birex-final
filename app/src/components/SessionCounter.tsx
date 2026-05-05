"use client";

import { FC } from "react";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSessionCounter } from "@/hooks/useSessionCounter";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

export const SessionCounter: FC = () => {
  const { publicKey } = useWallet();
  const { counter, loading, error, setError, initialize, increment } = useSessionCounter();

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">Counter</h1>
          <p className="text-gray-400 max-w-sm">
            Connect your wallet to use the on-chain counter.
          </p>
        </div>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Counter</h1>
        <WalletMultiButton />
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-950 border border-red-700 rounded-xl p-4">
          <span className="text-red-400 text-sm flex-1 break-all">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-200 text-lg leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-6">
        <p className="text-gray-500 text-xs uppercase tracking-widest">On-chain counter</p>
        <p className="text-8xl font-bold text-white tabular-nums">
          {counter !== null ? counter.count : "—"}
        </p>

        {counter !== null ? (
          <button
            onClick={increment}
            disabled={loading}
            className="px-10 py-3 bg-green-500 hover:bg-green-400 active:scale-95
                       disabled:opacity-40 disabled:cursor-not-allowed
                       text-black font-bold text-lg rounded-xl transition-all"
          >
            {loading ? "Sending…" : "+ Increment"}
          </button>
        ) : (
          <button
            onClick={initialize}
            disabled={loading}
            className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95
                       disabled:opacity-40 disabled:cursor-not-allowed
                       text-white font-bold text-lg rounded-xl transition-all"
          >
            {loading ? "Initializing…" : "Initialize Counter"}
          </button>
        )}
      </div>
    </div>
  );
};
