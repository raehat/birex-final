'use client';
import { useState, useCallback } from 'react';
import { ASSETS, Asset } from '@/lib/assets';
import { usePrices } from '@/hooks/usePrices';
import Navbar from './Navbar';
import MarketTicker from './MarketTicker';
import AssetSidebar from './AssetSidebar';
import LiveChart from './LiveChart';
import TradingPanel from './TradingPanel';
import RecentTrades from './RecentTrades';

interface ActiveBet {
  direction: 'up' | 'down';
  entryPrice: number;
  expiresAt: number;
  amount: number;
  asset: Asset;
}

interface Props {
  onBackToHero: () => void;
}

export default function TradingView({ onBackToHero }: Props) {
  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[0]);
  const [activeBet, setActiveBet] = useState<ActiveBet | null>(null);
  const { prices, history, pctChange, direction } = usePrices();

  const currentPrice = prices[selectedAsset.id];
  const currentHistory = history[selectedAsset.id] ?? [];
  const pct = pctChange(selectedAsset);
  const dir = direction(selectedAsset.id);

  const handleBet = useCallback((betDir: 'up' | 'down', amount: number, durationSeconds: number) => {
    const entryPrice = prices[selectedAsset.id];
    if (entryPrice == null) return;
    setActiveBet({
      direction: betDir,
      entryPrice,
      expiresAt: Date.now() + durationSeconds * 1000,
      amount,
      asset: selectedAsset,
    });
    setTimeout(() => setActiveBet(null), durationSeconds * 1000 + 500);
  }, [prices, selectedAsset]);

  const handleSelectAsset = useCallback((a: Asset) => {
    if (activeBet) return;
    setSelectedAsset(a);
  }, [activeBet]);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Navbar onLogoClick={onBackToHero} />

      {/* Ticker */}
      <div className="mt-14">
        <MarketTicker prices={prices} pctChange={pctChange} />
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: asset sidebar */}
        <div className="hidden lg:flex flex-col w-64 shrink-0 border-r"
             style={{ borderColor: 'var(--border-subtle)', overflow: 'hidden' }}>
          <AssetSidebar
            selectedId={selectedAsset.id}
            onSelect={handleSelectAsset}
            prices={prices}
            pctChange={pctChange}
          />
        </div>

        {/* Center: chart area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Chart header */}
          <div className="flex items-center justify-between px-5 py-3 shrink-0"
               style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                   style={{ background: 'rgba(255,255,255,0.06)' }}>
                {selectedAsset.icon}
              </div>
              <div>
                <div className="font-black text-base">{selectedAsset.symbol}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{selectedAsset.name}</div>
              </div>
              {/* Category badge */}
              <span className="px-2 py-0.5 rounded text-xs font-semibold capitalize"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                {selectedAsset.category}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className={`font-mono font-black text-2xl ${dir === 'up' ? 'flash-up' : dir === 'down' ? 'flash-down' : ''}`}
                     style={{ color: dir === 'up' ? '#00ff88' : dir === 'down' ? '#ff3356' : 'white' }}>
                  {currentPrice != null ? currentPrice.toFixed(selectedAsset.decimals) : '—'}
                </div>
                <div className="text-sm font-bold"
                     style={{ color: pct >= 0 ? '#00ff88' : '#ff3356' }}>
                  {currentPrice != null ? `${pct >= 0 ? '+' : ''}${pct.toFixed(3)}%` : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Chart canvas */}
          <div className="flex-1 p-4 overflow-hidden relative">
            <LiveChart
              asset={selectedAsset}
              history={currentHistory}
              currentPrice={currentPrice}
              activeBet={activeBet ? {
                direction: activeBet.direction,
                entryPrice: activeBet.entryPrice,
                expiresAt: activeBet.expiresAt,
              } : null}
            />
          </div>

          {/* Bottom stats bar */}
          <div className="flex items-center gap-6 px-5 py-2.5 shrink-0"
               style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(13,20,34,0.5)' }}>
            {[
              { label: '24h High', value: (currentPrice * 1.028).toFixed(selectedAsset.decimals) },
              { label: '24h Low',  value: (currentPrice * 0.972).toFixed(selectedAsset.decimals) },
              { label: '24h Vol',  value: '$' + (Math.random() * 900 + 100).toFixed(0) + 'M' },
              { label: 'Spread',   value: '0.01%' },
            ].map(s => (
              <div key={s.label} className="text-xs">
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}&nbsp;</span>
                <span className="font-mono font-semibold">{s.value}</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#00ff88' }} />
              Live · updates every 400ms
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col w-72 shrink-0 border-l overflow-hidden"
             style={{ borderColor: 'var(--border-subtle)' }}>
          {/* Trading panel — top ~60% */}
          <div className="shrink-0 border-b overflow-y-auto" style={{ borderColor: 'var(--border-subtle)', maxHeight: '65%' }}>
            <TradingPanel
              asset={selectedAsset}
              currentPrice={currentPrice}
              onBet={handleBet}
              activeBet={activeBet}
            />
          </div>
          {/* Recent trades — bottom ~40% */}
          <div className="flex-1 overflow-hidden">
            <RecentTrades />
          </div>
        </div>
      </div>
    </div>
  );
}
