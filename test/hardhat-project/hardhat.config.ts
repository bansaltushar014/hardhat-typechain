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
};

export default config;
