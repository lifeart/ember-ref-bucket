#!/usr/bin/env node
'use strict';

const fs = require('fs');
const globby = require('globby');

const transforms = {
  'explicit-this-context-v6': require('./transforms/explicit-this-context-v6'),
};

const ALL = Object.keys(transforms);

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(
    'Usage: ember-ref-bucket-codemod [codemod-name] <path> [<path> ...]'
  );
  console.error(`Available codemods: ${ALL.join(', ')}`);
  console.error('');
  console.error('Run a specific codemod:');
  console.error(
    '  ember-ref-bucket-codemod explicit-this-context-v6 ./app ./tests'
  );
  console.error('Run all codemods:');
  console.error('  ember-ref-bucket-codemod ./app ./tests');
  process.exit(1);
}

let selected;
let paths;

if (args[0] in transforms) {
  selected = { [args[0]]: transforms[args[0]] };
  paths = args.slice(1);
} else {
  selected = transforms;
  paths = args;
}

if (paths.length === 0) {
  console.error('No paths provided.');
  process.exit(1);
}

const EXTENSIONS = ['hbs', 'gjs', 'gts'];

const globs = paths.map((arg) => {
  if (EXTENSIONS.some((ext) => arg.endsWith(`.${ext}`))) return arg;
  return arg.replace(/\/$/, '') + `/**/*.{${EXTENSIONS.join(',')}}`;
});

const files = globby.sync(globs, { gitignore: true });

if (files.length === 0) {
  console.log('No .hbs, .gjs or .gts files found.');
  process.exit(0);
}

for (const [name, codemod] of Object.entries(selected)) {
  console.log(`Running: ${name}`);
  let changed = 0;
  let unchanged = 0;
  let warned = 0;

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const result = codemod.transformFile(source, file);

    for (const { line, message } of result.warnings) {
      console.warn(`  warning: ${file}:${line} ${message}`);
      warned++;
    }
    if (result.code !== source) {
      fs.writeFileSync(file, result.code, 'utf8');
      console.log(`  updated: ${file}`);
      changed++;
    } else {
      unchanged++;
    }
  }

  console.log(
    `  ${changed} file(s) updated, ${unchanged} unchanged, ${warned} warning(s).\n`
  );
}
