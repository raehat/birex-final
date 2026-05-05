'use client';
import { useState, useEffect } from 'react';
import { ASSETS } from '@/lib/assets';

interface Trade {
  id: number;
  asset: string;
  direction: 'up' | 'down';
  amount: number;
  result: 'win' | 'loss' | 'pending';
  trader: string;
  time: string;
}

function randomTrader() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') + '...';
}

function randomTrade(id: number): Trade {
  const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
  const direction = Math.random() > 0.5 ? 'up' : 'down';
  const amounts = [10, 20, 25, 50, 100, 200, 500];
  const amount = amounts[Math.floor(Math.random() * amounts.length)];
  const results: Trade['result'][] = ['win', 'win', 'loss', 'pending'];
  return {
    id,
    asset: asset.symbol,
    direction,
    amount,
    result: results[Math.floor(Math.random() * results.length)],
    trader: randomTrader(),
    time: 'just now',
  };
}

export default function RecentTrades() {
  const [trades, setTrades] = useState<Trade[]>(() =>
    Array.from({ length: 8 }, (_, i) => randomTrade(i))
  );
  const [nextId, setNextId] = useState(8);

  useEffect(() => {
    const id = setInterval(() => {
      setTrades(prev => {
        const newTrade = randomTrade(nextId);
        return [newTrade, ...prev.slice(0, 11)];
      });
      setNextId(n => n + 1);
    }, 1800 + Math.random() * 1200);
    return () => clearInterval(id);
  }, [nextId]);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-card)' }}>
      <div className="px-4 py-3 flex items-center justify-between"
           style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
          LIVE TRADES
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#00ff88' }} />
          <span className="text-xs" style={{ color: '#00ff88' }}>LIVE</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid px-4 py-2 text-xs"
           style={{ color: 'rgba(255,255,255,0.3)', gridTemplateColumns: '1fr 60px 56px 48px' }}>
        <span>Trader</span>
        <span className="text-center">Dir</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Result</span>
      </div>

      {/* Trades */}
      <div className="flex-1 overflow-y-auto">
        {trades.map((t, i) => (
          <div key={t.id}
               className="grid items-center px-4 py-2.5 border-b transition-all"
               style={{
                 gridTemplateColumns: '1fr 60px 56px 48px',
                 borderColor: 'rgba(255,255,255,0.04)',
                 animation: i === 0 ? 'slide-right 0.35s ease' : undefined,
               }}>
            {/* Trader */}
            <div>
              <div className="text-xs font-mono font-medium">{t.trader}</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.asset}</div>
            </div>
            {/* Direction */}
            <div className="text-center">
              <span className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{
                      background: t.direction === 'up' ? 'rgba(0,255,136,0.1)' : 'rgba(255,51,86,0.1)',
                      color: t.direction === 'up' ? '#00ff88' : '#ff3356',
                    }}>
                {t.direction === 'up' ? '▲' : '▼'}
              </span>
            </div>
            {/* Amount */}
            <div className="text-right text-xs font-mono font-semibold">${t.amount}</div>
            {/* Result */}
            <div className="text-right text-xs font-bold"
                 style={{
                   color: t.result === 'win' ? '#00ff88' : t.result === 'loss' ? '#ff3356' : 'rgba(255,255,255,0.4)',
                 }}>
              {t.result === 'win' ? 'WIN' : t.result === 'loss' ? 'LOSS' : '···'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
