'use strict';

const { Preprocessor } = require('content-tag');
const { parse } = require('@babel/parser');
const { transform } = require('ember-template-recast');

const DEEP_IMPORT = /^ember-ref-bucket\/(?:modifiers|helpers)\/([\w-]+)$/;

const preprocessor = new Preprocessor();

// Replaces each <template> with a same-length placeholder that keeps the
// file valid JS, so babel's offsets and line numbers match the original.
function blankTemplates(source, templates) {
  let out = '';
  let cursor = 0;
  for (const { type, range } of templates) {
    const start = range.startUtf16Codepoint;
    const end = range.endUtf16Codepoint;
    out += source.slice(cursor, start);
    out += type === 'class-member' ? ';' : '0';
    out += source.slice(start + 1, end).replace(/[^\r\n]/g, ' ');
    cursor = end;
  }
  return out + source.slice(cursor);
}

function topLevelNames(program) {
  const names = new Set();
  const addPattern = (id) => {
    if (id && id.type === 'Identifier') names.add(id.name);
  };
  for (let node of program.body) {
    if (
      (node.type === 'ExportNamedDeclaration' ||
        node.type === 'ExportDefaultDeclaration') &&
      node.declaration
    ) {
      node = node.declaration;
    }
    if (node.type === 'ImportDeclaration') {
      node.specifiers.forEach((s) => names.add(s.local.name));
    } else if (node.type === 'VariableDeclaration') {
      node.declarations.forEach((d) => addPattern(d.id));
    } else if (node.id) {
      addPattern(node.id);
    }
  }
  return names;
}

// Local binding -> canonical kebab-case name, for default imports from
// `ember-ref-bucket/{modifiers,helpers}/<name>`. The package root exports no
// modifiers or helpers, so named imports from it are not considered.
function collectRefImports(program, knownNames) {
  const bindings = new Map();
  let lastImport = null;
  for (const node of program.body) {
    if (node.type !== 'ImportDeclaration') continue;
    const match = DEEP_IMPORT.exec(node.source.value);
    if (!match || !knownNames.has(match[1])) continue;
    lastImport = node;
    for (const spec of node.specifiers) {
      const isDefault =
        spec.type === 'ImportDefaultSpecifier' ||
        (spec.type === 'ImportSpecifier' &&
          (spec.imported.name || spec.imported.value) === 'default');
      if (isDefault) bindings.set(spec.local.name, match[1]);
    }
  }
  return { bindings, lastImport };
}

function camelize(name) {
  return name.replace(/-(\w)/g, (_, c) => c.toUpperCase());
}

function transformTemplateTag(source, file, { knownNames, createPlugin }) {
  const warnings = [];
  const lineAt = (index) => source.slice(0, index).split('\n').length;

  let templates;
  let program;
  try {
    templates = preprocessor.parse(source, { filename: file });
    program = parse(blankTemplates(source, templates), {
      sourceType: 'module',
      errorRecovery: true,
      plugins: [
        'decorators-legacy',
        ...(file.endsWith('.gts') ? ['typescript'] : []),
      ],
    }).program;
  } catch (error) {
    warnings.push({ line: 1, message: `could not parse: ${error.message}` });
    return { code: source, warnings };
  }

  const { bindings, lastImport } = collectRefImports(program, knownNames);
  if (bindings.size === 0) return { code: source, warnings };

  const byCanonical = new Map([...bindings].map(([local, c]) => [c, local]));
  const declared = topLevelNames(program);
  const newImports = [];

  const globalBinding = (canonical) => {
    if (byCanonical.has(canonical)) return byCanonical.get(canonical);
    let name = camelize(canonical);
    for (let i = 2; declared.has(name); i++)
      name = `${camelize(canonical)}${i}`;
    declared.add(name);
    byCanonical.set(canonical, name);
    const kind = canonical.endsWith('ref-to') ? 'helpers' : 'modifiers';
    newImports.push(
      `import ${name} from 'ember-ref-bucket/${kind}/${canonical}';`
    );
    return name;
  };

  const edits = [];
  for (const template of templates) {
    const start = template.contentRange.startUtf16Codepoint;
    const end = template.contentRange.endUtf16Codepoint;
    const contents = source.slice(start, end);
    const baseLine = lineAt(start);
    const plugin = createPlugin({
      resolve: (name) => bindings.get(name),
      thisAvailable: template.type === 'class-member',
      globalBinding,
      warn: (node, message) =>
        warnings.push({ line: baseLine + node.loc.start.line - 1, message }),
    });

    try {
      const { code } = transform(contents, plugin);
      if (code !== contents) edits.push({ start, end, text: code });
    } catch (error) {
      warnings.push({
        line: baseLine,
        message: `could not transform <template>: ${error.message}`,
      });
    }
  }

  if (newImports.length) {
    const quote = source[lastImport.source.start];
    const text = newImports
      .map((line) => '\n' + line.replace(/'/g, quote))
      .join('');
    const semicolon = source[lastImport.end - 1] === ';';
    edits.push({
      start: lastImport.end,
      end: lastImport.end,
      text: semicolon ? text : text.replace(/;$/gm, ''),
    });
  }

  let code = source;
  for (const { start, end, text } of edits.sort((a, b) => b.start - a.start)) {
    code = code.slice(0, start) + text + code.slice(end);
  }
  return { code, warnings };
}

module.exports = { transformTemplateTag };
