use wasm_bindgen::prelude::*;
use sha2::{Sha256, Digest};

#[wasm_bindgen]
pub struct ZkOrderCommitment {
    commitment_hash_bytes: [u8; 32],
    encrypted_payload: Vec<u8>,
}

#[wasm_bindgen]
impl ZkOrderCommitment {
    #[wasm_bindgen(getter)]
    pub fn commitment_hash(&self) -> Vec<u8> {
        self.commitment_hash_bytes.to_vec()
    }

    #[wasm_bindgen]
    pub fn generate_blind_order(price: u64, amount: u64, hardware_salt: &[u8]) -> ZkOrderCommitment {
        let mut hasher = Sha256::new();
        hasher.update(&price.to_le_bytes());
        hasher.update(&amount.to_le_bytes());
        hasher.update(hardware_salt);
        
        let result = hasher.finalize();
        let mut commitment_hash_bytes = [0u8; 32];
        commitment_hash_bytes.copy_from_slice(&result);

        ZkOrderCommitment {
            commitment_hash_bytes,
            encrypted_payload: vec![0u8; 64],
        }
    }

    #[wasm_bindgen]
    pub fn verify_match_proof(&self, price: u64, amount: u64, hardware_salt: &[u8]) -> bool {
        let mut hasher = Sha256::new();
        hasher.update(&price.to_le_bytes());
        hasher.update(&amount.to_le_bytes());
        hasher.update(hardware_salt);
        
        let check_hash = hasher.finalize();
        check_hash.as_slice() == self.commitment_hash_bytes.as_slice()
    }
}
