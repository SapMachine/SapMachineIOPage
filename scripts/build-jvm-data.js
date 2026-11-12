#!/usr/bin/env node
/**
 * Reads tool YAML files and writes merged JSON to static/assets/data/.
 *
 * Reads:
 *   data/diagnostic-tools/tools/*.yaml        — tool definitions (one file per tool)
 *   data/diagnostic-tools/problem-finder.yaml — decision tree
 *   data/diagnostic-tools/releases.json       — release versions (updated by fetch-releases.py)
 *
 * Writes:
 *   static/assets/data/jvm-tools.json
 *   static/assets/data/jvm-tools-releases.json
 *   static/assets/data/jvm-tools-tree.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT      = path.join(__dirname, '..');
const DATA_DIR  = path.join(ROOT, 'data', 'diagnostic-tools');
const TOOLS_DIR = path.join(DATA_DIR, 'tools');
const OUT_DIR   = path.join(ROOT, 'static', 'assets', 'data');

const TREE_YAML     = path.join(DATA_DIR, 'problem-finder.yaml');
const RELEASES_JSON = path.join(DATA_DIR, 'releases.json');
const REGISTRY_YAML = path.join(DATA_DIR, 'tool-registry.yaml');
const NAMES_YAML    = path.join(DATA_DIR, 'tool-names.yaml');

const MAX_OPTIONS = 6;

function validateTree(tree) {
  const violations = [];
  for (const [key, node] of Object.entries(tree)) {
    if (node.type === 'question' && Array.isArray(node.options) && node.options.length > MAX_OPTIONS) {
      violations.push(`  Node '${key}' has ${node.options.length} options (max ${MAX_OPTIONS})`);
    }
  }
  if (violations.length > 0) {
    throw new Error(`[build-jvm-data] Tree validation failed:\n${violations.join('\n')}`);
  }
}

function loadTools(repoMap, namesMap) {
  return fs.existsSync(TOOLS_DIR)
    ? fs.readdirSync(TOOLS_DIR)
        .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
        .map(f => {
          const tool = yaml.load(fs.readFileSync(path.join(TOOLS_DIR, f), 'utf8'));
          if (tool && !tool.github_url && repoMap.has(tool.id)) {
            tool.github_url = repoMap.get(tool.id);
          }
          if (tool && !tool.name && namesMap.has(tool.id)) {
            tool.name = namesMap.get(tool.id);
          }
          return tool;
        })
        .filter(Boolean)
    : [];
}

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_YAML)) return [];
  const entries = yaml.load(fs.readFileSync(REGISTRY_YAML, 'utf8')) || [];
  return entries;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  if (!fs.existsSync(TREE_YAML)) {
    console.error(`[build-jvm-data] Missing ${TREE_YAML}`);
    process.exit(1);
  }

  const GROUP_ORDER = [
    'Live JVM Inspection',
    'JFR / Profiling',
    'Heap Dump Analysis',
    'Crash / Log Diagnostics',
    'Agent Development',
    'Testing',
    // 'JAR Packaging' intentionally omitted → sorts last
  ];
  const groupRank = g => { const i = GROUP_ORDER.indexOf(g); return i === -1 ? GROUP_ORDER.length : i; };

  // Status rank: more production-ready tags sort first
  const TAG_RANK = { ready: 0, external: 1, experimental: 2, poc: 3, demo: 4, educational: 5 };
  const tagRank = t => TAG_RANK[t] ?? 6;

  // Build per-tool order lookup and repo map from registry
  const registry = loadRegistry();
  const orderMap = new Map();
  const repoMap = new Map();
  for (const entry of registry) {
    const id = entry.name ?? (entry.repo ? entry.repo.replace(/\/$/, '').split('/').pop() : null);
    if (id && entry.order != null) orderMap.set(id, entry.order);
    if (id && entry.repo) repoMap.set(id, entry.repo.replace(/\/$/, ''));
  }

  const namesMap = fs.existsSync(NAMES_YAML)
    ? new Map(Object.entries(yaml.load(fs.readFileSync(NAMES_YAML, 'utf8')) || {}))
    : new Map();

  const tools = loadTools(repoMap, namesMap).sort((a, b) => {
    const groupDiff = groupRank(a.group) - groupRank(b.group);
    if (groupDiff !== 0) return groupDiff;
    const tagDiff = tagRank(a.tag) - tagRank(b.tag);
    if (tagDiff !== 0) return tagDiff;
    const orderA = orderMap.get(a.id) ?? 999;
    const orderB = orderMap.get(b.id) ?? 999;
    return orderA - orderB;
  });
  console.log(`[build-jvm-data] Loaded ${tools.length} tools`);

  const tree = yaml.load(fs.readFileSync(TREE_YAML, 'utf8'));
  if (typeof tree !== 'object' || !tree) { console.error('problem-finder.yaml must be an object'); process.exit(1); }
  validateTree(tree);

  fs.writeFileSync(path.join(OUT_DIR, 'jvm-tools.json'), JSON.stringify(tools, null, 2));
  console.log(`[build-jvm-data] Wrote ${tools.length} tools → static/assets/data/jvm-tools.json`);

  if (fs.existsSync(RELEASES_JSON)) {
    fs.copyFileSync(RELEASES_JSON, path.join(OUT_DIR, 'jvm-tools-releases.json'));
    console.log(`[build-jvm-data] Copied releases → static/assets/data/jvm-tools-releases.json`);
  }

  fs.writeFileSync(path.join(OUT_DIR, 'jvm-tools-tree.json'), JSON.stringify(tree, null, 2));
  console.log(`[build-jvm-data] Wrote tree (${Object.keys(tree).length} nodes) → static/assets/data/jvm-tools-tree.json`);
}

main();
