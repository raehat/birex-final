import { useCallback, useEffect, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, BN, Idl, Program } from "@coral-xyz/anchor";
import IDL from "../idl/session_counter.json";

const PROGRAM_ID = new PublicKey(
  "4ppdMWYwx6PVH3W25vC8xpstzxYhQnGQL766TA6TWjCW"
);

export interface CounterInfo {
  owner: PublicKey;
  count: number;
}

function getCounterPDA(owner: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("counter"), owner.toBuffer()],
    PROGRAM_ID
  )[0];
}

export function useSessionCounter() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [counter, setCounter] = useState<CounterInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subIdRef = useRef<number | null>(null);

  const getProgram = useCallback(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    const provider = new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    });
    return new Program(IDL as Idl, PROGRAM_ID, provider);
  }, [connection, wallet]);

  const fetchState = useCallback(async () => {
    if (!wallet.publicKey) return;
    const program = getProgram();
    if (!program) return;

    const counterPDA = getCounterPDA(wallet.publicKey);

    try {
      const d = await program.account.counterState.fetch(counterPDA) as any;
      setCounter({
        owner: d.owner as PublicKey,
        count: (d.count as BN).toNumber(),
      });
    } catch {
      setCounter(null);
    }
  }, [wallet.publicKey, getProgram]);

  useEffect(() => {
    if (!wallet.publicKey) {
      setCounter(null);
      return;
    }
    fetchState();
  }, [wallet.publicKey, fetchState]);

  useEffect(() => {
    if (!wallet.publicKey) return;

    const counterPDA = getCounterPDA(wallet.publicKey);

    const subId = connection.onAccountChange(counterPDA, (info) => {
      // 8 discriminator + 32 owner + 8 count (u64 LE) + 1 bump
      if (info.data.length >= 49) {
        const count = Number(info.data.readBigUInt64LE(40));
        setCounter((prev) => (prev ? { ...prev, count } : null));
      }
    });
    subIdRef.current = subId;

    return () => {
      connection.removeAccountChangeListener(subId);
    };
  }, [wallet.publicKey, connection]);

  const initialize = useCallback(async () => {
    if (!wallet.publicKey) return;
    const program = getProgram();
    if (!program) return;

    setLoading(true);
    setError(null);
    try {
      const counterPDA = getCounterPDA(wallet.publicKey);
      await program.methods
        .initialize()
        .accounts({
          owner: wallet.publicKey,
          counter: counterPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await fetchState();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, getProgram, fetchState]);

  const increment = useCallback(async () => {
    if (!wallet.publicKey) return;
    const program = getProgram();
    if (!program) return;

    setLoading(true);
    setError(null);
    try {
      const counterPDA = getCounterPDA(wallet.publicKey);
      await program.methods
        .increment()
        .accounts({
          owner: wallet.publicKey,
          counter: counterPDA,
        })
        .rpc();
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, getProgram]);

  return {
    counter,
    loading,
    error,
    setError,
    initialize,
    increment,
    fetchState,
  };
}
