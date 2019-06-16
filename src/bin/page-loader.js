#!/usr/bin/env node

import program from 'commander';
import { version } from '../../package.json';
import loader from '..';

program
  .version(version)
  .description('Load page.')
  .option('-o, --output <pathToFolder>', 'folder', process.cwd())
  .arguments('<address>')
  .action(address => (
    loader(program.output, address)
      .then(() => console.log('file has been created successfully'))
  ))
  .parse(process.argv);
