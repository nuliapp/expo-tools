#!/usr/bin/env bun

import { Command } from '@commander-js/extra-typings';
import { action } from './commands/devBuilds/index.js';

const program = new Command();

program
    .name('expo-tools')
    .description('Additional tools for expo projects')
    .version('0.0.1');

program
    .command('devBuilds')
    .description('Get download links for expo development builds')
    .option(
        '--runtimeVersion <runtimeVersion>',
        'defaults to the one in app.json',
    )
    .action(action);

program.parse();
