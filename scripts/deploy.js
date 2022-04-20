// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require('fs');
const { DH_UNABLE_TO_CHECK_GENERATOR } = require("constants");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Versus = await hre.ethers.getContractFactory("Versus");
  const versus = await Versus.deploy();

  await versus.deployed();

  console.log("Versus deployed to:", versus.address);

  const data = {
    address: versus.address,
    abi: JSON.parse(versus.interface.format('json'))
  };
  fs.writeFileSync('src/abis/Versus.json', JSON.stringify(data));

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
