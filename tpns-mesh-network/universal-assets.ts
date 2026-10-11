export interface ValueElement {
  id: number;
  symbol: string;
  name: string;
  tier: 'fiat' | 'crypto' | 'equity' | 'commodity' | 'bond';
  baseDecimals: number;
  canonicalUnitValueUsd: number;
  seriesSpv: string;
  underlyingPhysicalAnchor: string;
  color: string;
}

export const UNIVERSAL_VALUE_ELEMENTS: ValueElement[] = [
  // Tier I: Forex / Sovereign Fiat Currencies
  {
    id: 1001,
    symbol: 'USD',
    name: 'US Dollar',
    tier: 'fiat',
    baseDecimals: 6,
    canonicalUnitValueUsd: 1.0,
    seriesSpv: 'TPNS Series F-USD',
    underlyingPhysicalAnchor: 'Federal Reserve Monetary Base Parity',
    color: '#00d4ff'
  },
  {
    id: 1002,
    symbol: 'EUR',
    name: 'Euro',
    tier: 'fiat',
    baseDecimals: 6,
    canonicalUnitValueUsd: 1.085,
    seriesSpv: 'TPNS Series F-EUR',
    underlyingPhysicalAnchor: 'ECB Sovereign Eurozone Clearing',
    color: '#3399ff'
  },
  {
    id: 1003,
    symbol: 'GBP',
    name: 'British Pound',
    tier: 'fiat',
    baseDecimals: 6,
    canonicalUnitValueUsd: 1.305,
    seriesSpv: 'TPNS Series F-GBP',
    underlyingPhysicalAnchor: 'Bank of England Sterling Settlement',
    color: '#5577ff'
  },
  {
    id: 1004,
    symbol: 'JPY',
    name: 'Japanese Yen',
    tier: 'fiat',
    baseDecimals: 2,
    canonicalUnitValueUsd: 0.0067,
    seriesSpv: 'TPNS Series F-JPY',
    underlyingPhysicalAnchor: 'Bank of Japan Monetary Base',
    color: '#77aaff'
  },
  {
    id: 1005,
    symbol: 'CHF',
    name: 'Swiss Franc',
    tier: 'fiat',
    baseDecimals: 6,
    canonicalUnitValueUsd: 1.155,
    seriesSpv: 'TPNS Series F-CHF',
    underlyingPhysicalAnchor: 'Swiss National Bank Vault Parity',
    color: '#99ccff'
  },

  // Tier II: Crypto & Sovereign Digital Tokens
  {
    id: 2001,
    symbol: 'BTC',
    name: 'Bitcoin',
    tier: 'crypto',
    baseDecimals: 8,
    canonicalUnitValueUsd: 68500.0,
    seriesSpv: 'TPNS Series C-BTC',
    underlyingPhysicalAnchor: 'SHA-256 Proof-of-Work Thermodynamic Invariant',
    color: '#f7931a'
  },
  {
    id: 2002,
    symbol: 'ETH',
    name: 'Ethereum',
    tier: 'crypto',
    baseDecimals: 18,
    canonicalUnitValueUsd: 3450.0,
    seriesSpv: 'TPNS Series C-ETH',
    underlyingPhysicalAnchor: 'EVM Proof-of-Stake Consensus Security',
    color: '#627eea'
  },
  {
    id: 2003,
    symbol: 'SOL',
    name: 'Solana',
    tier: 'crypto',
    baseDecimals: 9,
    canonicalUnitValueUsd: 175.0,
    seriesSpv: 'TPNS Series C-SOL',
    underlyingPhysicalAnchor: 'Proof-of-History High-Frequency Slot Cluster',
    color: '#14f195'
  },
  {
    id: 2004,
    symbol: 'PROM',
    name: 'Promethean Sovereign Coin',
    tier: 'crypto',
    baseDecimals: 18,
    canonicalUnitValueUsd: 25.0,
    seriesSpv: 'TPNS Series C-PROM',
    underlyingPhysicalAnchor: 'Biological PoW & ACOM Holographic Mesh',
    color: '#00ffcc'
  },
  {
    id: 2005,
    symbol: 'USDC',
    name: 'USD Coin',
    tier: 'crypto',
    baseDecimals: 6,
    canonicalUnitValueUsd: 1.0,
    seriesSpv: 'TPNS Series C-USDC',
    underlyingPhysicalAnchor: 'Regulated Short-Duration Treasury Reserves',
    color: '#2775ca'
  },

  // Tier III: Equities & Stock Exchanges
  {
    id: 3001,
    symbol: 'SPY',
    name: 'S&P 500 Index Trust',
    tier: 'equity',
    baseDecimals: 4,
    canonicalUnitValueUsd: 585.0,
    seriesSpv: 'TPNS Series E-SPY',
    underlyingPhysicalAnchor: 'Consolidated US Large-Cap Industrial Base',
    color: '#a855f7'
  },
  {
    id: 3002,
    symbol: 'QQQ',
    name: 'Invesco NASDAQ-100',
    tier: 'equity',
    baseDecimals: 4,
    canonicalUnitValueUsd: 495.0,
    seriesSpv: 'TPNS Series E-QQQ',
    underlyingPhysicalAnchor: 'Global Technology Capital Infrastructure',
    color: '#c084fc'
  },
  {
    id: 3003,
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    tier: 'equity',
    baseDecimals: 4,
    canonicalUnitValueUsd: 135.0,
    seriesSpv: 'TPNS Series E-NVDA',
    underlyingPhysicalAnchor: 'High-Performance GPU Semiconductor Capacity',
    color: '#76b900'
  },
  {
    id: 3004,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    tier: 'equity',
    baseDecimals: 4,
    canonicalUnitValueUsd: 230.0,
    seriesSpv: 'TPNS Series E-AAPL',
    underlyingPhysicalAnchor: 'Global Consumer Electronics Hardware Matrix',
    color: '#e2e8f0'
  },
  {
    id: 3005,
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    tier: 'equity',
    baseDecimals: 4,
    canonicalUnitValueUsd: 220.0,
    seriesSpv: 'TPNS Series E-TSLA',
    underlyingPhysicalAnchor: 'Robotics, Autonomous Fleet & Micro-Storage',
    color: '#e11d48'
  },

  // Tier IV: Commodities, Real Assets & Physical Energy
  {
    id: 4001,
    symbol: 'XAU',
    name: 'Gold (1 Troy Ounce)',
    tier: 'commodity',
    baseDecimals: 6,
    canonicalUnitValueUsd: 2650.0,
    seriesSpv: 'TPNS Series M-GOLD',
    underlyingPhysicalAnchor: 'London Bullion Market Allocated Vault Bar',
    color: '#ffd700'
  },
  {
    id: 4002,
    symbol: 'XAG',
    name: 'Silver (1 Troy Ounce)',
    tier: 'commodity',
    baseDecimals: 6,
    canonicalUnitValueUsd: 31.5,
    seriesSpv: 'TPNS Series M-SILVER',
    underlyingPhysicalAnchor: 'Physical Allocated Commercial Grade Silver',
    color: '#c0c0c0'
  },
  {
    id: 4003,
    symbol: 'WTI',
    name: 'Crude Oil (1 Barrel)',
    tier: 'commodity',
    baseDecimals: 4,
    canonicalUnitValueUsd: 78.5,
    seriesSpv: 'TPNS Series M-OIL',
    underlyingPhysicalAnchor: 'Cushing Physical Light Sweet Delivery Pipeline',
    color: '#d97706'
  },
  {
    id: 4004,
    symbol: 'SOLAR',
    name: 'Solar Energy (1 kWh)',
    tier: 'commodity',
    baseDecimals: 6,
    canonicalUnitValueUsd: 0.14,
    seriesSpv: 'TPNS Series M-SOLAR',
    underlyingPhysicalAnchor: '42.5 kW Microgrid Inverter Telemetry Anchor',
    color: '#10b981'
  },
  {
    id: 4005,
    symbol: 'COMPUTE',
    name: 'GPU Compute Loop (1 FLOP-Hr)',
    tier: 'commodity',
    baseDecimals: 6,
    canonicalUnitValueUsd: 0.85,
    seriesSpv: 'TPNS Series M-COMPUTE',
    underlyingPhysicalAnchor: 'Stateless H100 GPU Cluster Execution Slice',
    color: '#06b6d4'
  },

  // Tier V: Sovereign Bonds & Fixed Income Yields
  {
    id: 5001,
    symbol: 'US10Y',
    name: 'US 10-Year Benchmark Treasury Note',
    tier: 'bond',
    baseDecimals: 6,
    canonicalUnitValueUsd: 98.5,
    seriesSpv: 'TPNS Series B-US10Y',
    underlyingPhysicalAnchor: 'Direct CUSIP Custody Book-Entry Parity',
    color: '#f43f5e'
  },
  {
    id: 5002,
    symbol: 'US02Y',
    name: 'US 2-Year Treasury Note',
    tier: 'bond',
    baseDecimals: 6,
    canonicalUnitValueUsd: 99.2,
    seriesSpv: 'TPNS Series B-US02Y',
    underlyingPhysicalAnchor: 'Short-Duration Sovereign Debt Direct Reserve',
    color: '#fb7185'
  },
  {
    id: 5003,
    symbol: 'BUND10Y',
    name: 'German Euro-Bund (10-Year)',
    tier: 'bond',
    baseDecimals: 6,
    canonicalUnitValueUsd: 104.2,
    seriesSpv: 'TPNS Series B-BUND',
    underlyingPhysicalAnchor: 'Federal Republic of Germany Sovereign Obligation',
    color: '#fda4af'
  }
];

export class HolographicUnitRegistry {
  private elements: Map<number, ValueElement>;
  private symbolIndex: Map<string, ValueElement>;

  constructor() {
    this.elements = new Map();
    this.symbolIndex = new Map();
    for (const el of UNIVERSAL_VALUE_ELEMENTS) {
      this.elements.set(el.id, el);
      this.symbolIndex.set(el.symbol, el);
    }
  }

  public getById(id: number): ValueElement | undefined {
    return this.elements.get(id);
  }

  public getBySymbol(symbol: string): ValueElement | undefined {
    return this.symbolIndex.get(symbol);
  }

  public getAll(): ValueElement[] {
    return Array.from(this.elements.values());
  }

  /**
   * Deterministic cross-rate between exactly 1 unit of Asset A and 1 unit of Asset B
   */
  public calculateHolographicRate(srcId: number, tgtId: number): number {
    const src = this.getById(srcId);
    const tgt = this.getById(tgtId);
    if (!src || !tgt || tgt.canonicalUnitValueUsd === 0) return 1.0;
    return src.canonicalUnitValueUsd / tgt.canonicalUnitValueUsd;
  }
}
