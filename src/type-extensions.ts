import "hardhat/types/config";

import { TypechainConfig } from "./types";

declare module "hardhat/types/config" {
  interface HardhatConfig {
    typechain?: TypechainConfig;
  }
}
