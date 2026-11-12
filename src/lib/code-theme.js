/**
 * Custom Prism theme — used on both the JVM Tools page
 * (via prism-react-renderer <Highlight> with shell-smart language) and
 * Docusaurus doc pages (via prism.theme, which still uses bash grammar).
 *
 * For the JVM Tools page, shell-smart provides clean structural tokens:
 *   command     #DCDCAA  yellow       — first word on line: cf, java, jcmd, curl
 *   flag        #C586C0  purple       — -d, --output, -XX:+HiMemReport, -jar
 *   variable    #C586C0  purple       — $PID, $JAVA_HOME (same as flags)
 *   placeholder #569CD6  blue         — <pid>, <app-name>
 *   url         #8396A8  grey         — https://... (de-emphasised, not noise)
 *   string      #CE9178  warm orange  — "quoted"
 *   comment     #6A9955  green italic — # inline comments
 *   number      #B5CEA8  sage         — 60, 8g, 90%
 *   operator    #D4D4D4  near-white   — &&, |, \, > (reduce noise)
 *   plain       #D4D4D4  near-white   — subcommands, paths, filenames, app names
 *
 * For Docusaurus doc pages (bash grammar, inline styles from prism-react-renderer):
 *   function    #DCDCAA  yellow       — known commands (curl, wget, sudo, etc.)
 *   variable    #C586C0  purple       — flags + $VAR (variable wins in merge, so purple)
 *   parameter   #C586C0  purple       — flags (same)
 */
const codeTheme = {
  plain: { color: '#D4D4D4', backgroundColor: '#1E1E1E' },
  styles: [
    { types: ['comment'],                     style: { color: '#6A9955', fontStyle: 'italic' } },
    { types: ['string', 'attr-value'],        style: { color: '#CE9178' } },
    { types: ['keyword', 'interpolation-punctuation'], style: { color: '#569CD6' } },
    // shell-smart: 'command' token = first word on line
    { types: ['function', 'command'],         style: { color: '#DCDCAA' } },
    { types: ['class-name'],                  style: { color: '#4EC9B0' } },
    { types: ['number'],                      style: { color: '#B5CEA8' } },
    // shell-smart: 'flag' and 'variable' both purple
    { types: ['variable', 'parameter', 'flag'], style: { color: '#C586C0' } },
    // shell-smart: '<pid>' style placeholders
    { types: ['placeholder'],                 style: { color: '#569CD6' } },
    // shell-smart: URLs are de-emphasised (grey, not highlighted)
    { types: ['url'],                         style: { color: '#8396A8' } },
    { types: ['operator', 'punctuation'],     style: { color: '#FFFFFF' } },
    { types: ['tag'],                         style: { color: '#569CD6' } },
    { types: ['attr-name'],                   style: { color: '#9CDCFE' } },
    { types: ['prolog', 'doctype'],           style: { color: '#808080' } },
    { types: ['builtin'],                     style: { color: '#4EC9B0' } },
    { types: ['boolean'],                     style: { color: '#569CD6' } },
    { types: ['constant', 'environment'],     style: { color: '#9CDCFE' } },
    { types: ['important', 'shebang'],        style: { color: '#569CD6', fontWeight: 'bold' } },
  ],
};

export default codeTheme;
