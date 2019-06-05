#!/usr/bin/env node

import program from 'commander';
import { version } from '../../package.json';
import loader from '..';

program
  .version(version)
  .description('Load page.')
  .option('-V, --version', 'output the version number')
  .arguments('<firstConfig> <secondConfig>')
  .action((firstConfig, secondConfig) => (
    console.log(loader(firstConfig, secondConfig))
  ))
  .parse(process.argv);
