export type Category = 'crypto' | 'forex' | 'commodity' | 'stock';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: Category;
  basePrice: number;
  icon: string;
  decimals: number;
}

export const ASSETS: Asset[] = [
  // Crypto
  { id: 'btc', symbol: 'BTC/USD', name: 'Bitcoin',    category: 'crypto',    basePrice: 97420,  icon: '₿',  decimals: 2 },
  { id: 'eth', symbol: 'ETH/USD', name: 'Ethereum',   category: 'crypto',    basePrice: 3284,   icon: 'Ξ',  decimals: 2 },
  { id: 'sol', symbol: 'SOL/USD', name: 'Solana',     category: 'crypto',    basePrice: 182.4,  icon: '◎',  decimals: 2 },
  { id: 'bnb', symbol: 'BNB/USD', name: 'BNB',        category: 'crypto',    basePrice: 608.5,  icon: 'B',  decimals: 2 },
  { id: 'avax',symbol: 'AVAX/USD',name: 'Avalanche',  category: 'crypto',    basePrice: 38.72,  icon: 'A',  decimals: 3 },
  // Forex
  { id: 'eurusd', symbol: 'EUR/USD', name: 'Euro',        category: 'forex', basePrice: 1.0842, icon: '€',  decimals: 4 },
  { id: 'gbpusd', symbol: 'GBP/USD', name: 'Pound',       category: 'forex', basePrice: 1.2658, icon: '£',  decimals: 4 },
  { id: 'usdjpy', symbol: 'USD/JPY', name: 'Yen',         category: 'forex', basePrice: 149.54, icon: '¥',  decimals: 2 },
  { id: 'audusd', symbol: 'AUD/USD', name: 'Aussie',      category: 'forex', basePrice: 0.6521, icon: 'A$', decimals: 4 },
  { id: 'usdchf', symbol: 'USD/CHF', name: 'Swissy',      category: 'forex', basePrice: 0.8914, icon: 'Fr', decimals: 4 },
  // Commodities
  { id: 'gold',  symbol: 'XAU/USD', name: 'Gold',         category: 'commodity', basePrice: 2348.2, icon: '🥇', decimals: 2 },
  { id: 'oil',   symbol: 'WTI/USD', name: 'Crude Oil',    category: 'commodity', basePrice: 78.64,  icon: '🛢', decimals: 2 },
  { id: 'silver',symbol: 'XAG/USD', name: 'Silver',       category: 'commodity', basePrice: 27.83,  icon: '🥈', decimals: 3 },
  { id: 'steel', symbol: 'STEEL',   name: 'Steel',        category: 'commodity', basePrice: 682.5,  icon: '⚙️', decimals: 2 },
  { id: 'natgas',symbol: 'NATGAS',  name: 'Natural Gas',  category: 'commodity', basePrice: 2.458,  icon: '🔥', decimals: 3 },
  // Stocks
  { id: 'aapl',  symbol: 'AAPL',    name: 'Apple',        category: 'stock', basePrice: 185.4,  icon: '🍎', decimals: 2 },
  { id: 'tsla',  symbol: 'TSLA',    name: 'Tesla',        category: 'stock', basePrice: 248.7,  icon: '⚡', decimals: 2 },
  { id: 'nvda',  symbol: 'NVDA',    name: 'NVIDIA',       category: 'stock', basePrice: 875.3,  icon: '🎮', decimals: 2 },
  { id: 'msft',  symbol: 'MSFT',    name: 'Microsoft',    category: 'stock', basePrice: 420.8,  icon: '🪟', decimals: 2 },
  { id: 'amzn',  symbol: 'AMZN',    name: 'Amazon',       category: 'stock', basePrice: 184.2,  icon: '📦', decimals: 2 },
];

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'crypto',    label: 'Crypto' },
  { id: 'forex',     label: 'Forex' },
  { id: 'commodity', label: 'Commodities' },
  { id: 'stock',     label: 'Stocks' },
];

export const DURATIONS = [
  { label: '5s',  seconds: 5  },
  { label: '10s', seconds: 10 },
  { label: '15s', seconds: 15 },
  { label: '30s', seconds: 30 },
  { label: '1m',  seconds: 60 },
];
