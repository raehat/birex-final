'use client';
import { useState, useRef, useEffect } from 'react';
import { ASSETS, Asset } from '@/lib/assets';
import { PriceMap } from '@/hooks/usePrices';

const CAT_COLOR: Record<string, string> = {
  crypto:      '#f7931a',
  forex:       '#627eea',
  commodities: '#ffd700',
  stocks:      '#00d4ff',
};

interface Props {
  selected: Asset;
  onSelect: (a: Asset) => void;
  prices: PriceMap;
  pctChange: (a: Asset) => number;
  disabled?: boolean;
}

export default function AssetDropdown({ selected, onSelect, prices, pctChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 50);
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = ASSETS.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (a: Asset) => {
    onSelect(a);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className="flex items-center gap-2 lg:gap-3 group"
      >
        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center text-base lg:text-lg shrink-0"
             style={{ background: 'rgba(255,255,255,0.06)' }}>
          {selected.icon}
        </div>
        <div className="text-left">
          <div className="font-black text-sm lg:text-base flex items-center gap-1">
            {selected.symbol}
            <span className="text-xs transition-transform" style={{ color: 'rgba(255,255,255,0.35)', transform: open ? 'rotate(180deg)' : undefined }}>▾</span>
          </div>
          <div className="text-xs hidden sm:flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {selected.name}
            <span className="px-1 rounded font-bold" style={{
              background: `${CAT_COLOR[selected.category] ?? '#fff'}18`,
              color: CAT_COLOR[selected.category] ?? 'rgba(255,255,255,0.4)',
              fontSize: '9px',
            }}>
              {selected.category.toUpperCase()}
            </span>
          </div>
        </div>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 rounded-xl overflow-hidden shadow-2xl"
             style={{
               width: 'min(300px, calc(100vw - 24px))',
               background: '#0d1422',
               border: '1px solid rgba(255,255,255,0.1)',
               boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
             }}>

          {/* Search */}
          <div className="p-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search any asset..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>

          {/* List */}
          <div className="overflow-y-auto p-1.5 space-y-0.5" style={{ maxHeight: '60vh' }}>
            {filtered.length === 0 && (
              <div className="py-6 text-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No results</div>
            )}
            {filtered.map(asset => {
              const price = prices[asset.id];
              const pct = pctChange(asset);
              const up = pct >= 0;
              const active = asset.id === selected.id;
              const catColor = CAT_COLOR[asset.category] ?? 'rgba(255,255,255,0.4)';
              return (
                <button key={asset.id}
                        onClick={() => handleSelect(asset)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all"
                        style={{
                          background: active ? 'rgba(0,255,136,0.07)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${active ? 'rgba(0,255,136,0.18)' : 'transparent'}`,
                        }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                         style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {asset.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight truncate">{asset.symbol}</div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs leading-tight truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{asset.name}</span>
                        <span className="shrink-0 px-1 rounded font-bold"
                              style={{ background: `${catColor}18`, color: catColor, fontSize: '9px' }}>
                          {asset.category.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-xs font-mono font-semibold">{price != null ? price.toFixed(asset.decimals) : '—'}</div>
                    <div className="text-xs font-mono font-bold" style={{ color: up ? '#00ff88' : '#ff3356' }}>
                      {price != null ? `${up ? '+' : ''}${pct.toFixed(2)}%` : '—'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
