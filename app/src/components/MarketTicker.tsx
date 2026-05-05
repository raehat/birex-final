'use client';
import { ASSETS } from '@/lib/assets';
import { PriceMap } from '@/hooks/usePrices';

interface Props {
  prices: PriceMap;
  pctChange: (a: (typeof ASSETS)[number]) => number;
}

export default function MarketTicker({ prices, pctChange }: Props) {
  const items = [...ASSETS, ...ASSETS];

  return (
    <div className="ticker-wrap border-b" style={{
      borderColor: 'rgba(255,255,255,0.06)',
      background: 'rgba(13,20,34,0.8)',
      backdropFilter: 'blur(10px)',
    }}>
      <div className="ticker-inner py-2">
        {items.map((asset, i) => {
          const price = prices[asset.id] ?? asset.basePrice;
          const pct = pctChange(asset);
          const up = pct >= 0;
          return (
            <div key={`${asset.id}-${i}`} className="flex items-center gap-2 px-6 border-r"
                 style={{ borderColor: 'rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>
              <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {asset.symbol}
              </span>
              <span className="text-xs font-mono font-semibold text-white">
                {price.toFixed(asset.decimals)}
              </span>
              <span className="text-xs font-mono font-bold" style={{ color: up ? '#00ff88' : '#ff3356' }}>
                {up ? '+' : ''}{pct.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
