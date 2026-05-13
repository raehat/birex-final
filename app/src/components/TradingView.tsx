'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { ASSETS, Asset } from '@/lib/assets';
import { PriceMap, HistoryMap } from '@/hooks/usePrices';
import Navbar from './Navbar';
import MarketTicker from './MarketTicker';
import AssetSidebar from './AssetSidebar';
import LiveChart from './LiveChart';
import TradingPanel from './TradingPanel';

interface ActiveBet {
  direction: 'up' | 'down';
  entryPrice: number;
  expiresAt: number;
  amount: number;
  asset: Asset;
}

interface PricesData {
  prices: PriceMap;
  history: HistoryMap;
  direction: (id: string) => 'up' | 'down' | 'flat';
  pctChange: (asset: Asset) => number;
}

interface Props {
  onBackToHero: () => void;
  isDemo: boolean;
  pricesData: PricesData;
}

const DEMO_START_BALANCE = 10_000;

export default function TradingView({ onBackToHero, isDemo, pricesData }: Props) {
  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[0]);
  const [activeBet, setActiveBet] = useState<ActiveBet | null>(null);
  const [demoBalance, setDemoBalance] = useState(DEMO_START_BALANCE);
  const { prices, history, pctChange, direction } = pricesData;

  const currentPrice = prices[selectedAsset.id];
  const currentHistory = history[selectedAsset.id] ?? [];
  const pct = pctChange(selectedAsset);
  const dir = direction(selectedAsset.id);

  const currentPriceRef = useRef(currentPrice);
  useEffect(() => { currentPriceRef.current = currentPrice; }, [currentPrice]);

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
    setTimeout(() => {
      if (isDemo) {
        const closing = currentPriceRef.current;
        if (closing != null) {
          const won = betDir === 'up' ? closing > entryPrice : closing < entryPrice;
          setDemoBalance(prev => won ? prev + amount * 0.95 : prev - amount);
        }
      }
      setActiveBet(null);
    }, durationSeconds * 1000 + 500);
  }, [prices, selectedAsset, isDemo]);

  const handleSelectAsset = useCallback((a: Asset) => {
    if (activeBet) return;
    setSelectedAsset(a);
  }, [activeBet]);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Navbar onLogoClick={onBackToHero} />

      {/* Demo banner */}
      {isDemo && (
        <div className="fixed top-14 left-0 right-0 z-40 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold"
             style={{ background: 'rgba(255,180,0,0.12)', borderBottom: '1px solid rgba(255,180,0,0.25)', color: '#ffb400' }}>
          <span className="px-2 py-0.5 rounded font-black tracking-wider" style={{ background: 'rgba(255,180,0,0.2)' }}>DEMO</span>
          <span>Balance:</span>
          <span className="font-mono text-sm">{demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BT</span>
          {demoBalance < 10 && (
            <button onClick={() => setDemoBalance(DEMO_START_BALANCE)}
                    className="ml-1 px-2 py-0.5 rounded font-bold text-xs"
                    style={{ background: 'rgba(255,180,0,0.3)', border: '1px solid rgba(255,180,0,0.5)' }}>
              Refill
            </button>
          )}
          <span className="hidden sm:inline" style={{ color: 'rgba(255,180,0,0.5)' }}>· Virtual funds only</span>
        </div>
      )}

      {/* Ticker */}
      <div className={isDemo ? 'mt-[calc(3.5rem+32px)]' : 'mt-14'}>
        <MarketTicker prices={prices} pctChange={pctChange} />
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* Left: asset sidebar — desktop only */}
        <div className="hidden lg:flex flex-col w-72 shrink-0 border-r"
             style={{ borderColor: 'var(--border-subtle)', overflow: 'hidden' }}>
          <AssetSidebar
            selectedId={selectedAsset.id}
            onSelect={handleSelectAsset}
            prices={prices}
            pctChange={pctChange}
          />
        </div>

        {/* Center: chart area */}
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">

          {/* Chart header */}
          <div className="flex items-center justify-between px-3 lg:px-5 py-2 lg:py-3 shrink-0"
               style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center text-base lg:text-lg"
                   style={{ background: 'rgba(255,255,255,0.06)' }}>
                {selectedAsset.icon}
              </div>
              <div>
                <div className="font-black text-sm lg:text-base">{selectedAsset.symbol}</div>
                <div className="text-xs hidden sm:block" style={{ color: 'rgba(255,255,255,0.4)' }}>{selectedAsset.name}</div>
              </div>
              <span className="hidden sm:inline px-2 py-0.5 rounded text-xs font-semibold capitalize"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                {selectedAsset.category}
              </span>
            </div>
            <div className="text-right">
              <div className={`font-mono font-black text-lg lg:text-2xl ${dir === 'up' ? 'flash-up' : dir === 'down' ? 'flash-down' : ''}`}
                   style={{ color: dir === 'up' ? '#00ff88' : dir === 'down' ? '#ff3356' : 'white' }}>
                {currentPrice != null ? currentPrice.toFixed(selectedAsset.decimals) : '—'}
              </div>
              <div className="text-xs lg:text-sm font-bold"
                   style={{ color: pct >= 0 ? '#00ff88' : '#ff3356' }}>
                {currentPrice != null ? `${pct >= 0 ? '+' : ''}${pct.toFixed(3)}%` : '—'}
              </div>
            </div>
          </div>

          {/* Mobile asset picker */}
          <div className="lg:hidden flex overflow-x-auto gap-2 px-3 py-2 shrink-0"
               style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {ASSETS.map(a => {
              const p = prices[a.id];
              const ap = pctChange(a);
              return (
                <button key={a.id} onClick={() => handleSelectAsset(a)}
                        className="flex flex-col items-start px-2.5 py-1.5 rounded-lg shrink-0"
                        style={{
                          background: selectedAsset.id === a.id ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.04)',
                          border: selectedAsset.id === a.id ? '1px solid rgba(0,255,136,0.3)' : '1px solid rgba(255,255,255,0.06)',
                        }}>
                  <span className="text-xs font-bold whitespace-nowrap">{a.symbol}</span>
                  <span className="text-xs font-mono" style={{ color: ap >= 0 ? '#00ff88' : '#ff3356' }}>
                    {p != null ? `${ap >= 0 ? '+' : ''}${ap.toFixed(2)}%` : '—'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Chart canvas */}
          <div className="flex-1 p-2 lg:p-4 overflow-hidden relative" style={{ minHeight: '180px' }}>
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

          {/* Bottom stats bar — desktop only */}
          <div className="hidden lg:flex items-center gap-6 px-5 py-2.5 shrink-0"
               style={{ borderTop: '1px solid var(--border-subtle)', background: 'rgba(13,20,34,0.5)' }}>
            {currentPrice != null && [
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

        {/* Right column: trading panel */}
        <div className="flex flex-col w-full lg:w-80 shrink-0 lg:border-l border-t lg:border-t-0 overflow-y-auto lg:overflow-hidden max-h-[48vh] lg:max-h-none"
             style={{ borderColor: 'var(--border-subtle)' }}>
          <TradingPanel
            asset={selectedAsset}
            currentPrice={currentPrice}
            onBet={handleBet}
            activeBet={activeBet}
            isDemo={isDemo}
            demoBalance={isDemo ? demoBalance : undefined}
          />
        </div>
      </div>
    </div>
  );
}
