/**
 * jvm-search.js — BM25 search for JVM tools.
 * Loads pre-built static assets; no LLM, no server.
 *
 * Keep in sync with: scripts/build-search-index.js (re-run after tool changes)
 */
import MiniSearch from 'minisearch';

const BASE = '/assets/data';
let ms = null, msDocs = null, autoData = null, loading = null;
let _indexUrl = null, _docsIndexUrl = null, _autocompleteUrl = null;

export function initSearchUrls(indexUrl, autocompleteUrl, docsIndexUrl) {
  _indexUrl = indexUrl;
  _autocompleteUrl = autocompleteUrl;
  _docsIndexUrl = docsIndexUrl ?? null;
}

// Must mirror the processTerm used at index time in build-search-index.js.
const processTerm = (term) => {
  const t = term.toLowerCase();
  if (t.length > 28) return null;
  if (t.includes('=')) return null;
  if (t.startsWith('-xx') || t.startsWith('-xms') || t.startsWith('-xmx')) return null;
  return t;
};

export async function ensureLoaded() {
  if (ms) return;
  if (loading) return loading;
  const idxUrl  = _indexUrl || `${BASE}/search-index.json`;
  const docsUrl = _docsIndexUrl || `${BASE}/search-index-docs.json`;
  const acUrl   = _autocompleteUrl || `${BASE}/autocomplete.json`;
  loading = (async () => {
    try {
      const [idxRaw, docsRaw, acData] = await Promise.all([
        fetch(idxUrl).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status} search-index.json`); return r.text(); }),
        fetch(docsUrl).then(r => r.ok ? r.text() : null).catch(() => null),
        fetch(acUrl).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status} autocomplete.json`); return r.json(); }),
      ]);
      const opts = {
        fields: ['toolId', 'toolIdNorm', 'name', 'tagline', 'when', 'features', 'concepts', 'synonyms', 'problems', 'queries', 'tree_paths', 'title', 'body'],
        storeFields: ['id'],
        tokenize: (text, fieldName) => {
          if (fieldName === 'toolId') return [text.toLowerCase()];
          return MiniSearch.getDefault('tokenize')(text, fieldName);
        },
        processTerm,
      };
      ms = MiniSearch.loadJSON(idxRaw, opts);
      if (docsRaw) msDocs = MiniSearch.loadJSON(docsRaw, { fields: ['title', 'body'], storeFields: ['id'], processTerm });
      autoData = acData;
    } catch (e) {
      loading = null;
      throw e;
    }
  })();
  return loading;
}

// No fuzzy on tokens ≤4 chars (mat, jmc, gc, jfr) — exact only.
// Light fuzz (0.1) on 5-7 char tokens, normal (0.2) on longer ones.
const fuzzyFn = term => term.length <= 4 ? false : term.length <= 7 ? 0.1 : 0.2;

export async function search(query) {
  if (!query) return [];
  await ensureLoaded();
  const results = ms.search(query, {
    prefix: true,
    fuzzy: fuzzyFn,
    boost: { toolId: 10, toolIdNorm: 8, name: 5, tagline: 3, synonyms: 2, concepts: 2, problems: 1.5, tree_paths: 0.5 },
  });

  // Merge how-to doc hits: score them at 0.4× the tool index scale so they
  // surface tools whose how-to guides mention the query but the tool entry itself doesn't.
  const docsResults = msDocs
    ? msDocs.search(query, { prefix: true, fuzzy: fuzzyFn }).map(r => ({ ...r, score: r.score * 0.4 }))
    : [];

  // Merge by id, keeping the higher score for any tool that appears in both indices.
  const merged = new Map();
  for (const r of [...results, ...docsResults]) {
    const prev = merged.get(r.id);
    if (!prev || r.score > prev.score) merged.set(r.id, r);
  }
  const combined = [...merged.values()].sort((a, b) => b.score - a.score);

  if (!combined.length) return [];
  const topScore = combined[0].score;
  const terms = query.trim().split(/\s+/).length;
  const pct = terms === 1 ? 0.25 : 0.15;
  const threshold = Math.max(1, topScore * pct);
  return combined
    .filter(r => r.score >= threshold)
    .map(r => ({ id: r.id, score: r.score }));
}

export async function autocomplete(prefix, limit = 6) {
  if (!prefix || prefix.length < 2) return [];
  await ensureLoaded();
  const q = prefix.toLowerCase();
  const phrases = autoData?.phrases ?? [];
  return [...phrases.filter(p => p.startsWith(q)), ...phrases.filter(p => !p.startsWith(q) && p.includes(q))].slice(0, limit);
}

export async function getExamples() {
  await ensureLoaded();
  return autoData?.examples ?? [];
}
