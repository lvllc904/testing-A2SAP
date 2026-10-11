FROM rust:1.76-slim-bookworm AS builder
RUN apt-get update && apt-get install -y curl pkg-config libssl-dev git && rm -rf /var/lib/apt/lists/*
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
WORKDIR /usr/src/tpns-exchange
COPY . .
RUN mkdir -p dist/pkg dist/pkg/zk dist/pkg/asgi dist/pkg/cartographer && \
    cd tpns_matching_engine && wasm-pack build --target web --out-dir ../dist/pkg && cd .. && \
    cd tpns_zk_privacy && wasm-pack build --target web --out-dir ../dist/pkg/zk && cd .. && \
    cd tpns_asgi_liquidity && wasm-pack build --target web --out-dir ../dist/pkg/asgi && cd .. && \
    cd tpns_cartographer && wasm-pack build --target web --out-dir ../dist/pkg/cartographer && cd ..

FROM alpine:3.19
RUN apk add --no-cache bash
WORKDIR /app
COPY --from=builder /usr/src/tpns-exchange/dist /app/dist
CMD ["printf", "TPNS standalone static matrix built successfully.\n"]
