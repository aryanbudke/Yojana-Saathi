from pathlib import Path
import sys

n, title, checks, files, problems = sys.argv[1:]
p = Path('PROGRESS.md')
s = p.read_text()

def status(task, value):
    global s
    rows = []
    for row in s.splitlines():
        cells = row.split('|')
        if len(cells) == 5 and cells[1].strip() == task:
            cells[3] = f' {value} '
            row = '|'.join(cells)
        rows.append(row)
    s = '\n'.join(rows) + '\n'

status(f'UI-0{n}', 'COMPLETED')
if n != '7':
    status(f'UI-0{int(n)+1}', 'IN PROGRESS')
next_task = f'UI-0{int(n)+1}' if n != '7' else 'Redesign complete; existing live API gate remains separate.'
s += f'\n## UI-0{n} — {title}\n\n- Status: COMPLETED\n- Files: {files}\n- Tests/verification: {checks}\n- Problems/dependencies: {problems}\n- Commit reference: resolve with `git log --oneline --grep="UI-0{n}"`.\n- Next task: {next_task}\n'
p.write_text(s)
