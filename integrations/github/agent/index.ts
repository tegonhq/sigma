#!/usr/bin/env node

import { GithubAgent } from './github-agent';

const main = async () => {
  const githubAgent = new GithubAgent();
  githubAgent.parseAndRun();
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
