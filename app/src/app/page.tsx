'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TradingView from '@/components/TradingView';
import { usePrices } from '@/hooks/usePrices';

export default function Home() {
  const [view, setView] = useState<'hero' | 'live' | 'demo'>('hero');
  const pricesData = usePrices();

  if (view === 'live') return <TradingView onBackToHero={() => setView('hero')} isDemo={false} pricesData={pricesData} />;
  if (view === 'demo') return <TradingView onBackToHero={() => setView('hero')} isDemo={true} pricesData={pricesData} />;

  return (
    <>
      <Navbar onLogoClick={() => setView('hero')} />
      <div className="pt-14">
        <Hero onDemo={() => setView('demo')} />
      </div>
    </>
  );
}
