const hre = require("hardhat");

async function main() {
  console.log("Deploying contract to local network...");

  const rewardsContract = await hre.ethers.deployContract("Rewards");

  await rewardsContract.waitForDeployment();

  console.log(
    `Rewards contract deployed to local network at address: ${rewardsContract.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 