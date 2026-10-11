const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  const SettlementMatrixFactory = await ethers.getContractFactory("TPNSTransactionSettlementMatrix");
  const feeData = await ethers.provider.getFeeData();
  const maxFeePerGas = feeData.maxFeePerGas ? (feeData.maxFeePerGas * 150n) / 100n : undefined;

  const settlementMatrix = await SettlementMatrixFactory.deploy({ maxFeePerGas });
  await settlementMatrix.waitForDeployment();
  console.log(`CONTRACT DEPLOYED AT: ${await settlementMatrix.getAddress()}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
