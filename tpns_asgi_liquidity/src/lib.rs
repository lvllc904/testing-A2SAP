use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct PrometheaAsgiBalancer {
    solar_pool_atoms: u64,
    compute_pool_atoms: u64,
    invariant_k: u128,
}

#[wasm_bindgen]
impl PrometheaAsgiBalancer {
    #[wasm_bindgen(constructor)]
    pub fn new(solar_init: u64, compute_init: u64) -> PrometheaAsgiBalancer {
        let k = (solar_init as u128) * (compute_init as u128);
        PrometheaAsgiBalancer {
            solar_pool_atoms: solar_init,
            compute_pool_atoms: compute_init,
            invariant_k: k,
        }
    }

    /// Calculates JIT liquidity routing paths using an on-chain AMM invariant equation
    #[wasm_bindgen]
    pub fn compute_autonomous_swap(&mut self, incoming_solar_atoms: u64) -> u64 {
        if incoming_solar_atoms == 0 { return 0; }

        let new_solar_pool = (self.solar_pool_atoms as u128) + (incoming_solar_atoms as u128);
        let new_compute_pool = self.invariant_k / new_solar_pool;
        
        let out_compute_atoms = (self.compute_pool_atoms as u128) - new_compute_pool;
        
        // Commit balanced state alterations inside local memory allocation registers
        self.solar_pool_atoms = new_solar_pool as u64;
        self.compute_pool_atoms = new_compute_pool as u64;

        out_compute_atoms as u64
    }

    #[wasm_bindgen]
    pub fn get_pool_balances(&self) -> Vec<u64> {
        vec![self.solar_pool_atoms, self.compute_pool_atoms]
    }
}
