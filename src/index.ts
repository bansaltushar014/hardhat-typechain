import {
  TASK_TEST,
  TASK_CLEAN,
  TASK_COMPILE,
} from "@nomiclabs/buidler/builtin-tasks/task-names";
import { task } from "@nomiclabs/buidler/config";
import { BuidlerPluginError } from "@nomiclabs/buidler/plugins";
import fsExtra from "fs-extra";
import { tsGenerator } from "ts-generator";
import { TypeChain } from "typechain/dist/TypeChain";

import { getDefaultTypechainConfig } from "./config";

task("typechain", "Generate Typechain typings for compiled contracts")
  .addFlag("noCompile", "Don't compile before running this task")
  .setAction(async ({ noCompile }, { config, run }) => {
    const typechain = getDefaultTypechainConfig(config);
    const typechainTargets = ["ethers-v4", "truffle", "web3-v1", "ethers-v5"];
    if (!typechainTargets.includes(typechain.target as string)) {
      throw new BuidlerPluginError(
        "Invalid Typechain target, please provide via buidler.config.js (typechain.target)"
      );
    }

    if (!noCompile) {
      await run(TASK_COMPILE);
    }

    console.log(
      `Creating Typechain artifacts in directory ${typechain.outDir} for target ${typechain.target}`
    );

    const cwd = process.cwd();
    await tsGenerator(
      { cwd },
      new TypeChain({
        cwd,
        rawConfig: {
          files: `${config.paths.artifacts}/*.json`,
          outDir: typechain.outDir,
          target: typechain.target as string,
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
  "Compiles the entire project, building all artifacts").setAction(
  async (args, { config, run }, runSuper) => {
    const typechain = getDefaultTypechainConfig(config);
    if (typechain.onCompile) {
      await runSuper(args);                          // compile
      await run("typechain", { noCompile: true });   // generate types
    } else {
      await runSuper(); // default compile
    }
  }
);

/**
 * Override the test task if configured to
 * generate types before every test run.
 *
 */
task(
  TASK_TEST,
  "Runs mocha tests").setAction(
  async (args, { config, run }, runSuper) => {
    const typechain = getDefaultTypechainConfig(config);
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
