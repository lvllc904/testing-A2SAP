export interface HolographicSignaturePayload {
    rawBytes: Uint8Array;
    r: Uint8Array;
    s: Uint8Array;
    authenticatorData: Uint8Array;
    clientDataJSON: string;
}
export declare class HolographicHardwareBridge {
    signActionPayload(challengeBuffer: Uint8Array, keyIdBase64Url: string): Promise<HolographicSignaturePayload>;
    private parseDerToRawComponents;
    private base64UrlToBytes;
}
