#!/usr/bin/env node
/**
 * Build MiniSearch BM25 index + autocomplete phrase list.
 *
 * Reads:  static/assets/data/jvm-tools.json + jvm-tools-tree.json (built by build-jvm-data.js)
 *         data/diagnostic-tools/tool-enrichment.yaml
 *         docs/**\/*.md (how-to guides)
 * Writes: static/assets/data/search-index.json
 *         static/assets/data/autocomplete.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import MiniSearch from 'minisearch';
import yaml from 'js-yaml';

const ROOT   = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA   = path.join(ROOT, 'static/assets/data');
const ENR    = path.join(ROOT, 'data/diagnostic-tools/tool-enrichment.yaml');
const IDX    = path.join(DATA, 'search-index.json');
const IDX_DOCS = path.join(DATA, 'search-index-docs.json');
const AC_OUT = path.join(DATA, 'autocomplete.json');

function loadBuiltData() {
  const toolsPath = path.join(DATA, 'jvm-tools.json');
  const treePath  = path.join(DATA, 'jvm-tools-tree.json');
  if (!fs.existsSync(toolsPath) || !fs.existsSync(treePath)) {
    throw new Error('jvm-tools.json or jvm-tools-tree.json missing — run: npm run build-jvm-data first');
  }
  return {
    tools: JSON.parse(fs.readFileSync(toolsPath, 'utf8')),
    tree:  JSON.parse(fs.readFileSync(treePath,  'utf8')),
  };
}

function buildTreeText(tree) {
  const resultTools = {};
  for (const [key, node] of Object.entries(tree)) {
    if (node.type !== 'result') continue;
    resultTools[key] = new Set([
      ...(node.tools ?? []).map(t => t.id),
      ...(node.related ?? []).flatMap(r => (r.tools ?? []).map(t => t.id)),
      ...(node.followon?.tools ?? []).map(t => t.id),
    ]);
  }
  const toolText = {};
  const addText = (id, text) => { toolText[id] = toolText[id] ? toolText[id] + ' ' + text : text; };

  for (const [key, node] of Object.entries(tree)) {
    if (node.type !== 'result') continue;
    for (const id of resultTools[key] ?? []) {
      if (node.headline) addText(id, node.headline);
    }
  }

  function walk(nodeKey, labels) {
    const node = tree[nodeKey];
    if (!node) return;
    if (node.type === 'result') {
      for (const id of resultTools[nodeKey] ?? []) addText(id, labels.join(' '));
      return;
    }
    if (node.type === 'question') {
      for (const opt of node.options ?? []) walk(opt.next, [...labels, opt.label]);
    }
  }
  walk('start', []);
  return toolText;
}

function loadHowTos() {
  const docsDir = path.join(ROOT, 'docs');
  const howtos = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!entry.name.endsWith('.md') && !entry.name.endsWith('.mdx')) continue;
      const raw = fs.readFileSync(full, 'utf8');
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      if (!fmMatch) continue;
      const titleMatch = fmMatch[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
      if (!titleMatch) continue;
      const title = titleMatch[1].trim();
      const body = (fmMatch[2].split(/\n{2,}/).find(b => {
        const t = b.trim();
        return t && !t.startsWith('#') && !t.startsWith('---');
      }) ?? '').replace(/[#*`[\]]/g, '').trim();
      const id = 'doc_' + path.relative(docsDir, full).replace(/[/\\]/g, '_').replace(/\.mdx?$/, '');
      howtos.push({ id, title, body });
    }
  }
  if (fs.existsSync(docsDir)) walk(docsDir);
  return howtos;
}

function main() {
  const { tools, tree } = loadBuiltData();
  const enrichment = fs.existsSync(ENR) ? yaml.load(fs.readFileSync(ENR, 'utf8')) ?? {} : {};
  const toolTreeText = buildTreeText(tree);

  const ms = new MiniSearch({
    fields: ['toolId', 'toolIdNorm', 'name', 'tagline', 'when', 'features', 'concepts', 'synonyms', 'problems', 'queries', 'tree_paths', 'title', 'body'],
    storeFields: ['id'],
    // toolId: keep whole hyphenated ID as one token to avoid partial-word boost bleed.
    tokenize: (text, fieldName) => {
      if (fieldName === 'toolId') return [text.toLowerCase()];
      return MiniSearch.getDefault('tokenize')(text, fieldName);
    },
    // Drop tokens that are JVM flag names or pathologically long (e.g. HeapDumpOnOutOfMemoryError,
    // -XX:HeapDumpGzipLevel=1). These cause false prefix matches and inflate unrelated tool scores.
    processTerm: (term, _fieldName) => {
      const t = term.toLowerCase();
      if (t.length > 28) return null;       // flag names, long camelcase — skip
      if (t.includes('=')) return null;     // flag assignments like gziplevel=1
      if (t.startsWith('-xx') || t.startsWith('-xms') || t.startsWith('-xmx')) return null;
      return t;
    },
  });

  ms.addAll(tools.map(tool => {
    const e = enrichment[tool.id] ?? {};
    return {
      id:          tool.id,
      toolId:      tool.id,
      toolIdNorm:  tool.id.replace(/-/g, ''),   // e.g. "highmemoryreports" — catches no-hyphen queries
      name:        tool.name ?? '',
      tagline:     tool.tagline ?? tool.tagline_short ?? '',
      when:        (tool.when_to_use ?? []).join(' '),
      features:    (tool.features    ?? []).join(' '),
      concepts:    (e.concepts  ?? []).join(' '),
      synonyms:    (e.synonyms  ?? []).join(' '),
      problems:    (e.problems  ?? []).join(' '),
      queries:     (e.queries   ?? []).join(' '),
      tree_paths:  toolTreeText[tool.id] ?? '',
    };
  }));

  // Docs go into a separate index so their scores don't inflate the tool threshold in jvm-search.js
  const msDocs = new MiniSearch({
    fields: ['title', 'body'],
    storeFields: ['id'],
    processTerm: (term, _fieldName) => {
      const t = term.toLowerCase();
      if (t.length > 28) return null;
      if (t.includes('=')) return null;
      return t;
    },
  });
  const howtos = loadHowTos();
  msDocs.addAll(howtos.map(h => ({ id: h.id, title: h.title, body: h.body })));

  fs.writeFileSync(IDX, JSON.stringify(ms.toJSON()));
  fs.writeFileSync(IDX_DOCS, JSON.stringify(msDocs.toJSON()));
  console.log(`[lexical] ${tools.length} tools → ${path.relative(ROOT, IDX)}, ${howtos.length} how-tos → ${path.relative(ROOT, IDX_DOCS)}`);

  const phrases = new Set();
  for (const tool of tools) {
    const e = enrichment[tool.id] ?? {};
    for (const p of [tool.id, ...(e.queries ?? []), ...(e.synonyms ?? [])]) {
      const c = p.toLowerCase().trim();
      if (c && c.split(/\s+/).length <= 6) phrases.add(c);
    }
  }
  for (const node of Object.values(tree)) {
    if (node.type !== 'question') continue;
    for (const opt of node.options ?? []) {
      const c = opt.label.toLowerCase().trim();
      if (c && c.split(/\s+/).length <= 8) phrases.add(c);
    }
  }
  for (const h of howtos) {
    const c = h.title.toLowerCase().trim();
    if (c && c.split(/\s+/).length <= 8) phrases.add(c);
  }
  // Tool how-to titles only (bodies are too noisy for autocomplete suggestions)
  for (const tool of tools) {
    for (const h of tool.how_to ?? []) {
      const c = h.title.toLowerCase().trim();
      if (c && c.split(/\s+/).length <= 8) phrases.add(c);
    }
  }

  const PHRASE_BLOCKLIST = [
    'alternative', 'replacement', 'equivalent',
    'instead of', 'vs ', 'versus', 'substitute', 'swap', 'migrate to', 'switch to',
  ];
  const cleanPhrases = [...phrases].filter(p => !PHRASE_BLOCKLIST.some(b => p.includes(b)));

  const examples = cleanPhrases
    .filter(p => p.split(/\s+/).length >= 3)
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 20);
  fs.writeFileSync(AC_OUT, JSON.stringify({ phrases: cleanPhrases.sort(), examples }));
  console.log(`[autocomplete] ${cleanPhrases.length} phrases + ${examples.length} examples → ${path.relative(ROOT, AC_OUT)}`);
}

main();
