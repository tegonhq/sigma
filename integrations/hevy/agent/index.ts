#!/usr/bin/env node

import { HevyAgent } from './hevy-agent';

const main = async () => {
  const hevyAgent = new HevyAgent();
  hevyAgent.parseAndRun();
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
