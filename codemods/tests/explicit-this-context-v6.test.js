'use strict';

const fs = require('fs');
const path = require('path');
const { transformFile } = require('../src/transforms/explicit-this-context-v6');

const FIXTURES_DIR = path.join(
  __dirname,
  'fixtures',
  'explicit-this-context-v6'
);

const scenarios = fs.readdirSync(FIXTURES_DIR).filter((name) => {
  return fs.statSync(path.join(FIXTURES_DIR, name)).isDirectory();
});

function readWarnings(dir) {
  const file = path.join(dir, 'warnings.txt');
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
}

describe('explicit-this-context-v6', () => {
  for (const scenario of scenarios) {
    const dir = path.join(FIXTURES_DIR, scenario);
    const inputName = fs.readdirSync(dir).find((f) => f.startsWith('input.'));
    const ext = path.extname(inputName);

    test(scenario, () => {
      const input = fs.readFileSync(path.join(dir, inputName), 'utf8');
      const expected = fs.readFileSync(path.join(dir, `output${ext}`), 'utf8');

      const { code, warnings } = transformFile(input, inputName);

      expect(code).toBe(expected);
      expect(
        warnings.map((w) => `${inputName}:${w.line} ${w.message}`)
      ).toEqual(readWarnings(dir));
    });

    test(`${scenario} (idempotent)`, () => {
      const expected = fs.readFileSync(path.join(dir, `output${ext}`), 'utf8');

      expect(transformFile(expected, inputName).code).toBe(expected);
    });
  }
});
