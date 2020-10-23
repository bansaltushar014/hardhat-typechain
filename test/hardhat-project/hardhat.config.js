// We load the plugin here.
require(__dirname + "/../../src/index");

module.exports = {
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
