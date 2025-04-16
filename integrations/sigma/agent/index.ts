#!/usr/bin/env node

import { SigmaAgent } from './sigma-agent';

const main = async () => {
  const sigmaAgent = new SigmaAgent();
  sigmaAgent.parseAndRun();
};

main().catch((err) => {
  if (err instanceof Error) {
    console.error(err);
  } else {
    console.error('An unknown error has occurred. Please open an issue on github with the below:');
    console.error(err);
  }
  process.exit(1);
});
