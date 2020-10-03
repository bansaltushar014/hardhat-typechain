import { ResolvedBuidlerConfig } from "@nomiclabs/buidler/types";

import { TypechainConfig } from "./types";

export function getDefaultTypechainConfig(
  config: ResolvedBuidlerConfig
): TypechainConfig {
  const defaultConfig: TypechainConfig = {
    outDir: "typechain",
    target: "ethers-v5",
    onTest: true,
    onCompile: false
  };

  return { ...defaultConfig, ...config.typechain };
}
