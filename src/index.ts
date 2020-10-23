import fsExtra from "fs-extra";
import {
  TASK_CLEAN,
  TASK_COMPILE,
  TASK_TEST,
} from "hardhat/builtin-tasks/task-names";
import { extendConfig, task } from "hardhat/config";
import { HardhatPluginError } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import { tsGenerator } from "ts-generator";
import { TypeChain } from "typechain/dist/TypeChain";

// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions";

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

    const outDir = userConfig.typechain?.outDir;
    const target = userConfig.typechain?.target;
    const onCompile = userConfig.typechain?.onCompile;
    const onTest = userConfig.typechain?.onTest;

    config.typechain.outDir = outDir ? outDir : "typechain";
    config.typechain.target = target ? target : "ethers-v5";
    config.typechain.onCompile = onCompile ? onCompile : false;
    config.typechain.onTest = onTest ? onTest : true;
  }
);

task("typechain", "Generate Typechain typings for compiled contracts")
  .addFlag("noCompile", "Don't compile before running this task")
  .setAction(async ({ noCompile }, { config, run }) => {
    const typechainTargets = ["truffle-v5", "web3-v1", "ethers-v5"];
    if (!typechainTargets.includes(config.typechain.target)) {
      throw new HardhatPluginError(
        "Invalid Typechain target, please provide via hardhat.config.js (typechain.target)"
      );
    }

    if (!noCompile) {
      await run(TASK_COMPILE);
    }

    console.log(
      `Creating Typechain artifacts in directory ${config.typechain.outDir} for target ${config.typechain.target}`
    );

    const cwd = process.cwd();
    await tsGenerator(
      { cwd },
      new TypeChain({
        cwd,
        rawConfig: {
          files: `${config.paths.artifacts}/!(build-info)/**/+([a-zA-Z0-9]).json`,
          outDir: config.typechain.outDir,
          target: config.typechain.target as string,
        },
      })
    );

    console.log(`Successfully generated Typechain artifacts!`);
  });

/**
 * Override the compile task if configured to
 * generate the types automatically after compile.
 *
 */
task(
  TASK_COMPILE,
  "Compiles the entire project, building all artifacts"
).setAction(async (args, { config, run }, runSuper) => {
  const typechain = config.typechain;
  if (typechain.onCompile) {
    await runSuper(args); // compile
    await run("typechain", { noCompile: true }); // generate types
  } else {
    await runSuper(); // default compile
  }
});

/**
 * Override the test task if configured to
 * generate types before every test run.
 *
 */
task(TASK_TEST, "Runs mocha tests").setAction(
  async (args, { config, run }, runSuper) => {
    const typechain = config.typechain;
    if (typechain.onTest) {
      await run("typechain", { noCompile: false }); // compile -> generate types
      await runSuper({ noCompile: true, ...args }); // test without compiling
    } else {
      await runSuper(args); // default test
    }
  }
);

/**
 * Override the clean task to cleanup types folder as well.
 *
 */
task(
  TASK_CLEAN,
  "Clears the cache and deletes all artifacts",
  async (args, { config }, runSuper) => {
    await runSuper(args);
    if (config.typechain && config.typechain.outDir) {
      await fsExtra.remove(config.typechain.outDir);
    }
  }
);
