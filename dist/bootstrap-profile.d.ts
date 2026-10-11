export declare class TPNSMeshBootstrapProfile {
    node: any;
    private messageCallback;
    private channel;
    constructor(onMessageReceived: (data: Uint8Array) => void);
    assembleNetworkMesh(): Promise<void>;
    broadcastIntent(payload: Uint8Array): Promise<void>;
}
