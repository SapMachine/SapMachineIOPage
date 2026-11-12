/**
 * Custom Prism language: 'shell-smart'
 *
 * Positional bash tokenizer. The first word on each line becomes 'command'
 * via post-processing in CodeBlock (see jvm-tools.js applyShellSmartCommands).
 * This grammar identifies everything EXCEPT commands — flags, strings, variables,
 * urls, numbers, operators, placeholders. Anything else is plain.
 *
 *   flag        — -flag, --flag, -XX:+..., -jar  (starts with -)
 *   variable    — $VAR, ${VAR}
 *   string      — "..." or '...'
 *   comment     — # to end of line
 *   placeholder — <pid>, <app-name>
 *   number      — 60, 8g, 90%
 *   url         — https://...
 *   operator    — &&, ||, |, ;, \, >, >>
 *   plain       — everything else (will be upgraded to 'command' by post-processing)
 */

const shellSmartLanguage = {
  // 1. Comments
  comment: {
    pattern: /#.*/,
    greedy: true,
  },

  // 2. Strings
  string: {
    pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/,
    greedy: true,
  },

  // 3. Variables
  variable: [
    { pattern: /\$\{[^}]+\}/, greedy: true },
    { pattern: /\$[A-Za-z_]\w*/ },
  ],

  // 4. URLs — before flags so https:// isn't split by -
  url: {
    pattern: /https?:\/\/\S+/,
    greedy: true,
  },

  // 5. Flags — starts with - followed by a letter (avoids -Community, -name> etc.)
  flag: {
    pattern: /--?[A-Za-z][^\s]*/,
  },

  // 6. Angle-bracket placeholders like <pid>
  placeholder: {
    pattern: /<[A-Za-z][\w. -]*>/,
  },

  // 7. Numbers with optional unit suffix
  number: {
    pattern: /\b\d+(?:\.\d+)?[smgkMGKbB%]?\b/,
  },

  // 8. Operators
  operator: {
    pattern: /&&|\|\||[|;&\\]|>>?/,
  },

  // 9. key=value pairs: treat the key as plain, = as operator, value as plain
  //    (jcmd args like filename=/tmp/foo.jfr, duration=60s, settings=profile)
  //    No special token needed — they fall through to plain naturally.
};

export default shellSmartLanguage;
