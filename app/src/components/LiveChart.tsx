'use client';
import { useEffect, useRef, useCallback } from 'react';
import { Asset } from '@/lib/assets';

interface Props {
  asset: Asset;
  history: number[];
  currentPrice: number | undefined;
  activeBet: { direction: 'up' | 'down'; entryPrice: number; expiresAt: number } | null;
}

export default function LiveChart({ asset, history, currentPrice, activeBet }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const animPriceRef = useRef<number | null>(null);
  const targetPriceRef = useRef<number | null>(null);

  const historyRef = useRef(history);
  const assetRef = useRef(asset);
  const activeBetRef = useRef(activeBet);

  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { assetRef.current = asset; }, [asset]);
  useEffect(() => { activeBetRef.current = activeBet; }, [activeBet]);

  useEffect(() => {
    if (currentPrice == null) return;
    targetPriceRef.current = currentPrice;
    if (animPriceRef.current == null) animPriceRef.current = currentPrice;
  }, [currentPrice]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ap = animPriceRef.current;
    const h = historyRef.current;
    const ast = assetRef.current;
    const ab = activeBetRef.current;

    if (ap == null || h.length === 0) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const PAD_L = 10, PAD_R = 64, PAD_T = 20, PAD_B = 32;
    const chartW = W - PAD_L - PAD_R;
    const chartH = H - PAD_T - PAD_B;

    // Replace last history point with animated price for smooth line tip
    const data = h.filter(Boolean);
    if (data.length < 2) return;
    data[data.length - 1] = ap;

    const rawMin = Math.min(...data);
    const rawMax = Math.max(...data);
    const dataRange = rawMax - rawMin;
    const pad = Math.max(dataRange * 0.15, rawMin * 0.0004);
    const min = rawMin - pad;
    const max = rawMax + pad;
    const range = max - min;

    const toX = (i: number) => PAD_L + (i / (data.length - 1)) * chartW;
    const toY = (v: number) => PAD_T + chartH - ((v - min) / range) * chartH;

    ctx.clearRect(0, 0, W, H);

    /* ── Grid ── */
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= 4; r++) {
      const y = PAD_T + (r / 4) * chartH;
      ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(W - PAD_R, y); ctx.stroke();
      const label = (max - (r / 4) * range).toFixed(ast.decimals);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, W - PAD_R + 6, y + 4);
    }

    /* ── Entry price line ── */
    if (ab) {
      const ey = toY(ab.entryPrice);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = ab.direction === 'up' ? 'rgba(0,255,136,0.5)' : 'rgba(255,51,86,0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(PAD_L, ey); ctx.lineTo(W - PAD_R, ey); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '9px monospace';
      ctx.fillStyle = ab.direction === 'up' ? '#00ff88' : '#ff3356';
      ctx.textAlign = 'left';
      ctx.fillText('ENTRY', W - PAD_R + 6, ey - 2);
    }

    /* ── Area fill ── */
    const grad = ctx.createLinearGradient(0, PAD_T, 0, PAD_T + chartH);
    grad.addColorStop(0,   'rgba(0,255,136,0.18)');
    grad.addColorStop(0.5, 'rgba(0,255,136,0.06)');
    grad.addColorStop(1,   'rgba(0,255,136,0)');
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0]));
    for (let i = 1; i < data.length; i++) {
      const x0 = toX(i - 1), y0 = toY(data[i - 1]);
      const x1 = toX(i),     y1 = toY(data[i]);
      const cx = (x0 + x1) / 2;
      ctx.bezierCurveTo(cx, y0, cx, y1, x1, y1);
    }
    ctx.lineTo(toX(data.length - 1), PAD_T + chartH);
    ctx.lineTo(PAD_L, PAD_T + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    /* ── Main line ── */
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur  = 8;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0]));
    for (let i = 1; i < data.length; i++) {
      const x0 = toX(i - 1), y0 = toY(data[i - 1]);
      const x1 = toX(i),     y1 = toY(data[i]);
      const cx = (x0 + x1) / 2;
      ctx.bezierCurveTo(cx, y0, cx, y1, x1, y1);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    /* ── Current price dot ── */
    const lastX = toX(data.length - 1);
    const lastY = toY(ap);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,255,136,0.15)';
    ctx.fill();
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur  = 12;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
    ctx.shadowBlur = 0;

    /* ── Current price label ── */
    const pLabel = ap.toFixed(ast.decimals);
    const labelW = ctx.measureText(pLabel).width + 14;
    const labelH = 20;
    const lx = W - PAD_R + 6;
    const ly = lastY - labelH / 2;
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.roundRect(lx, ly, labelW, labelH, 4);
    ctx.fill();
    ctx.fillStyle = '#070a10';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(pLabel, lx + 7, ly + 13);
  }, []);

  /* ── 60fps rAF loop with lerp ── */
  useEffect(() => {
    const LERP = 0.12;
    const loop = () => {
      if (targetPriceRef.current != null && animPriceRef.current != null) {
        animPriceRef.current += (targetPriceRef.current - animPriceRef.current) * LERP;
        drawFrame();
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawFrame]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
      {(currentPrice == null || history.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Price unavailable
          </span>
        </div>
      )}
    </div>
  );
}
