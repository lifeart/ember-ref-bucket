'use strict';

const fs = require('fs');
const path = require('path');
const { transform } = require('ember-template-recast');
const hbsTransform = require('../src/transforms/explicit-this-context-v6');

const FIXTURES_DIR = path.join(
  __dirname,
  'fixtures',
  'explicit-this-context-v6'
);

const scenarios = fs.readdirSync(FIXTURES_DIR).filter((name) => {
  return fs.statSync(path.join(FIXTURES_DIR, name)).isDirectory();
});

describe('explicit-this-context-v6', () => {
  for (const scenario of scenarios) {
    test(scenario, () => {
      const inputPath = path.join(FIXTURES_DIR, scenario, 'input.hbs');
      const outputPath = path.join(FIXTURES_DIR, scenario, 'output.hbs');
      const input = fs.readFileSync(inputPath, 'utf8');
      const expected = fs.readFileSync(outputPath, 'utf8');

      const { code } = transform(input, hbsTransform);

      expect(code).toBe(expected);
    });
  }
});
