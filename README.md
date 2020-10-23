[![hardhat](https://hardhat.dev/hardhat-plugin-badge.svg?1)](https://hardhat.dev)

# hardhat-typechain

_Better integration with hardhat builtin tasks!_

Add [Typechain](https://www.github.com/ethereum-ts/TypeChain) tasks to your hardhat project!

## What

[TypeChain](https://www.github.com/ethereum-ts/TypeChain) gives you Typescript bindings for your smart contracts. Now, your tests and frontend code can be typesafe and magically autocomplete smart contract function names!

## Installation

```bash
npm i @unipeer/hardhat-typechain typechain ts-generator
```

And add the following statement to your `hardhat.config.js`:

```js
require("@unipeer/hardhat-typechain");
```

or 

```typescript
import "@unipeer/hardhat-typechain";
```

## Tasks

This plugin adds the _typechain_ task to hardhat:

```
Generate Typechain typings for compiled contracts
```

## Configuration

This plugin extends the `hardhatConfig` optional `typechain` object. The object contains two fields, `outDir` and `target`. `outDir` is the output directory of the artifacts that TypeChain creates (defaults to `typechain`). `target` is one of the targets specified by the TypeChain [docs](https://github.com/ethereum-ts/TypeChain#cli) (defaults to `ethers`).

You can also configure this plugin to automatically run after ever `compile` or `test` command
by setting the `onTest` or `onCompile` fields to true. `onTest` is by default set to true
and is recommended to avoid any frustrations in case where you forget to re-generate types
after updating a contract and your tests are out of sync with your contract code.

This is an example of how to set it:

```js
module.exports = {
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
    onTest: true,
    onCompile: false
  },
};
```

## Usage

`npx hardhat typechain` - Compiles and generates Typescript typings for your contracts.

Example Waffle + Ethers test that uses typedefs for contracts:

```ts
import { ethers } from "@nomiclabs/hardhat";
import chai from "chai";
import { Wallet } from "ethers";
import { deployContract, solidity } from "ethereum-waffle";

import CounterArtifact from "../artifacts/Counter.json";
import { Counter } from "../typechain/Counter";

chai.use(solidity);
const { expect } = chai;

describe("Counter", () => {
  let counter: Counter;

  beforeEach(async () => {
    // 1
    const signers = await ethers.signers();

    // 2
    counter = (await deployContract(
      <Wallet>signers[0],
      CounterArtifact
    )) as Counter;
    const initialCount = await counter.getCount();

    // 3
    expect(initialCount).to.eq(0);
    expect(counter.address).to.properAddress;
  });

  // 4
  describe("count up", async () => {
    it("should count up", async () => {
      await counter.countUp();
      let count = await counter.getCount();
      expect(count).to.eq(1);
    });
  });

  describe("count down", async () => {
    // 5
    it("should fail", async () => {
      await counter.countDown();
    });

    it("should count down", async () => {
      await counter.countUp();

      await counter.countDown();
      const count = await counter.getCount();
      expect(count).to.eq(0);
    });
  });
});
```

See this [starter kit](https://github.com/rhlsthrm/typescript-solidity-dev-starter-kit) for a full example!
