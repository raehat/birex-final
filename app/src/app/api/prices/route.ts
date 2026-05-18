import { NextResponse } from 'next/server';
import { ASSETS } from '@/lib/assets';

const HISTORY_LEN = 600;
const POLL_MS = 400;
const HERMES_URL = 'https://hermes.pyth.network/v2/updates/price/latest';

const history: Record<string, number[]> = Object.fromEntries(ASSETS.map(a => [a.id, []]));
let prices: Record<string, number> = {};
let polling = false;

async function fetchAndUpdate() {
  const withId = ASSETS.filter(a => a.pythId);
  if (!withId.length) return;

  const qs = withId.map(a => `ids[]=${a.pythId}`).join('&');
  try {
    const res = await fetch(`${HERMES_URL}?${qs}&parsed=true&ignore_invalid_price_ids=true`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();

    for (const entry of data.parsed ?? []) {
      const entryId = (entry.id as string).replace(/^0x/, '').toLowerCase();
      const asset = withId.find(a => a.pythId?.toLowerCase() === entryId);
      if (!asset) continue;
      const price = parseFloat(entry.price.price) * Math.pow(10, entry.price.expo);
      if (price <= 0) continue;
      prices[asset.id] = price;
      const arr = history[asset.id];
      if (arr.length >= HISTORY_LEN) arr.shift();
      arr.push(price);
    }
  } catch {}
}

function startPolling() {
  if (polling) return;
  polling = true;
  fetchAndUpdate();
  setInterval(fetchAndUpdate, POLL_MS);
}

export async function GET() {
  startPolling();
  return NextResponse.json({ prices, history });
}
