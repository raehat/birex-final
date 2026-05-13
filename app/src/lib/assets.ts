export type Category = 'crypto' | 'forex' | 'commodity' | 'stock';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: Category;
  icon: string;
  decimals: number;
  pythId?: string;
}

export const ASSETS: Asset[] = [
  // Crypto
  { id: 'btc',  symbol: 'BTC/USD',  name: 'Bitcoin',     category: 'crypto',    icon: '₿',  decimals: 2, pythId: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43' },
  { id: 'eth',  symbol: 'ETH/USD',  name: 'Ethereum',    category: 'crypto',    icon: 'Ξ',  decimals: 2, pythId: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace' },
  { id: 'sol',  symbol: 'SOL/USD',  name: 'Solana',      category: 'crypto',    icon: '◎',  decimals: 2, pythId: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d' },
  { id: 'bnb',  symbol: 'BNB/USD',  name: 'BNB',         category: 'crypto',    icon: 'B',  decimals: 2, pythId: '2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f' },
  { id: 'avax', symbol: 'AVAX/USD', name: 'Avalanche',   category: 'crypto',    icon: 'A',  decimals: 3, pythId: '93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7' },
  // Forex
  { id: 'eurusd', symbol: 'EUR/USD', name: 'Euro',   category: 'forex', icon: '€',  decimals: 4, pythId: 'a995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b' },
  { id: 'gbpusd', symbol: 'GBP/USD', name: 'Pound',  category: 'forex', icon: '£',  decimals: 4, pythId: '84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1' },
  { id: 'usdjpy', symbol: 'USD/JPY', name: 'Yen',    category: 'forex', icon: '¥',  decimals: 2, pythId: 'ef2c98c804ba503c6a707e38be4dfbb16683bab87823a19eb8e9d498e8030e77' },
  { id: 'audusd', symbol: 'AUD/USD', name: 'Aussie', category: 'forex', icon: 'A$', decimals: 4, pythId: '67a6f93030420c1c9e3fe37c1ab6b77966af82f995944a9fefce357a22854a80' },
  { id: 'usdchf', symbol: 'USD/CHF', name: 'Swissy', category: 'forex', icon: 'Fr', decimals: 4, pythId: '0b1e3297e69f162877b577b0d6a47a0d63b2392bc8499e6540da4187a63e28f5' },
  // Commodities
  { id: 'gold',   symbol: 'XAU/USD', name: 'Gold',        category: 'commodity', icon: '🥇', decimals: 2, pythId: '765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2' },
  { id: 'oil',    symbol: 'WTI/USD', name: 'Crude Oil',   category: 'commodity', icon: '🛢', decimals: 2, pythId: '0f5f9c26c12a5b8b8a7b62d5e4f8a38b70d1d4f8b8e9f4b50d5b3c6e1a0e9f2b' },
  { id: 'silver', symbol: 'XAG/USD', name: 'Silver',      category: 'commodity', icon: '🥈', decimals: 3, pythId: 'f2fb02c32b055c805e7238d628e5e9dadef274376114eb1f012337cabe93871e' },
  { id: 'natgas', symbol: 'NATGAS',  name: 'Natural Gas', category: 'commodity', icon: '🔥', decimals: 3, pythId: '3e49866b2da91ad918f3b3a0c1f01c98e0c50ea5f6f86d8b68e43b33d39b0c38' },
  // Stocks (Pyth prices only available during US market hours)
  { id: 'aapl', symbol: 'AAPL', name: 'Apple',     category: 'stock', icon: '🍎', decimals: 2, pythId: '49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688' },
  { id: 'tsla', symbol: 'TSLA', name: 'Tesla',     category: 'stock', icon: '⚡', decimals: 2, pythId: '16dad506d7db8da01c87581c87ca897a012a153557d4d578c3b9c9e1bc0632f1' },
  { id: 'nvda', symbol: 'NVDA', name: 'NVIDIA',    category: 'stock', icon: '🎮', decimals: 2, pythId: '8ea203ba0a820c7d5ec8b9f3ddf6a4c50bfad4d8d97c9d9dc81a8d02e1cb91f8' },
  { id: 'msft', symbol: 'MSFT', name: 'Microsoft', category: 'stock', icon: '🪟', decimals: 2, pythId: 'd7566a3ba7f7286ed54f4ae7e983f4420ae0b1e0f3892e11f9c4ab107bbad7b9' },
  { id: 'amzn', symbol: 'AMZN', name: 'Amazon',    category: 'stock', icon: '📦', decimals: 2, pythId: 'a5e0bfa11a5a85b04dbd4c0dba13f3e0a2f62fb900afe5c38abb2df58d3feeb5' },
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
