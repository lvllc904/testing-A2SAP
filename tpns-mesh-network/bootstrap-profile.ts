export class TPNSMeshBootstrapProfile {
  public node: any;
  private messageCallback: (data: Uint8Array) => void;
  private channel: any;

  constructor(onMessageReceived: (data: Uint8Array) => void) {
    this.messageCallback = onMessageReceived;
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('tpns/holographic-intents/v1');
      this.channel.onmessage = (evt: any) => {
        if (evt.data) {
          const raw = evt.data instanceof Uint8Array ? evt.data : new Uint8Array(evt.data);
          this.messageCallback(raw);
        }
      };
    }
  }

  async assembleNetworkMesh() {
    try {
      if (typeof window === 'undefined') {
        const { createLibp2p } = await import('libp2p');
        const { webSockets } = await import('@libp2p/websockets');
        const { webRTC } = await import('@libp2p/webrtc');
        const { circuitRelayTransport } = await import('@libp2p/circuit-relay-v2');
        const { gossipsub } = await import('@chainsafe/libp2p-gossipsub');
        const { noise } = await import('@chainsafe/libp2p-noise');
        const { yamux } = await import('@chainsafe/libp2p-yamux');
        const { identify } = await import('@libp2p/identify');

        this.node = await createLibp2p({
          transports: [webSockets(), webRTC(), circuitRelayTransport()],
          connectionEncryption: [noise()],
          streamMuxers: [yamux()],
          connectionGater: { denyDialMultiaddr: async () => false },
          services: {
            identify: identify(),
            pubsub: gossipsub({ allowPublishToZeroTopicPeers: true, heartbeatInterval: 150 }),
          }
        });
        await this.node.start();
        const topic = 'tpns/holographic-intents/v1';
        this.node.services.pubsub.subscribe(topic);
        this.node.services.pubsub.addEventListener('message', (evt: any) => {
          if (evt.detail.topic === topic) this.messageCallback(evt.detail.data);
        });
      }
    } catch (e) {
      // In standalone browser, mesh routes intents via high-speed BroadcastChannel
    }
  }

  async broadcastIntent(payload: Uint8Array) {
    if (this.channel) {
      this.channel.postMessage(payload);
    }
    if (this.node?.services?.pubsub) {
      try {
        await this.node.services.pubsub.publish('tpns/holographic-intents/v1', payload);
      } catch (e) {}
    }
  }
}
