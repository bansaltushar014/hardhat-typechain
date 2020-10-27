import fsExtra from "fs-extra";
import {
  TASK_CLEAN,
  TASK_COMPILE,
  TASK_COMPILE_SOLIDITY_GET_SOURCE_NAMES,
  TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS,
  TASK_COMPILE_SOLIDITY_LOG_COMPILATION_RESULT,
  TASK_TEST,
} from "hardhat/builtin-tasks/task-names";
import { extendConfig, subtask, task, types } from "hardhat/config";
import { HardhatPluginError } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import { tsGenerator } from "ts-generator";
import { TypeChain } from "typechain/dist/TypeChain";

// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions";
import { TypechainConfig } from "./types";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    // We apply our default config here. Any other kind of config resolution
    // or normalization should be placed here.
    //
    // `config` is the resolved config, which will be used during runtime and
    // you should modify.
    // `userConfig` is the config as provided by the user. You should not modify
    // it.
    //
    // If you extended the `HardhatConfig` type, you need to make sure that
    // executing this function ensures that the `config` object is in a valid
    // state for its type, including its extentions. For example, you may
    // need to apply a default value, like in this example.

    const defaultConfig: TypechainConfig = {
      outDir: "typechain",
      target: "ethers-v5",
      runOnCompile: true,
    };

    config.typechain = { ...defaultConfig, ...userConfig.typechain };
  }
);

const TASK_TYPECHAIN = "typechain";

task(
  TASK_TYPECHAIN,
  "Generate Typechain typings for compiled contracts"
).setAction(async (args, { config, run }) => {
  const typechainTargets = ["truffle-v5", "web3-v1", "ethers-v5"];
  if (!typechainTargets.includes(config.typechain.target)) {
    throw new HardhatPluginError(
      "Invalid Typechain target, please provide via hardhat.config.js (typechain.target)"
    );
  }

  const cwd = process.cwd();
  await tsGenerator(
    { cwd },
    new TypeChain({
      cwd,
      rawConfig: {
        files: `${config.paths.artifacts}/!(build-info)/**/+([a-zA-Z0-9]).json`,
        outDir: config.typechain.outDir,
        target: config.typechain.target,
      },
    })
  );

  console.log(
    `Generated typescript types in the ${config.typechain.outDir} directory`
  );
});

/*
task(TASK_COMPILE_SOLIDITY_LOG_COMPILATION_RESULT).setAction(
  async (args, { config, run }, runSuper) => {
    await runSuper(args);

    // generate types
    if (config.typechain.runOnCompile && args.compilationJobs.length > 0) {
      const sourceNames = Array.from(
        args.compilationJobs[0]._filesToCompile.keys()
      );
      await run(TASK_TYPECHAIN_INTERNAL, { sourceNames });
    }
  }
);
*/

/**
 * Override the compile task if configured to
 * generate the types automatically after compile.
 *
 */
task(TASK_COMPILE).setAction(async (args, { config, run }, runSuper) => {
  await runSuper(args);

  // generate types
  if (config.typechain.runOnCompile) {
    await run(TASK_TYPECHAIN);
  }
});

/**
 * Override the clean task to cleanup types folder as well.
 *
 */
task(
  TASK_CLEAN,
  "Clears the cache and deletes all artifacts",
  async ({ global }: { global: boolean }, { config }, runSuper) => {
    if (global) {
      return;
    }

    if (await fsExtra.pathExists(config.typechain.outDir)) {
      await fsExtra.remove(config.typechain.outDir);
    }

    await runSuper();
  }
);
