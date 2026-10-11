export declare class AsgiLiquidityRouter {
    private balancer;
    private sharedBuffer;
    constructor(sharedBuffer: SharedArrayBuffer);
    activateBalancerLoop(initialSolar: number, initialCompute: number): Promise<void>;
    /**
     * Evaluates delta parameters and crafts an entry payload directly inside the Shared Memory heap
     */
    evaluateAndInjectRebalance(telemetrySolarDelta: number): boolean;
}
