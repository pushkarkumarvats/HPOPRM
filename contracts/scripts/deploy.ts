import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ForwardContractRegistry...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const ForwardContractRegistry = await ethers.getContractFactory("ForwardContractRegistry");
  const contract = await ForwardContractRegistry.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("ForwardContractRegistry deployed to:", address);
  console.log("\nSave this address to your .env file:");
  console.log(`FORWARD_CONTRACT_REGISTRY_ADDRESS=${address}`);

  // Wait for block confirmations
  console.log("\nWaiting for block confirmations...");
  await contract.deploymentTransaction()?.wait(5);
  
  console.log("\nDeployment complete!");
  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
