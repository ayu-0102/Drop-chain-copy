
const hre = require("hardhat");

async function main() {
  console.log("Deploying DeliveryPlatform contract...");

  // Deploy a mock ERC20 token first (for token payments)
  const MockToken = await hre.ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy("DeliveryToken", "DELV", 18, "1000000000000000000000000"); // 1M tokens
  await mockToken.deployed();
  console.log("MockToken deployed to:", mockToken.address);

  // Deploy the main contract
  const DeliveryPlatform = await hre.ethers.getContractFactory("DeliveryPlatform");
  const deliveryPlatform = await DeliveryPlatform.deploy(mockToken.address);
  await deliveryPlatform.deployed();

  console.log("DeliveryPlatform deployed to:", deliveryPlatform.address);
  console.log("Update CONTRACT_ADDRESS in src/utils/web3.ts to:", deliveryPlatform.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
