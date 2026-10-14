# TPNS Holographic Exchange Subsystem

Standalone serverless exchange engine and holographic chain visualizer for the Promethean Network State.

## Overview

This repository contains the isolated test environment for the **TPNS Holographic Chain & Exchange Subsystem**:

- **3D Holographic Parity Chain Visualizer** (`dist/index.html`): Interactive Three.js/WebGL holographic canvas with central Parity Orb (Φ), logarithmic orbital distance mapping asset price, volume radiant halo intensity, and real-time sparkline/candlestick tracking across 23 universal asset tiers.
- **Sovereign Mesh P2P Engine** (`tpns-mesh-network/`): Zero-login WebRTC & WebSocket mesh transport with hardware-bridge and bootstrap profiling.
- **Local ZK Privacy & Commitment Generator** (`tpns_zk_privacy/`): Client-side blind order commitment generation compiled to WebAssembly.
- **Off-chain Matching Engine** (`tpns_matching_engine/`): High-throughput holographic orderbook with price-time priority and O(1) state invariant, compiled to WebAssembly.
- **ASGI Liquidity Balancer** (`tpns_asgi_liquidity/`): Autonomous AMM invariant engine (x·y=k) for internal pool rebalancing, compiled to WebAssembly.
- **RWA Cartographer** (`tpns_cartographer/`): Real-world asset tokenization and geospatial anchor mapping, compiled to WebAssembly.
- **Sovereign Settlement Contracts** (`contracts/`): Hardhat EVM settlement verification with EIP-7212 P256 passkey authentication.
- **Integration Test Suite** (`test/`): Subsystem integration tests covering state invariants, ZK proof verification, cross-tier settlement benchmarks, and SharedArrayBuffer concurrency.

## Getting Started

### Local Holographic Visualizer
```bash
python3 serve.py 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build WASM Modules
```bash
cd tpns_matching_engine && wasm-pack build --target web --out-dir ../dist/pkg && cd ..
cd tpns_zk_privacy && wasm-pack build --target web --out-dir ../dist/pkg/zk && cd ..
cd tpns_asgi_liquidity && wasm-pack build --target web --out-dir ../dist/pkg/asgi && cd ..
cd tpns_cartographer && wasm-pack build --target web --out-dir ../dist/pkg/cartographer && cd ..
```

### Test Suites
```bash
npm install
npm run compile:contracts
npm run test:mesh-benchmarks
npm run test:integration
```

## Architecture

```
tpns-exchange-subsystem/
├── dist/                          # Built artifacts served by serve.py
│   ├── index.html                 # 3D Holographic Visualizer (self-contained)
│   └── pkg/                       # Compiled WASM modules
│       ├── tpns_matching_engine.*
│       ├── zk/tpns_zk_privacy.*
│       ├── asgi/tpns_asgi_liquidity.*
│       └── cartographer/tpns_cartographer.*
├── tpns-mesh-network/             # TypeScript P2P mesh transport layer
├── tpns_matching_engine/          # Rust: holographic orderbook engine
├── tpns_zk_privacy/               # Rust: ZK commitment generator
├── tpns_asgi_liquidity/           # Rust: AMM pool rebalancer
├── tpns_cartographer/             # Rust: RWA tokenization engine
├── contracts/                     # Solidity: on-chain settlement
└── test/                          # Integration test suite
```

## Live Deployment

The holographic visualizer is live at [holographic.lvhllc.org](https://holographic.lvhllc.org).
