/**
 * WorldSnap Game Smart Contract Deployment Script
 * Deploy to Celo Mainnet or Alfajores Testnet
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("🌍 Deploying WorldSnap Game Smart Contract...");

  // Celo cUSD Token Addresses
  const cUSD_MAINNET = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
  const cUSD_ALFAJORES = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  // Choose network (change to cUSD_MAINNET for production)
  const cUSDAddress = cUSD_ALFAJORES;
  const network = "Alfajores Testnet";

  console.log(`📡 Network: ${network}`);
  console.log(`💵 cUSD Token: ${cUSDAddress}`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deploying from: ${deployer.address}`);
  
  const balance = await deployer.getBalance();
  console.log(`💰 Account balance: ${ethers.utils.formatEther(balance)} CELO`);

  // Deploy contract
  const WorldSnapGame = await ethers.getContractFactory("WorldSnapGame");
  const worldSnapGame = await WorldSnapGame.deploy(cUSDAddress);

  await worldSnapGame.deployed();

  console.log("✅ WorldSnap Game deployed to:", worldSnapGame.address);
  console.log("\n📝 Contract Details:");
  console.log("- Contract Address:", worldSnapGame.address);
  console.log("- Owner:", deployer.address);
  console.log("- cUSD Token:", cUSDAddress);
  
  console.log("\n🔧 Next Steps:");
  console.log("1. Verify contract on CeloScan:");
  console.log(`   npx hardhat verify --network ${network.toLowerCase().replace(' ', '-')} ${worldSnapGame.address} ${cUSDAddress}`);
  console.log("\n2. Fund the contract with cUSD tokens");
  console.log("\n3. Update frontend with contract address");
  
  console.log("\n💡 Save this information:");
  console.log("Contract Address:", worldSnapGame.address);
  console.log("Network:", network);
  console.log("Deployment Block:", await ethers.provider.getBlockNumber());
  console.log("Deployment Date:", new Date().toISOString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
