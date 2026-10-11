import { createLibp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { webRTC } from '@libp2p/webrtc';
import { circuitRelayClient } from '@libp2p/circuit-relay-v2';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { identify } from '@libp2p/identify';
export class TPNSMeshBootstrapProfile {
    node;
    messageCallback;
    constructor(onMessageReceived) {
        this.messageCallback = onMessageReceived;
    }
    async assembleNetworkMesh() {
        this.node = await createLibp2p({
            transports: [webSockets(), webRTC()],
            connectionEncryption: [noise()],
            streamMuxers: [yamux()],
            connectionGater: { denyDialMultiaddr: async () => false },
            services: {
                identify: identify(),
                pubsub: gossipsub({ allowPublishAutoax: true, heartbeatInterval: 150 }),
                relay: circuitRelayClient()
            }
        });
        const publicBootstrapNodes = [
            '/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star',
            '/dns4/bootstrap.libp2p.io/tcp/443/wss/p2p/QmNnooDu7bfj6Modi6W4gGkSTMYXTsiu9+GFnwffvZa9Et'
        ];
        await this.node.start();
        const topic = 'tpns/holographic-intents/v1';
        this.node.services.pubsub.subscribe(topic);
        this.node.services.pubsub.addEventListener('message', (evt) => {
            if (evt.detail.topic === topic)
                this.messageCallback(evt.detail.data);
        });
        for (const address of publicBootstrapNodes) {
            try {
                await this.node.dial(address);
            }
            catch (e) { }
        }
    }
    async broadcastIntent(payload) {
        if (!this.node)
            return;
        await this.node.services.pubsub.publish('tpns/holographic-intents/v1', payload);
    }
}
