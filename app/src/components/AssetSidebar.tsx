'use client';
import { useState } from 'react';
import { ASSETS, CATEGORIES, Asset, Category } from '@/lib/assets';
import { PriceMap } from '@/hooks/usePrices';

interface Props {
  selectedId: string;
  onSelect: (a: Asset) => void;
  prices: PriceMap;
  pctChange: (a: Asset) => number;
}

export default function AssetSidebar({ selectedId, onSelect, prices, pctChange }: Props) {
  const [category, setCategory] = useState<Category>('crypto');
  const [search, setSearch] = useState('');

  const filtered = ASSETS.filter(a =>
    a.category === category &&
    (a.name.toLowerCase().includes(search.toLowerCase()) ||
     a.symbol.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-card)' }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="text-xs font-bold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          MARKETS
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search asset..."
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'white',
          }}
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-3 py-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {CATEGORIES.map(c => (
          <button key={c.id}
                  onClick={() => setCategory(c.id)}
                  className="flex-1 py-1.5 rounded-md font-semibold transition-all duration-150"
                  style={{
                    fontSize: '11px',
                    background: category === c.id ? 'rgba(0,255,136,0.12)' : 'transparent',
                    color: category === c.id ? '#00ff88' : 'rgba(255,255,255,0.4)',
                    border: category === c.id ? '1px solid rgba(0,255,136,0.3)' : '1px solid transparent',
                  }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Asset list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {filtered.map(asset => {
          const price = prices[asset.id];
          const pct   = pctChange(asset);
          const up    = pct >= 0;
          const active = asset.id === selectedId;

          return (
            <button key={asset.id}
                    onClick={() => onSelect(asset)}
                    className="asset-row w-full text-left"
                    style={{
                      background: active ? 'rgba(0,255,136,0.06)' : undefined,
                      border: active ? '1px solid rgba(0,255,136,0.2)' : '1px solid transparent',
                    }}>
              <div className="flex items-center justify-between">
                {/* Icon + name */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                       style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {asset.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold leading-tight">{asset.symbol}</div>
                    <div className="text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {asset.name}
                    </div>
                  </div>
                </div>
                {/* Price + change */}
                <div className="text-right">
                  <div className="text-xs font-mono font-semibold">{price != null ? price.toFixed(asset.decimals) : '—'}</div>
                  <div className="text-xs font-mono font-bold" style={{ color: up ? '#00ff88' : '#ff3356' }}>
                    {price != null ? `${up ? '+' : ''}${pct.toFixed(2)}%` : '—'}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
