#!/usr/bin/env bash
set -euo pipefail

export SDKROOT="/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk"
export PATH="/opt/homebrew/bin:$HOME/.cargo/bin:$PATH"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}[TPNS BUILD] Starting Cleanroom Core Target Compilation...${NC}"
mkdir -p dist/pkg dist/pkg/zk dist/pkg/asgi dist/pkg/cartographer

cd tpns_matching_engine && wasm-pack build --target web --out-dir ../dist/pkg && cd ..
cd tpns_zk_privacy && wasm-pack build --target web --out-dir ../dist/pkg/zk && cd ..
cd tpns_asgi_liquidity && wasm-pack build --target web --out-dir ../dist/pkg/asgi && cd ..
cd tpns_cartographer && wasm-pack build --target web --out-dir ../dist/pkg/cartographer && cd ..

cp tpns-mesh-network/*.ts dist/
sed -i '' 's|/pkg/|./pkg/|g' dist/index.html 2>/dev/null || sed -i 's|/pkg/|./pkg/|g' dist/index.html

echo -e "${CYAN}[IPFS COMMITTING] Pinning artifacts directly to the localized swarm file system...${NC}"
IPFS_OUT=$(ipfs add --offline -r -Q ./dist 2>/dev/null || ipfs add -r -Q ./dist)

echo -e "\n${GREEN}✓ STANDALONE ENGINE LINK PATH UNIFIED ON HOLOGRAPHIC LEDGER MATRIX${NC}"
echo -e "${GREEN}IPFS RUNTIME CID TARGET HASH : ${IPFS_OUT}${NC}"
