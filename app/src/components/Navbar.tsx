'use client';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';

interface Props {
  onLogoClick?: () => void;
}

export default function Navbar({ onLogoClick }: Props) {
  const [volume, setVolume] = useState(3_284_710);
  const [trades, setTrades] = useState(1_847);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVolume(v => v + Math.floor(Math.random() * 2400 + 600));
      setTrades(t => t + (Math.random() > 0.6 ? 1 : 0));
      setBlink(b => !b);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14"
      style={{
        background: 'rgba(7,10,16,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <button onClick={onLogoClick} className="flex items-center gap-3 focus:outline-none">
        <div className="text-xl font-black tracking-widest select-none">
          <span className="text-white">BIR</span>
          <span style={{ color: '#00ff88', textShadow: '0 0 16px rgba(0,255,136,0.5)' }}>EX</span>
        </div>
        <span className="hidden sm:block text-xs font-medium px-2 py-0.5 rounded"
              style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.25)' }}>
          BETA
        </span>
      </button>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-6 text-sm font-medium"
           style={{ color: 'rgba(255,255,255,0.4)' }}>
        <a href="#" className="hover:text-white transition-colors duration-150">Markets</a>
        <a href="#" className="hover:text-white transition-colors duration-150">Leaderboard</a>
        <a href="#" className="hover:text-white transition-colors duration-150">How it works</a>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-5">
        {/* Live stats */}
        <div className="hidden lg:flex items-center gap-5 text-xs">
          <div>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>Vol 24h&nbsp;</span>
            <span className="font-mono font-bold" style={{ color: '#00ff88' }}>
              ${(volume / 1_000_000).toFixed(2)}M
            </span>
          </div>
          <div>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>Trades&nbsp;</span>
            <span className="font-mono font-bold" style={{ color: '#00ff88' }}>
              {trades.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full ping-ring"
                   style={{ background: '#00ff88', opacity: 0.4 }} />
              <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#00ff88' }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>LIVE</span>
          </div>
        </div>

        <WalletMultiButton />
      </div>
    </nav>
  );
}
