import { ethers } from "hardhat";
import { WAKULIMA_NFT_ADDRESS } from "../constants";

async function main() {
  const WakulimaToken = await ethers.getContractFactory("WakulimaToken");
  const wakulimaToken = await WakulimaToken.deploy(WAKULIMA_NFT_ADDRESS);

  await wakulimaToken.deployed();

  console.log("Wakulima deployed to:", wakulimaToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
