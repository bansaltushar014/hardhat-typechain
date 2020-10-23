export interface TypechainConfig {
  outDir?: string;
  target?: "truffle-v5" | "web3-v1" | "ethers-v5";
  onCompile?: boolean;
  onTest?: boolean;
}
