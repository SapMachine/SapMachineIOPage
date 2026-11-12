import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { Highlight, Prism } from 'prism-react-renderer';
import codeTheme from '../lib/code-theme';
import shellSmartLanguage from '../lib/shell-lang';
import { highlightShell } from '../lib/shell-highlight';
import { go, back, goTo, reset, pfHide, pfShow, pfIsHidden, matchesTool } from '../lib/jvm-tools-core';
import { search as hybridSearch, autocomplete as semanticAutocomplete, initSearchUrls } from '../lib/jvm-search';
import '../css/jvm-tools.css';
if (!Prism.languages['shell-smart']) {
  Prism.languages['shell-smart'] = shellSmartLanguage;
}

const BADGE_TITLES = {
  ready: 'Production-ready',
  experimental: 'Experimental — API may change',
  poc: 'Proof of concept',
  demo: 'Demo only',
};

function Badge({ tag }) {
  return (
    <span className={`jvm-badge jvm-badge-${tag || 'experimental'}`}
          title={BADGE_TITLES[tag] || tag}>
      {tag}
    </span>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
    </svg>
  );
}

function ExtIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24"
         aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', flexShrink: 0 }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
    </svg>
  );
}

function ChevronRight({ size = 12 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
    </svg>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={`jvm-back-to-top${visible ? ' visible' : ''}`}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"/>
      </svg>
    </button>
  );
}

const SHELL_LANGS = new Set(['shell-smart', 'sh', 'shell', 'bash']);
const LANG_ALIAS = { xml: 'markup', html: 'markup', svg: 'markup', sh: 'shell-smart', shell: 'shell-smart', bash: 'shell-smart' };

const TOKEN_STYLE = {
  command:     { color: '#DCDCAA' },
  flag:        { color: '#C586C0' },
  variable:    { color: '#C586C0' },
  placeholder: { color: '#569CD6' },
  string:      { color: '#CE9178' },
  url:         { color: '#8396A8' },
  comment:     { color: '#6A9955', fontStyle: 'italic' },
  number:      { color: '#B5CEA8' },
  operator:    { color: '#FFFFFF' },
  path:        { color: '#CE9178' },
  plain:       { color: '#D4D4D4' },
};

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  const language = LANG_ALIAS[lang] || lang || 'text';
  const isShell = SHELL_LANGS.has(language) || SHELL_LANGS.has(lang);
  const ohm = isShell ? highlightShell(code.trimEnd()) : null;

  const preStyle = { backgroundColor: '#1E1E1E', color: '#D4D4D4', margin: 0, padding: '14px 16px', fontSize: 12.5, overflowX: 'auto', lineHeight: 1.6 };

  return (
    <div className="jvm-code-wrap">
      {ohm ? (
        <pre style={preStyle}>
          {ohm.flatMap((line, i) => {
            const lineSpans = line.map((tok, j) => (
              <span key={`${i}-${j}`} style={TOKEN_STYLE[tok.types[0]] || TOKEN_STYLE.plain}>{tok.content}</span>
            ));
            return i === 0 ? lineSpans : ['\n', ...lineSpans];
          })}
        </pre>
      ) : (
        <Highlight code={code.trimEnd()} language={language} theme={codeTheme}>
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre style={{ ...style, margin: 0, padding: '14px 16px', fontSize: 12.5, overflowX: 'auto', lineHeight: 1.6 }}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => {
                      const props = getTokenProps({ token });
                      if (token.types.includes('parameter')) props.style = { ...props.style, color: '#C586C0' };
                      return <span key={key} {...props} />;
                    })}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      )}
      <button
        className={`jvm-copy-btn${copied ? ' copied' : ''}`}
        title={copied ? 'Copied!' : 'Copy'}
        aria-label={copied ? 'Copied!' : 'Copy code'}
        onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      >
        {copied
          ? <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>
          : <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/></svg>
        }
      </button>
    </div>
  );
}

function renderInlineMarkdown(text) {
  // Handles: [text](url), `code`, https?:// bare URLs — returns an array of React nodes
  const re = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)|`([^`]+)`|(https?:\/\/\S+)/g;
  const parts = [];
  let last = 0, m, key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) {
      parts.push(<a key={key++} href={m[2]} target="_blank" rel="noopener" style={{ color: 'var(--sap-blue7, #0070F2)' }}>{m[1]}</a>);
    } else if (m[3]) {
      parts.push(<code key={key++} style={{ fontSize: '0.85em', background: 'var(--sap-grey2, #EAECEE)', borderRadius: 3, padding: '1px 4px', color: 'var(--sap-grey9)' }}>{m[3]}</code>);
    } else {
      parts.push(<a key={key++} href={m[4]} target="_blank" rel="noopener" style={{ color: 'var(--sap-blue7, #0070F2)' }}>{m[4]}</a>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MarkdownProse({ text }) {
  return (
    <div style={{ fontSize: 14, color: 'var(--sap-grey7, #475E75)', lineHeight: 1.75 }}>
      {text.trimEnd().split('\n').map((line, i) => (
        <p key={i} style={{ margin: '0 0 6px' }}>{renderInlineMarkdown(line)}</p>
      ))}
    </div>
  );
}

// Renders a how-to body: splits fenced code blocks out, renders prose inline + code blocks
function HowToBody({ text }) {
  const segments = [];
  const fenceRe = /```(\w*)\n([\s\S]*?)```/g;
  let last = 0, m, key = 0;
  while ((m = fenceRe.exec(text)) !== null) {
    if (m.index > last) {
      const prose = text.slice(last, m.index).trim();
      if (prose) segments.push(
        <p key={key++} style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--sap-grey7, #475E75)', lineHeight: 1.75 }}>
          {renderInlineMarkdown(prose)}
        </p>
      );
    }
    // Bleed code block edge-to-edge inside the panel
    segments.push(
      <div key={key++} className="jvm-howto-code">
        <CodeBlock lang={m[1] || 'bash'} code={m[2].trimEnd()} />
      </div>
    );
    last = m.index + m[0].length;
  }
  const tail = text.slice(last).trim();
  if (tail) segments.push(
    <p key={key++} style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--sap-grey7, #475E75)', lineHeight: 1.75 }}>
      {renderInlineMarkdown(tail)}
    </p>
  );
  return <>{segments}</>;
}

function CodeTabs({ tabs, version }) {
  const [active, setActive] = useState(0);
  const code = version
    ? (tabs[active]?.code || '').replace(/VERSION/g, version)
    : (tabs[active]?.code || '');
  const lang = tabs[active]?.lang || 'bash';
  return (
    <div>
      {tabs.length > 1 && (
        <div style={{ display: 'flex', gap: 0, marginBottom: -1, flexWrap: 'wrap' }}>
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`jvm-tab-btn${i === active ? ' active' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>
      )}
      {lang === 'markdown'
        ? <MarkdownProse text={code} />
        : <CodeBlock lang={lang} code={code} />}
    </div>
  );
}

// ─── Decision tree ────────────────────────────────────────────────────────────

function ProblemFinder({ tree, toolIds, toolsMap, query, onQueryChange, suggestions, showSugg, onSuggSelect, onSuggBlur, onSuggFocus, onSuggHide, searchRef }) {
  const [hidden, setHidden] = useState(pfIsHidden);
  const [nav, setNav] = useState(() => reset());
  const [activeIdx, setActiveIdx] = useState(-1);

  const cur = nav.cur;
  const hist = nav.hist;

  const doGo = (id, label) => setNav(s => go(s, id, label));
  const doBack = () => setNav(s => back(s));
  const doGoTo = (idx) => setNav(s => goTo(s, idx));
  const doReset = () => { setNav(reset()); };
  const hide = () => { setHidden(true); pfHide(); };
  const show = () => { setHidden(false); pfShow(); };

  if (!tree) return null;
  const node = tree[cur];
  if (!node) return null;

  const isAtStart = cur === 'start' && hist.length === 0;
  const isSearching = query.length > 0;

  const crumbStyle = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--sap-grey5, #8396A8)', fontSize: 12, padding: '0 2px',
    fontFamily: 'var(--sap-font-family)',
  };

  if (hidden) {
    return (
      <div style={{ marginBottom: 24 }}>
        <button onClick={show} aria-expanded="false" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--sap-blue7, #0070F2)', padding: 0, fontFamily: 'var(--sap-font-family)' }}>
          Not sure which tool you need? Show guide ▸
        </button>
      </div>
    );
  }

  return (
    <div className="jvm-problem-finder" style={{ position: 'relative' }}>
      {/* Close button — top-right corner, always visible */}
      <button onClick={hide} aria-label="Hide guide" aria-expanded="true"
        style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, color: 'var(--sap-grey5)', padding: '8px 10px', fontFamily: 'var(--sap-font-family)', zIndex: 1 }}
        onMouseEnter={e => e.currentTarget.style.color='var(--sap-grey8)'} onMouseLeave={e => e.currentTarget.style.color='var(--sap-grey5)'}>
        ✕
      </button>

      {/* Header row: label + search bar */}
      <div className="jvm-pf-header">
        <p className="jvm-pf-header-label">
          What problem are you trying to solve?
        </p>

        {/* Search bar inline */}
        <div className="jvm-search-wrap" style={{ flex: 1, marginBottom: 0 }}>
        <span className="jvm-search-icon"><SearchIcon size={16} /></span>
        <input
          ref={searchRef}
          type="search"
          role="combobox"
          className="jvm-search"
          placeholder="Describe your problem or search by name…"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          onFocus={onSuggFocus}
          onBlur={onSuggBlur}
          onKeyDown={e => {
            if (e.key === 'Escape') { onQueryChange(''); setActiveIdx(-1); }
            else if (e.key === 'Enter') {
              if (activeIdx >= 0 && suggestions[activeIdx]) {
                onSuggSelect(suggestions[activeIdx]);
              } else {
                onSuggHide?.();
              }
              setActiveIdx(-1);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveIdx(i => Math.max(i - 1, -1));
            }
          }}
          aria-label="Search tools"
          aria-autocomplete="list"
          aria-expanded={showSugg}
          aria-controls="jvm-search-listbox"
        />
        {query && (
          <button className="jvm-search-clear" onClick={() => onQueryChange('')} aria-label="Clear search">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
        {showSugg && suggestions.length > 0 && (
          <ul id="jvm-search-listbox" className="jvm-search-suggestions" role="listbox">
            {suggestions.map((s, i) => (
              <li key={s} role="option" aria-selected={i === activeIdx} className={`jvm-search-suggestion${i === activeIdx ? ' active' : ''}`}
                  onMouseDown={() => { setActiveIdx(-1); onSuggSelect(s); }}
                  onMouseEnter={() => setActiveIdx(i)}>
                <SearchIcon size={13} />
                {s}
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>

      {/* Idle state: breadcrumbs + tree, or example chips */}
      {!isSearching && (
        <>
          {hist.length > 0 && (
            <nav aria-label="Decision tree path" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px 4px', marginBottom: 12, fontSize: 12 }}>
              <button style={crumbStyle} onClick={doReset}
                onMouseEnter={e => e.target.style.color='var(--sap-blue7, #0070F2)'} onMouseLeave={e => e.target.style.color='var(--sap-grey5, #8396A8)'}>
                Start over
              </button>
              <span style={{ color: 'var(--sap-grey3, #D5DADD)' }}>›</span>
              {hist.map((crumb, i) => (
                <React.Fragment key={i}>
                  <button style={{ ...crumbStyle, maxWidth: '14rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    onClick={() => doGoTo(i)} title={crumb.label}
                    onMouseEnter={e => e.target.style.color='var(--sap-blue7, #0070F2)'} onMouseLeave={e => e.target.style.color='var(--sap-grey5, #8396A8)'}>
                    {crumb.label}
                  </button>
                  <span style={{ color: 'var(--sap-grey3, #D5DADD)' }}>›</span>
                </React.Fragment>
              ))}
              <button style={crumbStyle} onClick={doBack}
                onMouseEnter={e => e.target.style.color='var(--sap-blue7, #0070F2)'} onMouseLeave={e => e.target.style.color='var(--sap-grey5, #8396A8)'}>
                ← Back
              </button>
            </nav>
          )}
        </>
      )}

      <div aria-live="polite" aria-atomic="true">
      {!isSearching && node.type === 'question' && (
        <>
          <div className="jvm-pf-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 8 }}>
            {node.options.map((opt, i) => (
              <button key={i} className="jvm-pf-option-btn" onClick={() => doGo(opt.next, opt.label)}>
                <span>{opt.label}</span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </>
      )}

      {node.type === 'result' && (
        <>
          <p style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: 'var(--sap-grey9, #223548)' }}>
            {node.headline}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {(node.tools || [])
              .filter(t => !t.section || t.section === 'jvm-tools')
              .filter(t => toolIds.includes(t.id))
              .map((t, i) => (
                <div key={i} className="jvm-pf-result-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--sap-grey9, #223548)' }}>{toolsMap?.[t.id]?.name || t.id}</span>
                  </div>
                  {t.note && <p style={{ margin: '4px 0 8px', fontSize: 12, color: 'var(--sap-grey6)' }}>{renderInlineMarkdown(t.note)}</p>}
                  <a href={`#${t.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, color: 'var(--sap-blue7, #0070F2)', textDecoration: 'none' }}>
                    Go to tool <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  </a>
                </div>
              ))}
          </div>

          {node.followon && (() => {
            const ftools = (node.followon.tools || []).filter(t => !t.section || t.section === 'jvm-tools').filter(t => toolIds.includes(t.id));
            if (!ftools.length) return null;
            return (
              <div className="jvm-pf-followon">
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sap-blue8, #0057D2)', marginBottom: 10 }}>{node.followon.heading}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ftools.map((t, i) => (
                    <a key={i} href={`#${t.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--sap-blue7, #0070F2)' }}>
                        {toolsMap?.[t.id]?.name || t.id} <ExtIcon size={12} />
                      </div>
                      {t.note && <div style={{ fontSize: 12, color: 'var(--sap-grey6)', marginTop: 2 }}>{renderInlineMarkdown(t.note)}</div>}
                    </a>
                  ))}
                </div>
              </div>            );
          })()}

          {(node.related || []).map((rel, ri) => {
            const rtools = (rel.tools || []).filter(t => !t.section || t.section === 'jvm-tools').filter(t => toolIds.includes(t.id));
            if (!rtools.length) return null;
            return (
              <div key={ri} className="jvm-pf-related">
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--jvm-color-amber-heading, #92400E)', marginBottom: 10 }}>{rel.label}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {rtools.map((t, i) => (
                    <a key={i} href={`#${t.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--jvm-color-amber-link, #B45309)' }}>
                        {toolsMap?.[t.id]?.name || t.id} <ExtIcon size={12} />
                      </div>
                      {t.note && <div style={{ fontSize: 12, color: 'var(--sap-grey6)', marginTop: 2 }}>{renderInlineMarkdown(t.note)}</div>}
                    </a>
                  ))}
                </div>
              </div>            );
          })}

          <button onClick={doReset} style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--sap-grey5)', padding: 0, fontFamily: 'var(--sap-font-family)' }}
            onMouseEnter={e => e.target.style.color='var(--sap-blue7, #0070F2)'} onMouseLeave={e => e.target.style.color='var(--sap-grey5)'}>
            ← Start over
          </button>
        </>
      )}
      </div>
    </div>
  );
}

// ─── Tool card (grid) ─────────────────────────────────────────────────────────

function ToolCard({ tool, version, date }) {
  const isReleased = version && !['unreleased', 'latest', 'snapshot'].includes(version);
  const ghLink = tool.github_pages || tool.github_url;

  let verUrl = tool.github_url ? `${tool.github_url}/releases/tag/${version}` : null;
  if (tool.maven_coordinates) {
    const [g, a] = tool.maven_coordinates.split(':');
    verUrl = `https://central.sonatype.com/artifact/${g}/${a}/${version}`;
  } else if (tool.cargo_crate) {
    verUrl = `https://crates.io/crates/${tool.cargo_crate}/${version}`;
  }

  return (
    <div className="jvm-tool-card">
      {/* Header row: title (stretched link to detail section) + ext link */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
        <a href={`#${tool.id}`}
           className="jvm-card-title-link" aria-label={`Details for ${tool.name || tool.id}`}>
          {tool.name || tool.id}
        </a>
        <a href={ghLink} target="_blank" rel="noopener"
           title={tool.github_pages ? (tool.links?.[0]?.label ? tool.links[0].label.replace(/\s*[↗🔗]$/, '') : tool.github_pages.includes('/download') ? 'Download' : tool.github_pages.includes('/docs') ? 'Docs' : tool.github_pages.includes('github.io') ? 'Website' : 'Web app') : 'GitHub'}
           className="jvm-card-ext-link" style={{ position: 'relative', zIndex: 1 }}>
          <ExtIcon size={15} />
        </a>
      </div>

      {/* Badge row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Badge tag={tool.tag} />
        {isReleased && !tool.no_release && (
          <a href={verUrl} target="_blank" rel="noopener" className="jvm-card-version">
            v{version}{date && <> · {date}</>}
          </a>
        )}
        {!isReleased && tool.static_version && !tool.no_release && (
          <span className="jvm-card-version">{tool.static_version}</span>
        )}
      </div>

      {/* Tagline */}
      <p style={{ fontSize: 13, color: 'var(--sap-grey7, #475E75)', lineHeight: 1.6, margin: 0, flex: 1 }}>
        {tool.tagline_short || tool.tagline?.split('.')[0]}
      </p>

      {/* Bottom: › arrow matching doc card style */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="var(--sap-blue7, #0070F2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

// ─── Tool detail section ──────────────────────────────────────────────────────

function ToolDetail({ tool, version, date, changelog, allIds, firstInGroup }) {
  const [changelogOpen, setChangelogOpen] = useState(false);
  const isReleased = version && !['unreleased', 'latest', 'snapshot'].includes(version);
  const ghBase = tool.github_url || null;

  let verUrl = ghBase ? `${ghBase}/releases/tag/${version}` : null;
  if (tool.maven_coordinates) {
    const [g, a] = tool.maven_coordinates.split(':');
    verUrl = `https://central.sonatype.com/artifact/${g}/${a}/${version}`;
  } else if (tool.cargo_crate) {
    verUrl = `https://crates.io/crates/${tool.cargo_crate}/${version}`;
  }

  const linkStyle = { fontSize: 13, color: 'var(--sap-blue7, #0070F2)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, transition: 'color 0.1s' };
  const linkHover = (e, enter) => e.currentTarget.style.color = enter ? 'var(--sap-blue9, #0040B0)' : 'var(--sap-blue7, #0070F2)';

  return (
    <section id={tool.id} className="jvm-detail-section" style={firstInGroup ? { borderTop: 'none', marginTop: 12, paddingTop: 16 } : {}}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 12px', marginBottom: 4 }}>
        <h2 className="jvm-tool-heading">{tool.name || tool.id}</h2>
        <Badge tag={tool.tag} />
        {isReleased && !tool.no_release && <>
          <a href={verUrl} target="_blank" rel="noopener"
             style={{ fontFamily: 'var(--ifm-font-family-monospace)', fontSize: 13, color: 'var(--sap-grey6)', textDecoration: 'none', transition: 'color 0.1s' }}
             onMouseEnter={e => e.target.style.color='var(--sap-blue7, #0070F2)'} onMouseLeave={e => e.target.style.color='var(--sap-grey6)'}>
            v{version}
          </a>
          {date && <span style={{ fontSize: 13, color: 'var(--sap-grey4)' }}>· {date}</span>}
        </>}
        {tool.github_pages && (
          <a href={tool.github_pages} target="_blank" rel="noopener" style={linkStyle}
             onMouseEnter={e => linkHover(e, true)} onMouseLeave={e => linkHover(e, false)}>
            {tool.links?.[0]?.label
              ? tool.links[0].label.replace(/\s*[↗🔗]$/, '')
              : tool.github_pages.includes('/download') ? 'Download'
              : tool.github_pages.includes('/docs') ? 'Docs'
              : tool.github_pages.includes('github.io') ? 'Website'
              : 'Web app'} <ExtIcon />
          </a>
        )}
        <a href={ghBase} target="_blank" rel="noopener" style={{ ...linkStyle, marginLeft: 'auto' }}
           onMouseEnter={e => linkHover(e, true)} onMouseLeave={e => linkHover(e, false)}>
          GitHub <ExtIcon />
        </a>
      </div>

      <p style={{ fontSize: 15, color: 'var(--sap-grey7, #475E75)', lineHeight: 1.7, marginBottom: 20 }}>{tool.tagline}</p>

      {/* Features */}
      {tool.features && !tool.when_to_use && (
        <div style={{ background: 'var(--sap-grey1, #F5F6F7)', borderRadius: 8, padding: '14px 16px', border: '1px solid var(--sap-grey2, #EAECEE)', marginBottom: 20 }}>
          <p className="jvm-section-label">Features</p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {tool.features.map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--sap-grey9)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--sap-blue7, #0070F2)', flexShrink: 0 }}>
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* When to use / not */}
      {tool.when_to_use && (
        <div className="jvm-wtu-grid" style={{ display: 'grid', gridTemplateColumns: tool.when_not_to_use ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: 14, marginBottom: 20 }}>
          <div className="jvm-wtu">
            <p className="jvm-section-label" style={{ color: 'var(--jvm-color-green-text, #065F46)' }}>When to use</p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {tool.when_to_use.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--sap-grey9)', lineHeight: 1.5, paddingTop: 2 }}>
                  <span style={{ color: 'var(--jvm-color-green-icon, #16A34A)', flexShrink: 0, marginTop: 1 }}>✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
          {tool.when_not_to_use && (
            <div className="jvm-wnu">
              <p className="jvm-section-label" style={{ color: 'var(--jvm-color-red-text, #9F1239)' }}>When not to use</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {tool.when_not_to_use.map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--sap-grey9)', lineHeight: 1.5, paddingTop: 2 }}>
                    <span style={{ color: 'var(--jvm-color-red-icon, #E11D48)', flexShrink: 0, marginTop: 1 }}>✗</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Comparison table */}
      {tool.vs && (
        <div style={{ marginBottom: 20 }}>
          <p className="jvm-section-label">
            vs <a href={tool.vs.url} target="_blank" rel="noopener"
                  style={{ color: 'var(--sap-blue7, #0070F2)', textTransform: 'none', fontWeight: 600, fontSize: 12, textDecoration: 'none' }}>
              {tool.vs.name} <ExtIcon size={11} />
            </a>
          </p>
          <div className="jvm-vs-table">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="highlight">{tool.name || tool.id}</th>
                  <th>{tool.vs.name}</th>
                </tr>
              </thead>
              <tbody>
                {(tool.vs.comparison || []).map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500, color: 'var(--sap-grey6)' }}>{row.feature}</td>
                    <td className="highlight">{row.femto || row[Object.keys(row).find(k => k !== 'feature' && k !== 'other')] || '—'}</td>
                    <td>{row.other || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tool.vs.bottom_line && <p style={{ fontSize: 12, color: 'var(--sap-grey6)', fontStyle: 'italic', marginTop: 6 }}>{tool.vs.bottom_line}</p>}
        </div>
      )}

      {/* Related */}
      {tool.related?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p className="jvm-section-label">Related</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {tool.related.map((r, i) => {
              const relId = r.label.toLowerCase().replace(/\s*[↗🔗]$/, '').replace(/\s+/g, '-');
              const isLocal = allIds.includes(relId);
              return (
                <a key={i} className="jvm-related-pill"
                   href={isLocal ? `#${relId}` : r.url}
                   {...(!isLocal ? { target: '_blank', rel: 'noopener' } : {})}>
                  {r.label}{!isLocal && <ExtIcon size={11} />}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Install */}
      {tool.install && (
        <div style={{ marginBottom: 20 }}>
          <p className="jvm-section-label">Install</p>
          <CodeTabs tabs={tool.install} version={isReleased ? version : undefined} />
        </div>
      )}

      {/* Usage */}
      {tool.usage && (
        <div style={{ marginBottom: 20 }}>
          <p className="jvm-section-label">Usage</p>
          <CodeTabs tabs={tool.usage} />
        </div>
      )}

      {/* How-to guides — accordion */}
      {tool.how_to?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 10px', marginBottom: 10 }}>
            <p className="jvm-section-label" style={{ margin: 0 }}>How-to</p>
            <span style={{ fontSize: 11, color: 'var(--sap-grey4, #A9B4BE)' }}>
              These examples may be incomplete or outdated — see the{' '}
              <a href={tool.github_pages || ghBase} target="_blank" rel="noopener"
                 style={{ color: 'var(--sap-blue7, #0070F2)', textDecoration: 'none' }}>
                README / docs
              </a>{' '}for the full reference.
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tool.how_to.map((guide, i) => (
              <details key={i} className="jvm-howto-item">
                <summary className="jvm-howto-summary">
                  <ChevronRight size={13} className="jvm-howto-chevron" />
                  {guide.title}
                </summary>
                <div className="jvm-howto-body">
                  <HowToBody text={guide.body} />
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Changelog */}
      {changelog && (
        <details style={{ marginTop: 12 }} onToggle={e => setChangelogOpen(e.target.open)}>
          <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--sap-grey6)', listStyle: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, userSelect: 'none' }}>
            <ChevronRight size={12} style={{ transform: changelogOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
            Latest release notes
          </summary>
          <div style={{ marginTop: 10, background: 'var(--sap-grey1)', borderRadius: 8, border: '1px solid var(--sap-grey2)', padding: '12px 16px' }}>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {changelog.split(' · ').filter(Boolean).map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--sap-grey7)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--sap-blue4, #89D1FF)', flexShrink: 0, marginTop: 2 }}>
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                  </span>
                  <span>{renderInlineMarkdown(item.trim())}</span>
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}

      {/* Note */}
      {tool.note && <p className="jvm-note">{renderInlineMarkdown(tool.note)}</p>}

      {/* Links */}
      {tool.links?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 4, marginBottom: 8 }}>
          {tool.links.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noopener"
               style={linkStyle}
               onMouseEnter={e => linkHover(e, true)} onMouseLeave={e => linkHover(e, false)}>
              {l.label.replace(/\s*[↗🔗]$/, '')} <ExtIcon />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function JvmToolsPage() {
  const [tools, setTools] = useState([]);
  const [releases, setReleases] = useState({});
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navRef = useRef(null);
  const searchRef = useRef(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions]     = useState([]);
  const [showSugg, setShowSugg]           = useState(false);
  const [searchResults, setSearchResults] = useState(null); // null = inactive
  const [activeGroup, setActiveGroup]     = useState(null); // null = all groups
  const debounceRef = useRef(null);
  const suppressSuggRef = useRef(false);

  const toolsUrl       = useBaseUrl('assets/data/jvm-tools.json');
  const releasesUrl    = useBaseUrl('assets/data/jvm-tools-releases.json');
  const treeUrl        = useBaseUrl('assets/data/jvm-tools-tree.json');
  const searchIndexUrl = useBaseUrl('assets/data/search-index.json');
  const searchDocsUrl  = useBaseUrl('assets/data/search-index-docs.json');
  const autocompleteUrl = useBaseUrl('assets/data/autocomplete.json');
  initSearchUrls(searchIndexUrl, autocompleteUrl, searchDocsUrl);

  useEffect(() => {
    Promise.all([
      fetch(toolsUrl).then(r => r.json()),
      fetch(releasesUrl).then(r => r.json()).catch(() => ({})),
      fetch(treeUrl).then(r => r.json()).catch(() => null),
    ]).then(([t, r, tr]) => { setTools(t); setReleases(r); setTree(tr); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [toolsUrl, releasesUrl, treeUrl]);

  // Removed IntersectionObserver for nav highlighting — tabs now filter cards directly

  // Scroll listener: add .stuck to nav when it has reached the top navbar
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => {
      const siteNavbar = document.querySelector('.navbar');
      const navbarBottom = siteNavbar ? siteNavbar.getBoundingClientRect().bottom : 56;
      nav.classList.toggle('stuck', nav.getBoundingClientRect().top <= navbarBottom + 1);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close suggestions dropdown on scroll
  useEffect(() => {
    const onScroll = () => setShowSugg(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let lastShift = 0;
    const onKeyDown = (e) => {
      if (e.key !== 'Shift') { lastShift = 0; return; }
      const now = Date.now();
      if (now - lastShift < 500) {
        searchRef.current?.focus();
        searchRef.current?.select();
        lastShift = 0;
      } else {
        lastShift = now;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleQuery = (val) => {
    setQuery(val);
    setShowSugg(false);
    if (val) setActiveGroup(null); // searching overrides group filter
    clearTimeout(debounceRef.current);
    if (!val) { setSuggestions([]); setSearchResults(null); return; }
    debounceRef.current = setTimeout(() => {
      Promise.all([
        hybridSearch(val).catch(() => []),
        semanticAutocomplete(val).catch(() => []),
      ]).then(async ([results, sugg]) => {
        setSearchResults(results);
        const seenIdSets = new Set([results.map(r => r.id).join(',')]);
        const suggResults = await Promise.all(sugg.map(s => hybridSearch(s).catch(() => [])));
        const filteredSugg = sugg.filter((s, i) => {
          const key = suggResults[i].map(r => r.id).join(',');
          if (seenIdSets.has(key)) return false;
          seenIdSets.add(key);
          return true;
        });
        setSuggestions(filteredSugg);
        if (!suppressSuggRef.current) setShowSugg(filteredSugg.length > 0);
        suppressSuggRef.current = false;
      });
    }, 200);
  };

  const getRelease = (id) => releases?.entries?.[id] || releases?.[id] || {};

  // Group tools — collect all tools per group, preserving first-seen order of groups
  const groupMap = new Map();
  for (const tool of tools) {
    const g = tool.group || '';
    if (!groupMap.has(g)) groupMap.set(g, []);
    groupMap.get(g).push(tool);
  }
  const allGroups = [...groupMap.entries()].map(([name, items]) => ({ name, items }));
  const groupSlug = (name) => name ? 'group-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';

  let groups;
  if (searchResults !== null) {
    const orderedTools = searchResults
      .map(r => tools.find(t => t.id === r.id))
      .filter(Boolean);
    groups = orderedTools.length > 0 ? [{ name: null, items: orderedTools }] : [];
  } else if (query) {
    groups = allGroups
      .map(g => ({ ...g, items: g.items.filter(t => matchesTool(t, query)) }))
      .filter(g => g.items.length > 0);
  } else {
    groups = allGroups;
  }

  const allIds = tools.map(t => t.id);
  const toolsMap = Object.fromEntries(tools.map(t => [t.id, t]));

  const description = "Tools for diagnosing JVM issues with flame graphs, heap dumps, JFR, thread analysis, and memory tracing."

  const defaultHeaderImage = useBaseUrl('/img/logos/logo-bubble.png');
  const christmasHeaderImage = useBaseUrl('/img/logos/logo-xmas-bibble.png');

  // automatically changes the header image to the x-mas one once it hits december
  const headerImage = new Date().getMonth() === 11 ? christmasHeaderImage : defaultHeaderImage;

  return (
    <Layout title="Diagnostics" description={description}>
      <Head>
        <meta property="og:title" content="Diagnostics | SapMachine" />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sapmachine.io/diagnostic-tools" />
        <meta property="og:image" content="https://sapmachine.io/img/og-diagnostic-tools.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Diagnostics | SapMachine" />
        <meta name="twitter:description" content="Diagnose JVM issues in production — flame graphs, heap dumps, JFR recordings, thread analysis, memory leak detection, and native memory tracing. Open-source tools by the SapMachine team." />
        <meta name="twitter:image" content="https://sapmachine.io/img/og-diagnostic-tools.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "SapMachine", "item": "https://sapmachine.io" },
            { "@type": "ListItem", "position": 2, "name": "Diagnostics", "item": "https://sapmachine.io/diagnostic-tools" },
          ],
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Diagnostics",
          "description": description,
          "url": "https://sapmachine.io/diagnostic-tools",
          "publisher": { "@type": "Organization", "name": "SapMachine", "url": "https://sapmachine.io" },
          "itemListElement": tools.map((t, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": t.name || t.id,
            "url": t.github_pages || t.github_url || '',
            "description": t.tagline_short || t.tagline || '',
          })),
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            { "@type": "Question", "name": "Which tool should I use to profile CPU usage in a running JVM application?", "acceptedAnswer": { "@type": "Answer", "text": "Use async-profiler for low-overhead CPU and allocation flame graphs, or jstall for instant one-shot profiling without an agent. jmc (JDK Mission Control) provides a full GUI for JFR-based CPU analysis." } },
            { "@type": "Question", "name": "How do I analyze a heap dump?", "acceptedAnswer": { "@type": "Answer", "text": "Use mat (Eclipse Memory Analyzer Tool) for comprehensive OOM analysis, dominator tree, and OQL queries. heap-dump-extras provides extra flags for capturing heap dumps with compression and size limits in SapMachine." } },
            { "@type": "Question", "name": "How do I record and analyze JFR data?", "acceptedAnswer": { "@type": "Answer", "text": "Use the jfr command-line tool (built into every JDK 14+) to print and inspect JFR recording files. jmc (JDK Mission Control) provides a full GUI. jmc-agent lets you add custom JFR events via XML config without code changes." } },
            { "@type": "Question", "name": "How do I find memory leaks in a JVM application?", "acceptedAnswer": { "@type": "Answer", "text": "Use async-profiler with allocation profiling to find allocation hot spots. For native memory leaks, use malloc-trace (SapMachine) to track native malloc/calloc calls by call stack. sapmachine-vitals provides continuous memory watermark reports." } },
            { "@type": "Question", "name": "How do I get a thread dump or list running JVMs?", "acceptedAnswer": { "@type": "Answer", "text": "Use jps to list running JVM processes and find their PIDs. Use jcmd to trigger thread dumps, heap dumps, JFR recordings, and NMT reports. jthreaddump parses jstack/jcmd output into a structured model." } },
            { "@type": "Question", "name": "What diagnostic tools work with SapMachine specifically?", "acceptedAnswer": { "@type": "Answer", "text": "SapMachine-specific tools include sapmachine-vitals (continuous JVM health metrics), malloc-trace (native memory leak detection), heap-dump-extras (compressed heap dumps and size limits), and high-memory-reports (automatic memory watermark reports)." } },
          ],
        })}</script>
      </Head>
      {/* Hero banner — uses site hero-header class for consistent styling */}
      <div className="hero-header">
        <div className="grid-container">
          <div className="grid-row" style={{ alignItems: 'center' }}>
            <div className="grid-col grid-col-8">
              <h1 className="hero-heading" style={{ color: 'var(--sap-white)', margin: '0 0 24px 0' }}>Diagnostics</h1>
              <p className="hero-paragraph" style={{ color: 'var(--sap-white)', maxWidth: '800px', margin: 0 }}>
                Tools for diagnosing JVM issues.
              </p>
            </div>
            <div className="grid-col grid-col-4" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <img
                src={headerImage}
                alt="SapMachine bubble logo"
                className="hero-header-logo"
                style={{ maxHeight: '120px', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      </div>
      <main id="main-content" className="grid-container jvm-tools-page">

        {loading && <p style={{ color: 'var(--sap-grey5)', fontSize: 14 }}>Loading…</p>}
        {error && (
          <div style={{ color: 'var(--jvm-color-red-error-text, #9B1C1C)', background: 'var(--jvm-color-red-bg, #FFF1F2)', border: '1px solid var(--jvm-color-red-error-border, #FCA5A5)', borderRadius: 8, padding: '12px 16px', fontSize: 14 }}>
            Failed to load tool data: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Unified problem finder + search */}
            <ProblemFinder
              tree={tree}
              toolIds={allIds}
              toolsMap={toolsMap}
              query={query}
              onQueryChange={handleQuery}
              suggestions={suggestions}
              showSugg={showSugg}
              onSuggSelect={(s) => { suppressSuggRef.current = true; handleQuery(s); setShowSugg(false); }}
              onSuggFocus={() => suggestions.length > 0 && setShowSugg(true)}
              onSuggBlur={() => setTimeout(() => setShowSugg(false), 150)}
              onSuggHide={() => { suppressSuggRef.current = true; setShowSugg(false); }}
              searchRef={searchRef}
            />

            {/* Sentinel: when this exits the viewport the nav has become sticky */}
            <div className="jvm-tool-nav-sentinel" />

            {/* Sticky group nav — scrolls to section */}
            <div className="jvm-tool-nav" ref={navRef}>
              <div className="jvm-tool-nav-inner">
                <button
                  className={`jvm-tool-nav-group-link${!activeGroup && !searchResults ? ' active' : ''}`}
                  onClick={() => { setActiveGroup(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  Overview
                </button>
                {allGroups.filter(g => g.name).map(({ name, items }) => (
                  <button key={name}
                     className={`jvm-tool-nav-group-link${activeGroup === name ? ' active' : ''}`}
                     onClick={() => {
                       setActiveGroup(name);
                       handleQuery('');
                       const el = document.getElementById(groupSlug(name));
                       if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                     }}>
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Card grid — always shows all groups */}
            <div key={searchResults !== null ? 'search' : 'all'} className="jvm-card-grid-outer">
              {groups.map(({ name, items }) => {
                const isSingle = items.length === 1;
                return (
                  <div key={name || '__'} style={{ gridColumn: isSingle ? 'span 1' : '1 / -1' }}>
                    {name && (
                      <p style={{
                        fontSize: 11, fontWeight: 700, color: 'var(--sap-grey4, #A9B4BE)',
                        textTransform: 'uppercase', letterSpacing: '0.12em',
                        margin: '4px 0 12px',
                      }}>
                        {name}
                      </p>
                    )}
                    <div className={isSingle ? 'jvm-card-grid-inner-single' : 'jvm-card-grid-inner'}>
                      {items.map(tool => {
                        const rel = getRelease(tool.id);
                        return <ToolCard key={tool.id} tool={tool} version={rel.version || tool.static_version} date={rel.date} />;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail sections — always show all tools (or search-filtered), regardless of activeGroup */}
            {(() => {
              const seenGroups = new Set();
              const detailTools = searchResults !== null
                ? searchResults.map(r => tools.find(t => t.id === r.id)).filter(Boolean)
                : tools;
              return detailTools.map(tool => {
                const rel = getRelease(tool.id);
                const showGroup = searchResults === null && tool.group && !seenGroups.has(tool.group);
                if (tool.group) seenGroups.add(tool.group);
                return (
                  <React.Fragment key={tool.id}>
                    {showGroup && (
                      <div id={groupSlug(tool.group)} style={{ marginTop: 64, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--sap-grey2, #EAECEE)', scrollMarginTop: 'calc(var(--ifm-navbar-height, 3.5rem) + 45px + 12px)' }}>
                        <h2 className="jvm-group-heading" style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--sap-grey5, #8396A8)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {tool.group}
                        </h2>
                      </div>
                    )}
                    <ToolDetail tool={tool} version={rel.version || tool.static_version} date={rel.date} changelog={rel.changelog} allIds={allIds} firstInGroup={showGroup} />
                  </React.Fragment>
                );
              });
            })()}
          </>
        )}
      </main>
      <BackToTop />
    </Layout>
  );
}
