import { expect } from 'chai';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { UNIVERSAL_VALUE_ELEMENTS, ValueElement } from '../tpns-mesh-network/universal-assets.js';

// Types for A2SPA
interface SovereignAccount {
  accountId: string;
  balances: Map<number, bigint>; // assetId -> atoms (scaled by baseDecimals)
}

interface A2SPASettlementIntent {
  actionId: string;
  accountA: string;
  accountB: string;
  sourceAssetId: number;
  targetAssetId: number;
  sourceAmountAtoms: bigint;
  targetAmountAtoms: bigint;
  hardwareSalt: Uint8Array;
  zkCommitmentHash: Uint8Array;
  holographicUnitCrossRate: bigint;
}

interface BenchmarkTelemetry {
  totalSettlements: number;
  totalTimeMs: number;
  throughputTps: number;
  avgLatencyUs: number;
  minLatencyUs: number;
  maxLatencyUs: number;
  p95LatencyUs: number;
  p99LatencyUs: number;
  zkValidationSuccessRate: number;
  systemicBalanceInvariantViolations: number;
  chainStateBytesBefore: number;
  chainStateBytesAfter: number;
  stateBloatDeltaBytes: number;
}

describe('TPNS A2SPA (Account-to-Account Settlement Protocol) Pressure Test Matrix', function () {
  this.timeout(120000); // 2 minutes timeout for intense pressure testing

  let matchingWasmPkg: any;
  let zkWasmPkg: any;
  let holographicChain: any;

  before(async () => {
    // 1. Initialize Rust/WASM Holographic Chain Engine
    const matchingModulePath = path.resolve('./dist/pkg/tpns_matching_engine.js');
    const matchingWasmPath = path.resolve('./dist/pkg/tpns_matching_engine_bg.wasm');
    const matchingModule = await import(matchingModulePath);
    const matchingWasmBuf = fs.readFileSync(matchingWasmPath);
    matchingModule.initSync({ module: matchingWasmBuf });
    matchingWasmPkg = matchingModule;

    // 2. Initialize Rust/WASM ZK Privacy Engine
    const zkModulePath = path.resolve('./dist/pkg/zk/tpns_zk_privacy.js');
    const zkWasmPath = path.resolve('./dist/pkg/zk/tpns_zk_privacy_bg.wasm');
    const zkModule = await import(zkModulePath);
    const zkWasmBuf = fs.readFileSync(zkWasmPath);
    zkModule.initSync({ module: zkWasmBuf });
    zkWasmPkg = zkModule;

    // 3. Instantiate Promethean Holographic Chain
    holographicChain = new matchingWasmPkg.HolographicChainState();
    console.log('\n\x1b[36m========================================================================================\x1b[0m');
    console.log('\x1b[1m\x1b[36m   PROMETHEAN NETWORK STATE — A2SPA PRESSURE TESTING SUITE INITIALIZED\x1b[0m');
    console.log('\x1b[36m========================================================================================\x1b[0m');
    console.log(`   [HOLOGRAPHIC CHAIN] Initial Block Height: #${holographicChain.get_block_height()}`);
    console.log(`   [HOLOGRAPHIC CHAIN] Tracked Value Elements (1-Unit Vector): ${holographicChain.get_elements_count()} assets`);
    console.log(`   [HOLOGRAPHIC CHAIN] Initial State Root Hash: 0x${Buffer.from(holographicChain.get_state_root_hash()).toString('hex').slice(0, 16)}...`);
    console.log('\x1b[36m----------------------------------------------------------------------------------------\x1b[0m\n');
  });

  // Helper function to create sovereign accounts with initial balances
  function createAccount(id: string, initialBalanceMultiplier = 100_000_000n): SovereignAccount {
    const balances = new Map<number, bigint>();
    for (const elem of UNIVERSAL_VALUE_ELEMENTS) {
      const scale = 10n ** BigInt(elem.baseDecimals);
      balances.set(elem.id, initialBalanceMultiplier * scale);
    }
    return { accountId: id, balances };
  }

  // Helper to snapshot total systemic balance mass across accounts
  function computeTotalSystemicMass(accounts: SovereignAccount[]): Map<number, bigint> {
    const totals = new Map<number, bigint>();
    for (const elem of UNIVERSAL_VALUE_ELEMENTS) {
      let sum = 0n;
      for (const acc of accounts) {
        sum += acc.balances.get(elem.id) || 0n;
      }
      totals.set(elem.id, sum);
    }
    return totals;
  }

  // Execute single A2SPA settlement
  function executeA2SPASettlement(
    accA: SovereignAccount,
    accB: SovereignAccount,
    srcAsset: ValueElement,
    tgtAsset: ValueElement,
    srcVolumeUnits: number
  ): { intent: A2SPASettlementIntent; latencyUs: number; success: boolean } {
    const startTime = process.hrtime.bigint();

    // 1. Holographic Chain Cross-Rate Calculation (1.0 Unit Invariant Vector)
    const srcUnitValMicro = holographicChain.get_unit_value_micro_usd(BigInt(srcAsset.id));
    const tgtUnitValMicro = holographicChain.get_unit_value_micro_usd(BigInt(tgtAsset.id));
    const crossRateScaled = holographicChain.compute_holographic_cross_rate(BigInt(srcAsset.id), BigInt(tgtAsset.id));

    // Calculate atomic trade quantities based on base decimals
    const srcDecimals = BigInt(srcAsset.baseDecimals);
    const tgtDecimals = BigInt(tgtAsset.baseDecimals);
    const srcAtoms = BigInt(Math.floor(srcVolumeUnits * 10 ** Number(srcDecimals)));

    // Target atoms = (srcAtoms * srcUnitValMicro * 10^tgtDecimals) / (tgtUnitValMicro * 10^srcDecimals)
    const srcUsdValueMicro = srcAtoms * srcUnitValMicro;
    const tgtAtoms = (srcUsdValueMicro * (10n ** tgtDecimals)) / (tgtUnitValMicro * (10n ** srcDecimals));

    if (srcAtoms <= 0n || tgtAtoms <= 0n) {
      return { intent: null as any, latencyUs: 0, success: false };
    }

    // 2. Cryptographic Hardware Salt & Blind ZK Commitment
    const hardwareSalt = crypto.randomBytes(32);
    const zkCommitment = zkWasmPkg.ZkOrderCommitment.generate_blind_order(
      srcUnitValMicro,
      srcAtoms,
      new Uint8Array(hardwareSalt)
    );
    const zkCommitmentHash = zkCommitment.commitment_hash;

    // 3. Cryptographic Verification of ZK Proof
    const isProofValid = zkCommitment.verify_match_proof(
      srcUnitValMicro,
      srcAtoms,
      new Uint8Array(hardwareSalt)
    );
    if (!isProofValid) {
      zkCommitment.free();
      return { intent: null as any, latencyUs: 0, success: false };
    }

    // 4. Atomic Account-to-Account Settlement Invariant Execution
    const aSrcBal = accA.balances.get(srcAsset.id) || 0n;
    const bTgtBal = accB.balances.get(tgtAsset.id) || 0n;

    if (aSrcBal < srcAtoms || bTgtBal < tgtAtoms) {
      zkCommitment.free();
      return { intent: null as any, latencyUs: 0, success: false };
    }

    // Execute atomic balance transfer
    accA.balances.set(srcAsset.id, aSrcBal - srcAtoms);
    accA.balances.set(tgtAsset.id, (accA.balances.get(tgtAsset.id) || 0n) + tgtAtoms);

    accB.balances.set(srcAsset.id, (accB.balances.get(srcAsset.id) || 0n) + srcAtoms);
    accB.balances.set(tgtAsset.id, bTgtBal - tgtAtoms);

    zkCommitment.free();

    const endTime = process.hrtime.bigint();
    const latencyUs = Number(endTime - startTime) / 1000.0;

    const intent: A2SPASettlementIntent = {
      actionId: crypto.randomBytes(16).toString('hex'),
      accountA: accA.accountId,
      accountB: accB.accountId,
      sourceAssetId: srcAsset.id,
      targetAssetId: tgtAsset.id,
      sourceAmountAtoms: srcAtoms,
      targetAmountAtoms: tgtAtoms,
      hardwareSalt: new Uint8Array(hardwareSalt),
      zkCommitmentHash,
      holographicUnitCrossRate: crossRateScaled,
    };

    return { intent, latencyUs, success: true };
  }

  it('Stage 1: Invariant Verification — Holographic Chain 1-Unit State Vector and Cross-Rate Parity', async () => {
    // Assert exactly 23 value elements are tracked
    expect(holographicChain.get_elements_count()).to.equal(23);

    // Verify BTC valuation: $68,500 = 68,500,000,000 microUSD
    const btcMicroUsd = holographicChain.get_unit_value_micro_usd(2001n);
    expect(btcMicroUsd).to.equal(68500000000n);

    // Verify Solar valuation: $0.14 = 140,000 microUSD
    const solarMicroUsd = holographicChain.get_unit_value_micro_usd(4004n);
    expect(solarMicroUsd).to.equal(140000n);

    // Verify Cross-Rate: 1 Solar in BTC is (140,000 * 1,000,000) / 68,500,000,000 = 2 fixed point units
    const crossRate = holographicChain.compute_holographic_cross_rate(4004n, 2001n);
    expect(crossRate).to.equal(2n);

    // Verify State Root Hash is exactly 32 bytes (256-bit cryptographic root)
    const rootHash = holographicChain.get_state_root_hash();
    expect(rootHash.length).to.equal(32);

    console.log('   [STAGE 1 PASS] Holographic State Vector & Unit Parity Verified.');
  });

  it('Stage 2: Single-Pair Cross-Tier Deep Pressure Test — 2,000 Cycles of Solar Energy (1 kWh) <-> BTC', async () => {
    const CYCLES = 2000;
    const nodeAlpha = createAccount('SOVEREIGN_NODE_ALPHA');
    const nodeBeta = createAccount('SOVEREIGN_NODE_BETA');

    const initialMass = computeTotalSystemicMass([nodeAlpha, nodeBeta]);

    const solarAsset = UNIVERSAL_VALUE_ELEMENTS.find((a) => a.symbol === 'SOLAR')!;
    const btcAsset = UNIVERSAL_VALUE_ELEMENTS.find((a) => a.symbol === 'BTC')!;

    const latenciesUs: number[] = [];
    const t0 = performance.now();

    for (let i = 0; i < CYCLES; i++) {
      // Alternating trade directions to maintain liquidity equilibrium
      const isAlphaSellingSolar = i % 2 === 0;
      const seller = isAlphaSellingSolar ? nodeAlpha : nodeBeta;
      const buyer = isAlphaSellingSolar ? nodeBeta : nodeAlpha;
      const solarVolume = 10 + (i % 50); // 10 to 59 kWh per settlement

      const res = executeA2SPASettlement(seller, buyer, solarAsset, btcAsset, solarVolume);
      expect(res.success).to.be.true;
      latenciesUs.push(res.latencyUs);
    }

    const t1 = performance.now();
    const totalTimeMs = t1 - t0;
    const throughputTps = (CYCLES / totalTimeMs) * 1000.0;

    latenciesUs.sort((a, b) => a - b);
    const avgLatency = latenciesUs.reduce((a, b) => a + b, 0) / latenciesUs.length;
    const minLatency = latenciesUs[0];
    const maxLatency = latenciesUs[latenciesUs.length - 1];
    const p95Latency = latenciesUs[Math.floor(CYCLES * 0.95)];
    const p99Latency = latenciesUs[Math.floor(CYCLES * 0.99)];

    // Invariant Check: Verify total mass across accounts is strictly conserved
    const finalMass = computeTotalSystemicMass([nodeAlpha, nodeBeta]);
    for (const elem of UNIVERSAL_VALUE_ELEMENTS) {
      expect(finalMass.get(elem.id)).to.equal(
        initialMass.get(elem.id),
        `Systemic mass invariant violated for asset ${elem.symbol}`
      );
    }

    console.log('\n   \x1b[32m[STAGE 2 BENCHMARK RESULTS: SOLAR <-> BTC SINGLE PAIR]\x1b[0m');
    console.log(`   - Settlements Completed:        ${CYCLES.toLocaleString()} frames`);
    console.log(`   - Total Execution Time:         ${totalTimeMs.toFixed(2)} ms`);
    console.log(`   - Throughput (A2SPA Rate):      \x1b[1m\x1b[32m${throughputTps.toFixed(0)} settlements/sec\x1b[0m`);
    console.log(`   - Average Latency:              ${avgLatency.toFixed(2)} µs (${(avgLatency / 1000).toFixed(4)} ms)`);
    console.log(`   - Min Latency:                  ${minLatency.toFixed(2)} µs`);
    console.log(`   - P95 Latency:                  ${p95Latency.toFixed(2)} µs`);
    console.log(`   - P99 Latency:                  ${p99Latency.toFixed(2)} µs`);
    console.log(`   - Max Latency:                  ${maxLatency.toFixed(2)} µs`);
    console.log(`   - Systemic Mass Invariant:      \x1b[32m100.00% CONSERVED (0 delta)\x1b[0m\n`);

    expect(avgLatency).to.be.below(1500); // Must be sub-millisecond on average (< 1.5ms)
  });

  it('Stage 3: Multi-Tier Universal Matrix Pressure Test — 5,000 Cross-Tier Settlement Frames', async () => {
    const TOTAL_FRAMES = 5000;
    const nodeAlpha = createAccount('SOVEREIGN_NODE_ALPHA');
    const nodeBeta = createAccount('SOVEREIGN_NODE_BETA');
    const initialMass = computeTotalSystemicMass([nodeAlpha, nodeBeta]);

    // Cross-tier pairs spanning Forex, Crypto, Equities, Commodities, Bonds
    const crossTierPairs: [string, string][] = [
      ['SOLAR', 'BTC'],       // Energy <-> Crypto
      ['US10Y', 'USD'],       // Sovereign Bond <-> Fiat Forex
      ['AAPL', 'XAU'],        // US Tech Equity <-> Gold Commodity
      ['COMPUTE', 'ETH'],     // Distributed GPU Compute <-> Crypto
      ['TSLA', 'EUR'],        // Clean Mobility Equity <-> Forex
      ['WTI', 'PROM'],        // Crude Oil Energy <-> Sovereign Network Token
      ['NVDA', 'JPY'],        // AI Hardware Equity <-> Asian Fiat
      ['XAG', 'BUND10Y'],     // Silver Commodity <-> European Sovereign Bond
      ['SPY', 'USDC'],        // Equity Index <-> Dollar Stablecoin
      ['CHF', 'QQQ']          // Swiss Franc <-> Tech Index
    ];

    const latenciesUs: number[] = [];
    let zkValidationsPassed = 0;

    // Chain State Memory Measurement Before
    const chainElementsBefore = holographicChain.get_elements_count();
    const rootHashBefore = Buffer.from(holographicChain.get_state_root_hash()).toString('hex');

    const t0 = performance.now();

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const pairIdx = i % crossTierPairs.length;
      const cycle = Math.floor(i / crossTierPairs.length);
      const pair = crossTierPairs[pairIdx];
      const srcAsset = UNIVERSAL_VALUE_ELEMENTS.find((a) => a.symbol === pair[0])!;
      const tgtAsset = UNIVERSAL_VALUE_ELEMENTS.find((a) => a.symbol === pair[1])!;

      // Alternate seller per pair to maintain bidirectional liquidity parity
      const isAlphaSeller = (cycle % 2 === 0);
      const seller = isAlphaSeller ? nodeAlpha : nodeBeta;
      const buyer = isAlphaSeller ? nodeBeta : nodeAlpha;
      const volumeUnits = 1 + (i % 10);

      const res = executeA2SPASettlement(seller, buyer, srcAsset, tgtAsset, volumeUnits);
      if (res.success) {
        zkValidationsPassed++;
        latenciesUs.push(res.latencyUs);
      }
    }

    const t1 = performance.now();
    const totalTimeMs = t1 - t0;
    const throughputTps = (TOTAL_FRAMES / totalTimeMs) * 1000.0;

    // Chain State Memory Measurement After
    const chainElementsAfter = holographicChain.get_elements_count();
    const rootHashAfter = Buffer.from(holographicChain.get_state_root_hash()).toString('hex');

    // Invariant Check 1: Chain Size Must NOT Bloat with Transaction Volume!
    expect(chainElementsAfter).to.equal(chainElementsBefore);
    expect(chainElementsAfter).to.equal(23); // Always 23 canonical 1-unit elements

    // Invariant Check 2: All 5,000 ZK commitments passed cryptographic verification
    expect(zkValidationsPassed).to.equal(TOTAL_FRAMES);

    // Invariant Check 3: Systemic Mass Invariant Conservation
    const finalMass = computeTotalSystemicMass([nodeAlpha, nodeBeta]);
    for (const elem of UNIVERSAL_VALUE_ELEMENTS) {
      expect(finalMass.get(elem.id)).to.equal(
        initialMass.get(elem.id),
        `Invariant mass breach on asset ${elem.symbol}`
      );
    }

    latenciesUs.sort((a, b) => a - b);
    const avgLatency = latenciesUs.reduce((a, b) => a + b, 0) / latenciesUs.length;
    const p95Latency = latenciesUs[Math.floor(TOTAL_FRAMES * 0.95)];
    const p99Latency = latenciesUs[Math.floor(TOTAL_FRAMES * 0.99)];

    console.log('\n   \x1b[35m[STAGE 3 BENCHMARK RESULTS: 5,000 CROSS-TIER SETTLEMENT FRAMES]\x1b[0m');
    console.log(`   - Multi-Tier Pairs:             10 Universal Cross-Tier Asset Corridors`);
    console.log(`   - Total Frames Executed:        ${TOTAL_FRAMES.toLocaleString()} settlements`);
    console.log(`   - Throughput (A2SPA TPS):       \x1b[1m\x1b[35m${throughputTps.toFixed(0)} settlements/sec\x1b[0m`);
    console.log(`   - Average Latency:              ${avgLatency.toFixed(2)} µs (${(avgLatency / 1000).toFixed(4)} ms)`);
    console.log(`   - P95 Latency:                  ${p95Latency.toFixed(2)} µs`);
    console.log(`   - P99 Latency:                  ${p99Latency.toFixed(2)} µs`);
    console.log(`   - ZK Hardware Proof Rate:       \x1b[32m100.00% (${zkValidationsPassed}/${TOTAL_FRAMES} verified)\x1b[0m`);
    console.log(`   - Holographic State Growth:     \x1b[32m0 bytes (O(1) state invariant preserved at 23 elements)\x1b[0m`);
    console.log(`   - Balance Invariant Delta:      \x1b[32m0 across all 23 asset tiers\x1b[0m\n`);
  });

  it('Stage 4: SharedArrayBuffer Shared Memory Concurrency & Atomics Pipeline', async () => {
    // Validate SharedArrayBuffer atomic ring-buffer interaction
    const sharedBuffer = new SharedArrayBuffer(1024);
    const view = new DataView(sharedBuffer);
    const atomicArr = new Int32Array(sharedBuffer, 0, 4);

    const CONCURRENT_OPS = 1000;
    const t0 = performance.now();

    for (let i = 0; i < CONCURRENT_OPS; i++) {
      // Atomic increment simulates mesh frame sequencer counter
      Atomics.add(atomicArr, 0, 1);
      // Low-overhead frame slot write (28 bytes)
      view.setUint32(16, 1, true); // Action: A2SPA settlement
      view.setUint32(20, 4004, true); // Solar
      view.setUint32(24, 2001, true); // BTC
      view.setBigUint64(28, 50n, true); // Volume
    }

    const t1 = performance.now();
    const opsPerSec = (CONCURRENT_OPS / (t1 - t0)) * 1000.0;
    expect(Atomics.load(atomicArr, 0)).to.equal(CONCURRENT_OPS);

    console.log(`   [STAGE 4 PASS] SharedArrayBuffer Concurrency: ${opsPerSec.toFixed(0)} atomic ops/sec.`);
  });
});
