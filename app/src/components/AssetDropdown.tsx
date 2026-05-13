'use client';
import { useState, useRef, useEffect } from 'react';
import { ASSETS, Asset } from '@/lib/assets';
import { PriceMap } from '@/hooks/usePrices';

type Category = 'crypto' | 'forex' | 'commodity' | 'stock' | null;

const CATS: { id: Category; label: string; icon: string }[] = [
  { id: null,        label: 'All',         icon: '◉' },
  { id: 'crypto',    label: 'Crypto',      icon: '₿' },
  { id: 'forex',     label: 'Forex',       icon: '$' },
  { id: 'commodity', label: 'Commodities', icon: '◆' },
  { id: 'stock',     label: 'Stocks',      icon: '↗' },
];

const CAT_COLOR: Record<string, string> = {
  crypto:    '#f7931a',
  forex:     '#627eea',
  commodity: '#ffd700',
  stock:     '#00d4ff',
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
  const [category, setCategory] = useState<Category>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 60);
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = ASSETS.filter(a => {
    const q = search.toLowerCase();
    if (q) return a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q);
    return category === null || a.category === category;
  });

  const handleSelect = (a: Asset) => {
    onSelect(a);
    setOpen(false);
    setSearch('');
  };

  const catColor = CAT_COLOR[selected.category] ?? 'rgba(255,255,255,0.4)';

  return (
    <div ref={containerRef} className="relative">

      {/* Trigger */}
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className="flex items-center gap-2 lg:gap-3"
      >
        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center text-base lg:text-lg shrink-0"
             style={{ background: 'rgba(255,255,255,0.06)' }}>
          {selected.icon}
        </div>
        <div className="text-left">
          <div className="font-black text-sm lg:text-base flex items-center gap-1">
            {selected.symbol}
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
          </div>
          <div className="text-xs hidden sm:flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {selected.name}
            <span className="px-1 rounded font-bold" style={{ background: `${catColor}1a`, color: catColor, fontSize: '9px' }}>
              {selected.category.toUpperCase()}
            </span>
          </div>
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 flex rounded-xl overflow-hidden shadow-2xl"
             style={{
               width: 'min(500px, calc(100vw - 20px))',
               maxHeight: '72vh',
               background: '#0e1523',
               border: '1px solid rgba(255,255,255,0.09)',
               boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
             }}>

          {/* Left: category tabs */}
          <div className="flex flex-col gap-1 p-2 shrink-0"
               style={{ width: '130px', borderRight: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.25)', overflowY: 'auto' }}>
            {CATS.map(c => {
              const active = category === c.id && !search;
              const color = c.id ? (CAT_COLOR[c.id] ?? '#fff') : '#00ff88';
              return (
                <button key={String(c.id)}
                        onClick={() => { setCategory(c.id); setSearch(''); }}
                        className="flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-left text-sm font-semibold transition-all w-full"
                        style={{
                          background: active ? `${color}18` : 'transparent',
                          color: active ? color : 'rgba(255,255,255,0.55)',
                          border: `1px solid ${active ? `${color}35` : 'transparent'}`,
                        }}>
                  <span className="text-base leading-none" style={{ color: active ? color : 'rgba(255,255,255,0.3)' }}>{c.icon}</span>
                  <span style={{ fontSize: '12px' }}>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: search + list */}
          <div className="flex flex-col flex-1 min-w-0">

            {/* Search bar */}
            <div className="p-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>🔍</span>
                <input
                  ref={inputRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search all assets..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'white' }}
                />
              </div>
            </div>

            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-1.5 shrink-0"
                 style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Asset</span>
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>Price / Change</span>
            </div>

            {/* Asset list */}
            <div className="overflow-y-auto flex-1 p-1.5 space-y-px">
              {filtered.length === 0 && (
                <div className="py-8 text-center text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>No assets found</div>
              )}
              {filtered.map(asset => {
                const price = prices[asset.id];
                const pct = pctChange(asset);
                const up = pct >= 0;
                const active = asset.id === selected.id;
                const color = CAT_COLOR[asset.category] ?? 'rgba(255,255,255,0.4)';
                return (
                  <button key={asset.id}
                          onClick={() => handleSelect(asset)}
                          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all"
                          style={{
                            background: active ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${active ? 'rgba(0,255,136,0.2)' : 'transparent'}`,
                          }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                           style={{ background: 'rgba(255,255,255,0.07)' }}>
                        {asset.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                          {asset.symbol}
                          {search && (
                            <span className="px-1 rounded font-bold shrink-0"
                                  style={{ background: `${color}1a`, color, fontSize: '9px' }}>
                              {asset.category.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{asset.name}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
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
        </div>
      )}
    </div>
  );
}
