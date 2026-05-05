'use client';
import { useState, useEffect } from 'react';
import { Asset, DURATIONS } from '@/lib/assets';

interface ActiveBet {
  direction: 'up' | 'down';
  entryPrice: number;
  expiresAt: number;
  amount: number;
  asset: Asset;
}

interface Props {
  asset: Asset;
  currentPrice: number;
  onBet: (direction: 'up' | 'down', amount: number, durationSeconds: number) => void;
  activeBet: ActiveBet | null;
}

export default function TradingPanel({ asset, currentPrice, onBet, activeBet }: Props) {
  const [duration, setDuration]   = useState(30);
  const [amount, setAmount]       = useState('50');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [result, setResult]       = useState<'win' | 'loss' | null>(null);
  const [resultVisible, setResultVisible] = useState(false);

  const payout = 195;
  const amountNum = parseFloat(amount) || 0;
  const potentialWin = ((amountNum * payout) / 100).toFixed(2);

  /* Countdown timer */
  useEffect(() => {
    if (!activeBet) { setCountdown(null); return; }
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((activeBet.expiresAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        clearInterval(id);
        const won = activeBet.direction === 'up'
          ? currentPrice > activeBet.entryPrice
          : currentPrice < activeBet.entryPrice;
        setResult(won ? 'win' : 'loss');
        setResultVisible(true);
        setTimeout(() => setResultVisible(false), 3500);
      }
    }, 200);
    return () => clearInterval(id);
  }, [activeBet, currentPrice]);

  const handleBet = (direction: 'up' | 'down') => {
    if (activeBet || amountNum <= 0) return;
    setResult(null);
    onBet(direction, amountNum, duration);
  };

  const progress = activeBet
    ? 1 - (countdown ?? 0) / ((activeBet.expiresAt - (activeBet.expiresAt - duration * 1000)) / 1000)
    : 0;

  const circumference = 2 * Math.PI * 28;
  const timerDuration = activeBet ? (activeBet.expiresAt - Date.now() + (countdown ?? 0) * 1000) / 1000 : duration;
  const dashOffset = activeBet && countdown !== null
    ? circumference * (countdown / (duration))
    : circumference;

  return (
    <div className="flex flex-col h-full p-4 gap-4" style={{ background: 'var(--bg-card)' }}>

      {/* Asset info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
               style={{ background: 'rgba(255,255,255,0.06)' }}>
            {asset.icon}
          </div>
          <div>
            <div className="font-bold text-sm">{asset.symbol}</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{asset.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-lg" style={{ color: '#00ff88' }}>
            {currentPrice.toFixed(asset.decimals)}
          </div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Current Price</div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

      {/* Duration selector */}
      <div>
        <div className="text-xs font-bold tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          ROUND DURATION
        </div>
        <div className="flex gap-2">
          {DURATIONS.map(d => (
            <button key={d.seconds}
                    onClick={() => !activeBet && setDuration(d.seconds)}
                    className={`duration-pill flex-1 ${duration === d.seconds && !activeBet ? 'active' : ''}`}
                    disabled={!!activeBet}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amount input */}
      <div>
        <div className="text-xs font-bold tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          TRADE AMOUNT (USDC)
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold"
                style={{ color: 'rgba(255,255,255,0.4)' }}>$</span>
          <input
            type="number"
            value={amount}
            onChange={e => !activeBet && setAmount(e.target.value)}
            disabled={!!activeBet}
            className="w-full pl-7 pr-4 py-2.5 rounded-lg text-sm font-mono font-bold outline-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
            }}
          />
        </div>
        {/* Quick amounts */}
        <div className="flex gap-2 mt-2">
          {[10, 25, 50, 100].map(v => (
            <button key={v}
                    onClick={() => !activeBet && setAmount(String(v))}
                    className="flex-1 py-1 rounded text-xs font-semibold transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}>
              ${v}
            </button>
          ))}
        </div>
      </div>

      {/* Payout info */}
      <div className="rounded-xl p-3 flex justify-between items-center"
           style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.12)' }}>
        <div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Payout if correct</div>
          <div className="font-mono font-black text-xl" style={{ color: '#00ff88' }}>
            ${potentialWin}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Rate</div>
          <div className="font-bold text-lg" style={{ color: '#00ff88' }}>{payout}%</div>
        </div>
      </div>

      {/* Active bet / countdown */}
      {activeBet ? (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
            TRADE ACTIVE
          </div>
          {/* Circular countdown */}
          <div className="relative w-20 h-20">
            <svg width="80" height="80" className="-rotate-90">
              <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle cx="40" cy="40" r="28" fill="none"
                      stroke={activeBet.direction === 'up' ? '#00ff88' : '#ff3356'}
                      strokeWidth="4"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.2s linear' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-black">{countdown ?? '--'}</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>sec</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
               style={{
                 background: activeBet.direction === 'up' ? 'rgba(0,255,136,0.1)' : 'rgba(255,51,86,0.1)',
                 color: activeBet.direction === 'up' ? '#00ff88' : '#ff3356',
                 border: `1px solid ${activeBet.direction === 'up' ? 'rgba(0,255,136,0.3)' : 'rgba(255,51,86,0.3)'}`,
               }}>
            {activeBet.direction === 'up' ? '▲ UP' : '▼ DOWN'} · ${activeBet.amount}
          </div>
          <div className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Entry: {activeBet.entryPrice.toFixed(asset.decimals)}
            <br />
            Current: {currentPrice.toFixed(asset.decimals)}
          </div>
        </div>
      ) : (
        /* Bet buttons */
        <div className="flex gap-3">
          <button onClick={() => handleBet('up')}
                  className="btn-up flex-1 py-4 rounded-xl text-base font-black flex flex-col items-center gap-1">
            <span className="text-xl">▲</span>
            <span>UP</span>
            <span className="text-xs font-semibold" style={{ opacity: 0.7 }}>+{payout}%</span>
          </button>
          <button onClick={() => handleBet('down')}
                  className="btn-down flex-1 py-4 rounded-xl text-base font-black flex flex-col items-center gap-1">
            <span className="text-xl">▼</span>
            <span>DOWN</span>
            <span className="text-xs font-semibold" style={{ opacity: 0.8 }}>+{payout}%</span>
          </button>
        </div>
      )}

      {/* Result toast */}
      {resultVisible && result && (
        <div className={`rounded-xl p-4 text-center font-black text-lg ${result === 'win' ? 'win-glow' : ''}`}
             style={{
               background: result === 'win' ? 'rgba(0,255,136,0.15)' : 'rgba(255,51,86,0.12)',
               border: `1px solid ${result === 'win' ? 'rgba(0,255,136,0.4)' : 'rgba(255,51,86,0.4)'}`,
               color: result === 'win' ? '#00ff88' : '#ff3356',
               animation: 'fade-up 0.4s ease',
             }}>
          {result === 'win' ? `🎉 YOU WIN! +$${potentialWin}` : `❌ YOU LOSE  -$${amount}`}
        </div>
      )}
    </div>
  );
}
