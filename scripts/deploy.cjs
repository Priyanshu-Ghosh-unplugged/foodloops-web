const hre = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
  if (!process.env.SEPOLIA_RPC_URL) {
    throw new Error("SEPOLIA_RPC_URL not found in .env file");
  }
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in .env file");
  }

  console.log("Deploying contract...");

  const rewardsContract = await hre.ethers.deployContract("Rewards");

  await rewardsContract.waitForDeployment();

  console.log(
    `Rewards contract deployed to ${rewardsContract.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 