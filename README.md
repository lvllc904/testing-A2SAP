# testing A2SAP

TPNS Standalone Serverless Exchange Engine & Holographic Chain Visualizer.

## Overview
This repository contains the standalone test environment for the **TPNS Holographic Chain & Exchange Subsystem** (A2SAP / A2SPA pressure test framework):
- **3D Holographic Parity Chain Visualizer** (`dist/index.html`): Interactive Three.js/WebGL holographic canvas with central Parity Orb ($\Phi$), logarithmic orbital distance mapping asset price, volume radiant halo intensity, and real-time sparkline/candlestick tracking.
- **Sovereign Mesh P2P Engine** (`tpns-mesh-network/`): Zero-login WebRTC & WebSocket mesh transport.
- **Local ZK Privacy & Commitment Generator** (`tpns_zk_privacy/`): Client-side zk-SNARK commitments.
- **Off-chain Matching Engine** (`tpns_matching_engine/`): High-throughput orderbook with price-time priority.
- **Sovereign Settlement Contracts** (`contracts/`): Hardhat EVM settlement verification.
- **A2SAP Pressure Tests** (`test/`): Mesh benchmark and stress-testing suites.

## Getting Started

### Local Holographic Visualizer
Run the local HTTP test server:
```bash
python3 serve.py 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Suites
```bash
npm install
npm run compile:contracts
npm run test:mesh-benchmarks
npm run test:a2spa
```
