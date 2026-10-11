export declare class TPNSMeshBootstrapProfile {
    node: any;
    private messageCallback;
    constructor(onMessageReceived: (data: Uint8Array) => void);
    assembleNetworkMesh(): Promise<void>;
    broadcastIntent(payload: Uint8Array): Promise<void>;
}
