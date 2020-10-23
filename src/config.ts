import { HardhatConfig } from "hardhat/types/config";

import { TypechainConfig } from "./types";

import "./type-extensions";

export function getDefaultTypechainConfig(
  config: HardhatConfig 
): TypechainConfig {
  const defaultConfig: TypechainConfig = {
    outDir: "typechain",
    target: "ethers-v5",
    onTest: true,
    onCompile: false,
  };

  return { ...defaultConfig, ...config.typechain };
}
