use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct CartographerRwaEngine {
    asset_id: u64,
}

#[wasm_bindgen]
impl CartographerRwaEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(asset_id: u64) -> CartographerRwaEngine {
        CartographerRwaEngine { asset_id }
    }

    #[wasm_bindgen]
    pub fn get_asset_id(&self) -> u64 {
        self.asset_id
    }
}
