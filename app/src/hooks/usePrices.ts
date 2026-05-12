'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ASSETS, Asset } from '@/lib/assets';

export type PriceMap = Record<string, number>;
export type HistoryMap = Record<string, number[]>;

const HISTORY_LEN = 240;
const HERMES_URL = 'https://hermes.pyth.network/v2/updates/price/latest';
const POLL_MS = 400;

async function fetchPythPrices(assets: Asset[]): Promise<Partial<PriceMap>> {
  const withId = assets.filter(a => a.pythId);
  if (!withId.length) return {};

  const qs = withId.map(a => `ids[]=${a.pythId}`).join('&');
  const res = await fetch(`${HERMES_URL}?${qs}&parsed=true&ignore_invalid_price_ids=true`, { cache: 'no-store' });
  if (!res.ok) {
    console.warn('[Pyth] fetch failed', res.status);
    return {};
  }

  const data = await res.json();
  const out: Partial<PriceMap> = {};

  for (const entry of data.parsed ?? []) {
    const entryId = (entry.id as string).replace(/^0x/, '').toLowerCase();
    const asset = withId.find(a => a.pythId?.toLowerCase() === entryId);
    if (!asset) continue;
    const price = parseFloat(entry.price.price) * Math.pow(10, entry.price.expo);
    if (price > 0) out[asset.id] = price;
  }

  return out;
}

export function usePrices() {
  const [prices, setPrices] = useState<PriceMap>({});
  const [history, setHistory] = useState<HistoryMap>(
    Object.fromEntries(ASSETS.map(a => [a.id, []]))
  );
  const prevPrices = useRef<PriceMap>({});
  const latestPrices = useRef<PriceMap>({});

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      const next = await fetchPythPrices(ASSETS).catch(() => ({})) as PriceMap;
      if (cancelled) return;

      prevPrices.current = latestPrices.current;
      latestPrices.current = next;
      setPrices(next);

      setHistory(prev => {
        const nextHist: HistoryMap = {};
        for (const a of ASSETS) {
          const arr = [...(prev[a.id] ?? [])];
          if (next[a.id] != null) {
            if (arr.length >= HISTORY_LEN) arr.shift();
            arr.push(next[a.id]);
          }
          nextHist[a.id] = arr;
        }
        return nextHist;
      });
    };

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const direction = useCallback((id: string): 'up' | 'down' | 'flat' => {
    const cur = prices[id];
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
