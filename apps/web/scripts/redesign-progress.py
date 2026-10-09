from pathlib import Path
import sys
n, title, checks, files, problems = sys.argv[1:]
p = Path('PROGRESS.md')
s = p.read_text()
import re
s = re.sub(rf'(\| UI-0{n} \|[^\n]+\| )[^|]+(\|)', r'\1COMPLETED \2', s)
if n != '7':
    s = re.sub(rf'(\| UI-0{int(n)+1} \|[^\n]+\| )[^|]+(\|)', r'\1IN PROGRESS \2', s)
s += f'\n## UI-0{n} — {title}\n\n- Status: COMPLETED\n- Files: {files}\n- Tests/verification: {checks}\n- Problems/dependencies: {problems}\n- Commit reference: resolve with `git log --oneline --grep="UI-0{n}"`.\n- Next task: ' + (f'UI-0{int(n)+1}' if n != '7' else 'Redesign complete; existing live API gate remains separate.') + '\n'
p.write_text(s)
