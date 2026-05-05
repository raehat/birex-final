'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TradingView from '@/components/TradingView';

export default function Home() {
  const [view, setView] = useState<'hero' | 'trading'>('hero');

  if (view === 'trading') {
    return <TradingView onBackToHero={() => setView('hero')} />;
  }

  return (
    <>
      <Navbar onLogoClick={() => setView('hero')} />
      <div className="pt-14">
        <Hero onEnter={() => setView('trading')} />
      </div>
    </>
  );
}
