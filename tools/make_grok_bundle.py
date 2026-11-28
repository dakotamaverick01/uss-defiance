# Builds uss-defiance-for-grok.md: one read-only file with the docs and all source, for outside review.
# usage: python3 tools/make_grok_bundle.py [out]
import subprocess, sys, os
out = sys.argv[1] if len(sys.argv) > 1 else 'uss-defiance-for-grok.md'
branch = subprocess.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], capture_output=True, text=True).stdout.strip()
commit = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
DOCS = ['README.md', 'docs/superpowers/specs/2026-11-22-captain-sim-design.md', 'docs/superpowers/plans/2026-11-22-stage1-ship-state.md', 'docs/interface-style-sheet.md']
FILES = ['index.html'] + ['js/' + f + '.js' for f in ['core', 'decks', 'shipgeo', 'exterior', 'sim', 'surfaces', 'materials', 'bridge', 'space', 'rooms', 'kit', 'deck2', 'lighting', 'bake', 'batch', 'collision', 'screens', 'sound', 'ui', 'lift', 'controls', 'render', 'perf']] + ['tests/sim.test.js']
LANG = {'.js': 'javascript', '.html': 'html', '.md': 'markdown'}
parts = [f'# USS Defiance: one-file bundle for review\n\nBranch `{branch}` at `{commit}`. Read-only copy for review: suggest changes in words; do not edit the repository.\n\nContents: the docs first, then every source file in load order.\n']
for p in DOCS + FILES:
  if not os.path.exists(p): continue
  body = open(p, encoding='utf-8').read()
  parts.append(f'\n---\n\n## `{p}`\n\n' + (body if p.endswith('.md') else f'````{LANG[os.path.splitext(p)[1]]}\n{body}\n````') + '\n')
open(out, 'w', encoding='utf-8').write(''.join(parts)); print('wrote', out, os.path.getsize(out), 'bytes')
