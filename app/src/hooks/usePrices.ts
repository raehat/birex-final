'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ASSETS, Asset } from '@/lib/assets';

export type PriceMap = Record<string, number>;
export type HistoryMap = Record<string, number[]>;

const HISTORY_LEN = 120;

function randomWalk(price: number, volatility = 0.0003): number {
  const change = price * volatility * (Math.random() - 0.495);
  return Math.max(price + change, price * 0.5);
}

export function usePrices(tickMs = 500) {
  const [prices, setPrices] = useState<PriceMap>(() =>
    Object.fromEntries(ASSETS.map(a => [a.id, a.basePrice]))
  );
  const [history, setHistory] = useState<HistoryMap>(() =>
    Object.fromEntries(
      ASSETS.map(a => [a.id, Array.from({ length: HISTORY_LEN }, (_, i) => {
        let p = a.basePrice;
        for (let j = 0; j < HISTORY_LEN - i; j++) p = randomWalk(p, 0.0004);
        return p;
      }).reverse()])
    )
  );
  const prevPrices = useRef<PriceMap>({});

  useEffect(() => {
    const id = setInterval(() => {
      setPrices(prev => {
        prevPrices.current = prev;
        const next: PriceMap = {};
        for (const a of ASSETS) next[a.id] = randomWalk(prev[a.id], 0.0004);
        return next;
      });
      setHistory(prev => {
        const next: HistoryMap = {};
        for (const a of ASSETS) {
          const arr = [...prev[a.id]];
          arr.shift();
          arr.push(prices[a.id] ?? a.basePrice);
          next[a.id] = arr;
        }
        return next;
      });
    }, tickMs);
    return () => clearInterval(id);
  }, [tickMs, prices]);

  const direction = useCallback((id: string): 'up' | 'down' | 'flat' => {
    const cur = prices[id];
    const prv = prevPrices.current[id];
    if (!prv) return 'flat';
    return cur > prv ? 'up' : cur < prv ? 'down' : 'flat';
  }, [prices]);

  const pctChange = useCallback((asset: Asset): number => {
    const hist = history[asset.id];
    if (!hist || hist.length < 2) return 0;
    const open = hist[0];
    const cur  = prices[asset.id];
    return ((cur - open) / open) * 100;
  }, [history, prices]);

  return { prices, history, direction, pctChange };
}
