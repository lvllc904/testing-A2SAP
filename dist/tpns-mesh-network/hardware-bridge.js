export class HolographicHardwareBridge {
    async signActionPayload(challengeBuffer, keyIdBase64Url) {
        const challenge = challengeBuffer.buffer.slice(challengeBuffer.byteOffset, challengeBuffer.byteOffset + challengeBuffer.byteLength);
        const credentialId = this.base64UrlToBytes(keyIdBase64Url);
        const publicKeyCredentialRequestOptions = {
            challenge: challenge,
            timeout: 60000,
            userVerification: "required",
            allowCredentials: [{ id: credentialId, type: 'public-key' }]
        };
        const assertion = (await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions }));
        if (!assertion || !assertion.response)
            throw new Error("TPNS Hardware Failure: Operation aborted.");
        const response = assertion.response;
        const rawDerSignature = new Uint8Array(response.signature);
        const { r, s } = this.parseDerToRawComponents(rawDerSignature);
        return {
            rawBytes: rawDerSignature, r, s,
            authenticatorData: new Uint8Array(response.authenticatorData),
            clientDataJSON: new TextDecoder().decode(response.clientDataJSON)
        };
    }
    parseDerToRawComponents(der) {
        let offset = 0;
        if (der[offset++] !== 0x30)
            throw new Error("Malformed DER signature.");
        offset++;
        if (der[offset++] !== 0x02)
            throw new Error("Invalid R component.");
        let rLen = der[offset++];
        let rStart = offset;
        if (der[rStart] === 0x00) {
            rStart++;
            rLen--;
        }
        const r = der.slice(rStart, rStart + rLen);
        offset += der[offset - 1];
        if (der[offset++] !== 0x02)
            throw new Error("Invalid S component.");
        let sLen = der[offset++];
        let sStart = offset;
        if (der[sStart] === 0x00) {
            sStart++;
            sLen--;
        }
        const s = der.slice(sStart, sStart + sLen);
        const pad = (arr) => arr.length === 32 ? arr : new Uint8Array([...new Array(32 - arr.length).fill(0), ...arr]);
        return { r: pad(r), s: pad(s) };
    }
    base64UrlToBytes(base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++)
            bytes[i] = binary.charCodeAt(i);
        return bytes;
    }
}
