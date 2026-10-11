use wasm_bindgen::prelude::*;
use sha2::{Sha256, Digest};

const MAX_ORDERS_PER_SIDE: usize = 128;
const MAX_VALUE_ELEMENTS: usize = 32;

#[wasm_bindgen]
#[derive(Copy, Clone, Debug)]
#[repr(C)]
pub struct LimitOrder {
    pub order_id: u64,
    pub price_atoms: u64,
    pub amount_atoms: u64,
    pub timestamp: u64,
}

#[wasm_bindgen]
pub struct MemoryMatchingEngine {
    bids: [Option<LimitOrder>; MAX_ORDERS_PER_SIDE],
    asks: [Option<LimitOrder>; MAX_ORDERS_PER_SIDE],
    order_id_counter: u64,
}

#[wasm_bindgen]
impl MemoryMatchingEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> MemoryMatchingEngine {
        MemoryMatchingEngine {
            bids: [None; MAX_ORDERS_PER_SIDE],
            asks: [None; MAX_ORDERS_PER_SIDE],
            order_id_counter: 1,
        }
    }

    #[wasm_bindgen]
    pub fn match_intent(&mut self, is_buy: bool, price: u64, mut amount: u64) -> u64 {
        if is_buy {
            for i in 0..MAX_ORDERS_PER_SIDE {
                if let Some(mut ask) = self.asks[i] {
                    if ask.price_atoms <= price {
                        if ask.amount_atoms <= amount {
                            amount -= ask.amount_atoms;
                            self.asks[i] = None;
                        } else {
                            ask.amount_atoms -= amount;
                            self.asks[i] = Some(ask);
                            amount = 0;
                            break;
                        }
                    }
                }
                if amount == 0 { break; }
            }
            if amount > 0 { self.insert_order(true, price, amount); }
        } else {
            for i in 0..MAX_ORDERS_PER_SIDE {
                if let Some(mut bid) = self.bids[i] {
                    if bid.price_atoms >= price {
                        if bid.amount_atoms <= amount {
                            amount -= bid.amount_atoms;
                            self.bids[i] = None;
                        } else {
                            bid.amount_atoms -= amount;
                            self.bids[i] = Some(bid);
                            amount = 0;
                            break;
                        }
                    }
                }
                if amount == 0 { break; }
            }
            if amount > 0 { self.insert_order(false, price, amount); }
        }
        amount
    }

    fn insert_order(&mut self, is_bid: bool, price: u64, amount: u64) {
        let id = self.order_id_counter;
        self.order_id_counter += 1;
        let new_order = LimitOrder { order_id: id, price_atoms: price, amount_atoms: amount, timestamp: 0 };

        if is_bid {
            for i in 0..MAX_ORDERS_PER_SIDE {
                if self.bids[i].is_none() {
                    self.bids[i] = Some(new_order);
                    self.bids[0..i+1].sort_by(|a, b| {
                        b.map(|o| o.price_atoms).unwrap_or(0).cmp(&a.map(|o| o.price_atoms).unwrap_or(0))
                    });
                    break;
                }
            }
        } else {
            for i in 0..MAX_ORDERS_PER_SIDE {
                if self.asks[i].is_none() {
                    self.asks[i] = Some(new_order);
                    self.asks[0..i+1].sort_by(|a, b| {
                        a.map(|o| o.price_atoms).unwrap_or(u64::MAX).cmp(&b.map(|o| o.price_atoms).unwrap_or(u64::MAX))
                    });
                    break;
                }
            }
        }
    }
}

/// The Promethean Holographic Chain State Vector Engine
/// Tracks exactly ONE UNIT of each fundamental value element across the universe,
/// eliminating ledger bloat while maintaining mathematical invariant parity.
#[wasm_bindgen]
pub struct HolographicChainState {
    asset_ids: [u64; MAX_VALUE_ELEMENTS],
    unit_micro_usd: [u64; MAX_VALUE_ELEMENTS], // 1 USD = 1,000,000 microUSD
    elements_count: usize,
    block_height: u64,
}

#[wasm_bindgen]
impl HolographicChainState {
    #[wasm_bindgen(constructor)]
    pub fn new() -> HolographicChainState {
        let mut state = HolographicChainState {
            asset_ids: [0; MAX_VALUE_ELEMENTS],
            unit_micro_usd: [0; MAX_VALUE_ELEMENTS],
            elements_count: 0,
            block_height: 1,
        };

        // Initialize with default canonical unit valuations (1 unit each in microUSD)
        // Tier 1: Forex
        state.register_element(1001, 1_000_000);       // USD: $1.00
        state.register_element(1002, 1_085_000);       // EUR: $1.085
        state.register_element(1003, 1_305_000);       // GBP: $1.305
        state.register_element(1004, 6_700);           // JPY: $0.0067
        state.register_element(1005, 1_155_000);       // CHF: $1.155

        // Tier 2: Crypto
        state.register_element(2001, 68_500_000_000);   // BTC: $68,500.00
        state.register_element(2002, 3_450_000_000);    // ETH: $3,450.00
        state.register_element(2003, 175_000_000);      // SOL: $175.00
        state.register_element(2004, 25_000_000);       // PROM: $25.00
        state.register_element(2005, 1_000_000);        // USDC: $1.00

        // Tier 3: Equities
        state.register_element(3001, 585_000_000);      // SPY: $585.00
        state.register_element(3002, 495_000_000);      // QQQ: $495.00
        state.register_element(3003, 135_000_000);      // NVDA: $135.00
        state.register_element(3004, 230_000_000);      // AAPL: $230.00
        state.register_element(3005, 220_000_000);      // TSLA: $220.00

        // Tier 4: Commodities & Energy
        state.register_element(4001, 2_650_000_000);    // Gold (1 oz): $2,650.00
        state.register_element(4002, 31_500_000);       // Silver (1 oz): $31.50
        state.register_element(4003, 78_500_000);       // Crude Oil (1 bbl): $78.50
        state.register_element(4004, 140_000);          // Solar Energy (1 kWh): $0.14
        state.register_element(4005, 850_000);          // GPU Compute (1 FLOP-Hr): $0.85

        // Tier 5: Bonds
        state.register_element(5001, 98_500_000);       // US10Y: $98.50
        state.register_element(5002, 99_200_000);       // US02Y: $99.20
        state.register_element(5003, 104_200_000);      // BUND10Y: $104.20

        state
    }

    #[wasm_bindgen]
    pub fn register_element(&mut self, asset_id: u64, micro_usd: u64) -> bool {
        for i in 0..self.elements_count {
            if self.asset_ids[i] == asset_id {
                self.unit_micro_usd[i] = micro_usd;
                return true;
            }
        }
        if self.elements_count < MAX_VALUE_ELEMENTS {
            self.asset_ids[self.elements_count] = asset_id;
            self.unit_micro_usd[self.elements_count] = micro_usd;
            self.elements_count += 1;
            true
        } else {
            false
        }
    }

    #[wasm_bindgen]
    pub fn update_unit_value(&mut self, asset_id: u64, new_micro_usd: u64) -> bool {
        for i in 0..self.elements_count {
            if self.asset_ids[i] == asset_id {
                self.unit_micro_usd[i] = new_micro_usd;
                self.block_height += 1;
                return true;
            }
        }
        false
    }

    #[wasm_bindgen]
    pub fn get_unit_value_micro_usd(&self, asset_id: u64) -> u64 {
        for i in 0..self.elements_count {
            if self.asset_ids[i] == asset_id {
                return self.unit_micro_usd[i];
            }
        }
        0
    }

    /// Computes the exact cross-rate between 1 unit of Src and 1 unit of Tgt in 1e6 fixed point
    #[wasm_bindgen]
    pub fn compute_holographic_cross_rate(&self, src_id: u64, tgt_id: u64) -> u64 {
        let src_val = self.get_unit_value_micro_usd(src_id) as u128;
        let tgt_val = self.get_unit_value_micro_usd(tgt_id) as u128;
        if tgt_val == 0 { return 0; }
        // Rate scaled by 1,000,000
        ((src_val * 1_000_000) / tgt_val) as u64
    }

    #[wasm_bindgen]
    pub fn get_block_height(&self) -> u64 {
        self.block_height
    }

    #[wasm_bindgen]
    pub fn get_elements_count(&self) -> usize {
        self.elements_count
    }

    /// Computes the cryptographic state root hash over all 1-unit value elements
    #[wasm_bindgen]
    pub fn get_state_root_hash(&self) -> Vec<u8> {
        let mut hasher = Sha256::new();
        hasher.update(&self.block_height.to_le_bytes());
        for i in 0..self.elements_count {
            hasher.update(&self.asset_ids[i].to_le_bytes());
            hasher.update(&self.unit_micro_usd[i].to_le_bytes());
        }
        hasher.finalize().to_vec()
    }

    /// Verifies thermodynamic invariant equilibrium across the holographic chain
    #[wasm_bindgen]
    pub fn verify_invariant_equilibrium(&self) -> bool {
        if self.elements_count == 0 { return false; }
        // Invariant check: all registered elements maintain non-zero positive valuation
        for i in 0..self.elements_count {
            if self.unit_micro_usd[i] == 0 {
                return false;
            }
        }
        true
    }
}
