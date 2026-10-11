require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const DEPLOYER_PRIVATE_KEY = process.env.TPNS_DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 999999 },
      viaIR: true
    }
  },
  networks: {
    optimism: { url: process.env.OPTIMISM_RPC_ENDPOINT || "https://optimism.io", accounts: [DEPLOYER_PRIVATE_KEY], chainId: 10 },
    gnosis: { url: process.env.GNOSIS_RPC_ENDPOINT || "https://gnosischain.com", accounts: [DEPLOYER_PRIVATE_KEY], chainId: 100 },
    localhost: { url: "http://127.0.0.1:8545", chainId: 31337 }
  }
};
