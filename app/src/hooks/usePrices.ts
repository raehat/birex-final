'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ASSETS, Asset } from '@/lib/assets';

export type PriceMap = Record<string, number>;
export type HistoryMap = Record<string, number[]>;

const POLL_MS = 400;

export function usePrices() {
  const [prices, setPrices] = useState<PriceMap>({});
  const [history, setHistory] = useState<HistoryMap>(() =>
    Object.fromEntries(ASSETS.map(a => [a.id, []]))
  );
  const prevPrices = useRef<PriceMap>({});
  const latestPrices = useRef<PriceMap>({});

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch('/api/prices');
        if (!res.ok || cancelled) return;
        const data = await res.json() as { prices: PriceMap; history: HistoryMap };
        prevPrices.current = latestPrices.current;
        latestPrices.current = data.prices;
        setPrices(data.prices);
        setHistory(data.history);
      } catch {}
    };

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const direction = useCallback((id: string): 'up' | 'down' | 'flat' => {
    const cur = latestPrices.current[id];
    const prv = prevPrices.current[id];
    if (!cur || !prv) return 'flat';
    return cur > prv ? 'up' : cur < prv ? 'down' : 'flat';
  }, [prices]);

  const pctChange = useCallback((asset: Asset): number => {
    const hist = history[asset.id];
    const cur = prices[asset.id];
    if (!hist?.length || !cur) return 0;
    return ((cur - hist[0]) / hist[0]) * 100;
  }, [history, prices]);

  return { prices, history, direction, pctChange };
}
