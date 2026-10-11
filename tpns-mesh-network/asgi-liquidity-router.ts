import init, { PrometheaAsgiBalancer } from '../dist/pkg/asgi/tpns_asgi_liquidity.js';

export class AsgiLiquidityRouter {
  private balancer: any;
  private sharedBuffer: SharedArrayBuffer;

  constructor(sharedBuffer: SharedArrayBuffer) {
    this.sharedBuffer = sharedBuffer;
  }

  async activateBalancerLoop(initialSolar: number, initialCompute: number) {
    await init();
    this.balancer = new PrometheaAsgiBalancer(BigInt(initialSolar), BigInt(initialCompute));
  }

  /**
   * Evaluates delta parameters and crafts an entry payload directly inside the Shared Memory heap
   */
  public evaluateAndInjectRebalance(telemetrySolarDelta: number): boolean {
    const rawOutCompute = this.balancer.compute_autonomous_swap(BigInt(telemetrySolarDelta));
    
    if (rawOutCompute === 0n) return false;

    const view = new DataView(this.sharedBuffer);
    
    // Low-overhead byte packing into the primary 28-byte transaction frame slot
    view.setUint32(0, 1, true); // Action Code: 1 = Automated Limit Sell Frame
    view.setUint32(4, 1001, true); // Solar Resource Identifier
    view.setUint32(8, 3003, true); // Compute Resource Identifier
    view.setBigUint64(12, BigInt(telemetrySolarDelta), true); // Volume Allocation
    view.setBigUint64(20, BigInt(rawOutCompute), true); // Calculated Swap Rate Target

    return true;
  }
}
