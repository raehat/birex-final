'use client';
import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface Props {
  onEnter: () => void;
}

const STATS = [
  { label: 'Total Volume', value: '$284M+' },
  { label: 'Active Traders', value: '47K+' },
  { label: 'Settled Trades', value: '2.1M+' },
  { label: 'Max Payout', value: '195%' },
];

const FLOATING_ASSETS = [
  { symbol: 'BTC', color: '#f7931a', x: '10%', y: '20%', delay: 0 },
  { symbol: 'ETH', color: '#627eea', x: '85%', y: '15%', delay: 1.2 },
  { symbol: 'SOL', color: '#9945ff', x: '78%', y: '70%', delay: 2.4 },
  { symbol: 'EUR', color: '#00ff88', x: '5%',  y: '72%', delay: 0.8 },
  { symbol: 'GOLD', color: '#ffd700', x: '20%', y: '85%', delay: 1.6 },
  { symbol: 'OIL', color: '#8b6914', x: '90%', y: '45%', delay: 3 },
];

export default function Hero({ onEnter }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { connected } = useWallet();
  const [entered, setEntered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (connected && !entered) {
      const t = setTimeout(() => { setEntered(true); onEnter(); }, 600);
      return () => clearTimeout(t);
    }
  }, [connected, entered, onEnter]);

  /* Canvas particle network */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type Particle = { x: number; y: number; vx: number; vy: number; r: number; o: number };
    const N = 70;
    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 0.4,
      o: Math.random() * 0.4 + 0.08,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* grid */
      ctx.strokeStyle = 'rgba(0,255,136,0.025)';
      ctx.lineWidth = 1;
      const g = 56;
      for (let x = 0; x < canvas.width; x += g) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += g) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      /* particles */
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;  if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.fillStyle = `rgba(0,255,136,${p.o})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }

      /* connections */
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.hypot(dx, dy);
          if (d < 110) {
            ctx.strokeStyle = `rgba(0,255,136,${0.06 * (1 - d / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#070a10' }}>
      {/* Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 65% 55% at 50% 48%, rgba(0,255,136,0.06) 0%, transparent 70%)',
        zIndex: 1,
      }} />

      {/* Scanline */}
      <div className="scanline-anim" style={{ zIndex: 2 }} />

      {/* Floating asset chips */}
      {FLOATING_ASSETS.map((a, i) => (
        <div key={a.symbol}
             className="absolute select-none pointer-events-none"
             style={{
               left: a.x, top: a.y, zIndex: 2,
               animation: `float-slow ${6 + i * 0.6}s ease-in-out ${a.delay}s infinite`,
             }}>
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
               style={{
                 background: 'rgba(13,20,34,0.7)',
                 border: `1px solid ${a.color}33`,
                 color: a.color,
                 backdropFilter: 'blur(8px)',
                 boxShadow: `0 0 16px ${a.color}22`,
               }}>
            <span>{a.symbol}</span>
          </div>
        </div>
      ))}

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center flex-1 text-center px-6 py-24"
           style={{ zIndex: 3 }}>

        {/* Live badge */}
        <div className="fade-up-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
             style={{
               background: 'rgba(0,255,136,0.08)',
               border: '1px solid rgba(0,255,136,0.3)',
               color: '#00ff88',
             }}>
          <div className="relative w-2 h-2">
            <div className="absolute inset-0 rounded-full ping-ring" style={{ background: '#00ff88' }} />
            <div className="w-2 h-2 rounded-full" style={{ background: '#00ff88' }} />
          </div>
          LIVE ON SOLANA DEVNET
        </div>

        {/* Logo */}
        <h1 className="fade-up-2 font-black tracking-tight leading-none mb-6 select-none"
            style={{ fontSize: 'clamp(72px, 14vw, 160px)' }}>
          <span className="text-white">BIR</span>
          <span style={{ color: '#00ff88', textShadow: '0 0 60px rgba(0,255,136,0.5)' }}>EX</span>
        </h1>

        {/* Tagline */}
        <p className="fade-up-3 text-base md:text-xl font-semibold mb-3 tracking-widest uppercase"
           style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.25em' }}>
          Peer-to-Peer Binary Trading
        </p>

        <p className="fade-up-4 text-sm md:text-base mb-12 max-w-xl"
           style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.8 }}>
          Trade crypto, forex, commodities & stocks. Win up to&nbsp;
          <span style={{ color: '#00ff88', fontWeight: 700 }}>195%</span> in as little as&nbsp;
          <span style={{ color: '#00ff88', fontWeight: 700 }}>5 seconds</span>. No middlemen, fully on-chain.
        </p>

        {/* Feature pills */}
        <div className="fade-up-4 flex flex-wrap justify-center gap-3 mb-12">
          {[
            ['⚡', '5-second Rounds'],
            ['🔗', 'On-Chain Settlement'],
            ['🔒', 'Non-Custodial'],
            ['🌐', '20+ Assets'],
            ['💎', 'Up to 195% Payout'],
          ].map(([icon, label]) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                 style={{
                   background: 'rgba(255,255,255,0.04)',
                   border: '1px solid rgba(255,255,255,0.09)',
                   color: 'rgba(255,255,255,0.65)',
                 }}>
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="fade-up-5 grid grid-cols-2 md:grid-cols-4 gap-8 mb-14 w-full max-w-2xl">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-black mb-1"
                   style={{ color: '#00ff88', textShadow: '0 0 20px rgba(0,255,136,0.35)' }}>
                {s.value}
              </div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="fade-up-6 flex flex-col items-center gap-4">
          {mounted && <WalletMultiButton />}
          {connected && (
            <button onClick={onEnter}
                    className="text-sm font-semibold underline underline-offset-4"
                    style={{ color: '#00ff88' }}>
              Enter Trading Platform →
            </button>
          )}
          {!connected && (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Connect your Solana wallet to start trading
            </p>
          )}
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
           style={{ background: 'linear-gradient(transparent, #070a10)', zIndex: 4 }} />
    </div>
  );
}
