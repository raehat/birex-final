'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TradingView from '@/components/TradingView';

export default function Home() {
  const [view, setView] = useState<'hero' | 'live' | 'demo'>('hero');

  if (view === 'live') return <TradingView onBackToHero={() => setView('hero')} isDemo={false} />;
  if (view === 'demo') return <TradingView onBackToHero={() => setView('hero')} isDemo={true} />;

  return (
    <>
      <Navbar onLogoClick={() => setView('hero')} />
      <div className="pt-14">
        <Hero onDemo={() => setView('demo')} />
      </div>
    </>
  );
}
