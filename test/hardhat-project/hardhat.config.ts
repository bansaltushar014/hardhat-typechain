import { HardhatUserConfig } from "hardhat/types";

// We load the plugin here.
import "../../src/index";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.6.8",
  },
  paths: {
    artifacts: "artifacts-dir",
  },
  typechain: {
    outDir: "../../testdir",
    target: "ethers-v5",
    onTest: true,
    onCompile: true,
  },
};

export default config;
