from pathlib import Path
import sys
n, title, checks, files, problems = sys.argv[1:]
p = Path('PROGRESS.md')
s = p.read_text()
s += f'\n## UI-0{n} — {title}\n\n- Status: COMPLETED\n- Files: {files}\n- Tests/verification: {checks}\n- Problems/dependencies: {problems}\n- Commit reference: resolve with `git log --oneline --grep="UI-0{n}"`.\n- Next task: ' + (f'UI-0{int(n)+1}' if n != '7' else 'Redesign complete; existing live API gate remains separate.') + '\n'
p.write_text(s)
