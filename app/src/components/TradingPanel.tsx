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
  currentPrice: number | undefined;
  onBet: (direction: 'up' | 'down', amount: number, durationSeconds: number) => void;
  activeBet: ActiveBet | null;
  isDemo?: boolean;
  demoBalance?: number;
}

export default function TradingPanel({ asset, currentPrice, onBet, activeBet, isDemo, demoBalance }: Props) {
  const [duration, setDuration]   = useState(30);
  const [amount, setAmount]       = useState('50');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [result, setResult]       = useState<'win' | 'loss' | null>(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [insufficientVisible, setInsufficientVisible] = useState(false);

  const payout = 195;
  const amountNum = parseFloat(amount) || 0;
  const potentialWin = ((amountNum * payout) / 100).toFixed(2);

  // Live trade status based on current price vs entry
  const tradeStatus: 'winning' | 'losing' | 'breakeven' | null =
    activeBet && currentPrice != null
      ? activeBet.direction === 'up'
        ? currentPrice > activeBet.entryPrice ? 'winning' : currentPrice < activeBet.entryPrice ? 'losing' : 'breakeven'
        : currentPrice < activeBet.entryPrice ? 'winning' : currentPrice > activeBet.entryPrice ? 'losing' : 'breakeven'
      : null;

  const statusColor = tradeStatus === 'winning' ? '#00ff88' : tradeStatus === 'losing' ? '#ff3356' : 'rgba(255,255,255,0.5)';
  const statusBg    = tradeStatus === 'winning' ? 'rgba(0,255,136,0.08)' : tradeStatus === 'losing' ? 'rgba(255,51,86,0.08)' : 'rgba(255,255,255,0.04)';
  const statusBorder = tradeStatus === 'winning' ? 'rgba(0,255,136,0.25)' : tradeStatus === 'losing' ? 'rgba(255,51,86,0.25)' : 'rgba(255,255,255,0.1)';

  useEffect(() => {
    if (!activeBet) { setCountdown(null); return; }
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((activeBet.expiresAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        clearInterval(id);
        const won = currentPrice != null && (activeBet.direction === 'up'
          ? currentPrice > activeBet.entryPrice
          : currentPrice < activeBet.entryPrice);
        setResult(won ? 'win' : 'loss');
        setResultVisible(true);
        setTimeout(() => setResultVisible(false), 4000);
      }
    }, 200);
    return () => clearInterval(id);
  }, [activeBet, currentPrice]);

  const handleBet = (direction: 'up' | 'down') => {
    if (activeBet || amountNum <= 0) return;
    if (isDemo && demoBalance != null && amountNum > demoBalance) {
      setInsufficientVisible(true);
      setTimeout(() => setInsufficientVisible(false), 2000);
      return;
    }
    setResult(null);
    onBet(direction, amountNum, duration);
  };

  const circumference = 2 * Math.PI * 28;
  const dashOffset = activeBet && countdown !== null
    ? circumference * (countdown / duration)
    : circumference;

  return (
    <>
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="lg:hidden flex flex-col gap-2 p-3" style={{ background: 'var(--bg-card)' }}>

        {isDemo && demoBalance != null && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
               style={{ background: 'rgba(255,180,0,0.07)', border: '1px solid rgba(255,180,0,0.15)' }}>
            <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,180,0,0.6)' }}>DEMO</span>
            <span className="font-mono font-black text-xs" style={{ color: '#ffb400' }}>
              {demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BT
            </span>
          </div>
        )}

        {/* Time + Amount */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs font-bold tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>DURATION</div>
            <select value={duration} onChange={e => !activeBet && setDuration(Number(e.target.value))}
                    disabled={!!activeBet}
                    className="w-full py-2 px-2 rounded text-sm font-bold outline-none appearance-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              {DURATIONS.map(d => (
                <option key={d.seconds} value={d.seconds} style={{ background: '#0d1422' }}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>AMOUNT</div>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>$</span>
              <input type="number" value={amount}
                     onChange={e => !activeBet && setAmount(e.target.value)}
                     disabled={!!activeBet}
                     className="w-full pl-5 pr-2 py-2 rounded text-sm font-mono font-bold outline-none"
                     style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
          </div>
        </div>

        {activeBet ? (
          <div className="flex items-center justify-between px-3 py-3 rounded-xl"
               style={{ background: statusBg, border: `1px solid ${statusBorder}` }}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-widest" style={{ color: statusColor }}>
                  {tradeStatus === 'winning' ? '● WINNING' : tradeStatus === 'losing' ? '● LOSING' : '● OPEN'}
                </span>
              </div>
              <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {activeBet.direction === 'up' ? '▲ BUY' : '▼ SELL'} · ${activeBet.amount}
              </span>
              <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Entry {activeBet.entryPrice.toFixed(asset.decimals)}
              </span>
            </div>
            <div className="font-black leading-none text-right">
              <div style={{ color: statusColor, fontSize: '2.25rem', lineHeight: 1 }}>
                {countdown ?? '--'}<span className="text-sm font-bold">s</span>
              </div>
              {tradeStatus === 'winning' && (
                <div className="text-xs font-bold mt-1" style={{ color: '#00ff88' }}>+{potentialWin} BT</div>
              )}
              {tradeStatus === 'losing' && (
                <div className="text-xs font-bold mt-1" style={{ color: '#ff3356' }}>-{activeBet.amount} BT</div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg"
                 style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.1)' }}>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Payout if correct</span>
              <span className="font-mono font-black text-sm" style={{ color: '#00ff88' }}>
                {potentialWin} BT
                <span className="text-xs font-semibold ml-1" style={{ color: 'rgba(0,255,136,0.55)' }}>({payout}%)</span>
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleBet('up')}
                      className="btn-up flex-1 py-4 rounded-xl font-black flex flex-col items-center gap-0.5">
                <span className="text-xl">▲</span>
                <span className="text-base">BUY</span>
              </button>
              <button onClick={() => handleBet('down')}
                      className="btn-down flex-1 py-4 rounded-xl font-black flex flex-col items-center gap-0.5">
                <span className="text-xl">▼</span>
                <span className="text-base">SELL</span>
              </button>
            </div>
          </>
        )}

        {insufficientVisible && (
          <div className="rounded-xl p-2.5 text-center font-bold text-sm"
               style={{ background: 'rgba(255,180,0,0.1)', border: '1px solid rgba(255,180,0,0.35)', color: '#ffb400', animation: 'fade-up 0.3s ease' }}>
            Insufficient balance
          </div>
        )}

        {resultVisible && result && (
          <div className="rounded-xl p-3 text-center"
               style={{
                 background: result === 'win' ? 'rgba(0,255,136,0.12)' : 'rgba(255,51,86,0.1)',
                 border: `1px solid ${result === 'win' ? 'rgba(0,255,136,0.35)' : 'rgba(255,51,86,0.35)'}`,
                 animation: 'fade-up 0.4s ease',
               }}>
            <div className="text-xs font-bold tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>TRADE CLOSED</div>
            <div className="font-black text-xl" style={{ color: result === 'win' ? '#00ff88' : '#ff3356' }}>
              {result === 'win' ? `+${potentialWin} BT` : `-${amount} BT`}
            </div>
          </div>
        )}
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden lg:flex flex-col h-full p-4 gap-3 overflow-hidden" style={{ background: 'var(--bg-card)' }}>

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
              {currentPrice != null ? currentPrice.toFixed(asset.decimals) : '—'}
            </div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Current Price</div>
          </div>
        </div>

        {isDemo && demoBalance != null && (
          <div className="flex rounded-lg px-3 py-2 items-center justify-between"
               style={{ background: 'rgba(255,180,0,0.07)', border: '1px solid rgba(255,180,0,0.2)' }}>
            <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,180,0,0.7)' }}>DEMO BALANCE</span>
            <span className="font-mono font-black text-sm" style={{ color: '#ffb400' }}>
              {demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BT
            </span>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

        {/* Duration */}
        <div>
          <div className="text-xs font-bold tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.4)' }}>DURATION</div>
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

        {/* Amount */}
        <div>
          <div className="text-xs font-bold tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.4)' }}>INVESTMENT (USDC)</div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>$</span>
            <input type="number" value={amount}
                   onChange={e => !activeBet && setAmount(e.target.value)}
                   disabled={!!activeBet}
                   className="w-full pl-7 pr-4 py-2.5 rounded-lg text-sm font-mono font-bold outline-none"
                   style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>
          <div className="flex gap-2 mt-2">
            {[10, 25, 50, 100].map(v => (
              <button key={v} onClick={() => !activeBet && setAmount(String(v))}
                      className="flex-1 py-1 rounded text-xs font-semibold transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                ${v}
              </button>
            ))}
          </div>
        </div>

        {/* Payout */}
        <div className="rounded-xl p-3 flex justify-between items-center"
             style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.12)' }}>
          <div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Payout if correct</div>
            <div className="font-mono font-black text-xl" style={{ color: '#00ff88' }}>{potentialWin} BT</div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Rate</div>
            <div className="font-bold text-lg" style={{ color: '#00ff88' }}>{payout}%</div>
          </div>
        </div>

        {/* Active trade or BUY/SELL buttons */}
        {activeBet ? (
          <div className="flex flex-col gap-2">
            {/* Status header */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg"
                 style={{ background: statusBg, border: `1px solid ${statusBorder}` }}>
              <span className="text-xs font-black tracking-widest" style={{ color: statusColor }}>
                {tradeStatus === 'winning' ? '● WINNING' : tradeStatus === 'losing' ? '● LOSING' : '● OPEN'}
              </span>
              {tradeStatus === 'winning' && (
                <span className="text-sm font-black" style={{ color: '#00ff88' }}>+{potentialWin} BT</span>
              )}
              {tradeStatus === 'losing' && (
                <span className="text-sm font-black" style={{ color: '#ff3356' }}>-{activeBet.amount} BT</span>
              )}
            </div>

            {/* Circular countdown */}
            <div className="flex items-center gap-4 px-2">
              <div className="relative w-20 h-20 shrink-0">
                <svg width="80" height="80" className="-rotate-90">
                  <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                  <circle cx="40" cy="40" r="28" fill="none"
                          stroke={statusColor}
                          strokeWidth="4"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.2s linear' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-black leading-none">{countdown ?? '--'}</div>
                  <div className="text-xs leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>sec</div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold"
                     style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
                  {activeBet.direction === 'up' ? '▲ BUY' : '▼ SELL'} · ${activeBet.amount}
                </div>
                <div className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Entry &nbsp;{activeBet.entryPrice.toFixed(asset.decimals)}
                </div>
                <div className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Current {currentPrice != null ? currentPrice.toFixed(asset.decimals) : '—'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => handleBet('up')}
                    className="btn-up flex-1 py-4 rounded-xl text-base font-black flex flex-col items-center gap-1">
              <span className="text-xl">▲</span>
              <span>BUY</span>
              <span className="text-xs font-semibold" style={{ opacity: 0.7 }}>+{payout}%</span>
            </button>
            <button onClick={() => handleBet('down')}
                    className="btn-down flex-1 py-4 rounded-xl text-base font-black flex flex-col items-center gap-1">
              <span className="text-xl">▼</span>
              <span>SELL</span>
              <span className="text-xs font-semibold" style={{ opacity: 0.8 }}>+{payout}%</span>
            </button>
          </div>
        )}

        {insufficientVisible && (
          <div className="rounded-xl p-3 text-center font-bold text-sm"
               style={{ background: 'rgba(255,180,0,0.1)', border: '1px solid rgba(255,180,0,0.35)', color: '#ffb400', animation: 'fade-up 0.3s ease' }}>
            Insufficient balance
          </div>
        )}

        {resultVisible && result && (
          <div className="rounded-xl p-4 text-center"
               style={{
                 background: result === 'win' ? 'rgba(0,255,136,0.12)' : 'rgba(255,51,86,0.1)',
                 border: `1px solid ${result === 'win' ? 'rgba(0,255,136,0.35)' : 'rgba(255,51,86,0.35)'}`,
                 animation: 'fade-up 0.4s ease',
               }}>
            <div className="text-xs font-bold tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>TRADE CLOSED</div>
            <div className="font-black text-2xl" style={{ color: result === 'win' ? '#00ff88' : '#ff3356' }}>
              {result === 'win' ? `+${potentialWin} BT` : `-${amount} BT`}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
