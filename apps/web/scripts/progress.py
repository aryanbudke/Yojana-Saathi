"""Record one verified task; commit identity is resolved after the commit."""
import subprocess
import sys
from pathlib import Path

task_id, title, checks, problems, next_task = sys.argv[1:]
root = Path(__file__).resolve().parents[1]
repo = root.parents[1]
files = subprocess.check_output(['git', 'ls-files', '--modified', '--others', '--exclude-standard', 'apps/web'], cwd=repo, text=True).splitlines()
path = root / 'PROGRESS.md'
rows = path.read_text().splitlines()
for index, line in enumerate(rows):
    cells = [cell.strip() for cell in line.split('|')[1:-1]]
    if len(cells) == 3 and cells[0] == task_id:
        rows[index] = f'| {task_id} | {title} | COMPLETED |'
text = '\n'.join(rows) + '\n'
text += f'\n## {task_id} — {title}\n\n- Status: COMPLETED\n- Files: ' + ', '.join(f'`{p}`' for p in files) + f'\n- Verification: {checks}\n- Problems: {problems}\n- Commit reference: commit containing this entry; resolve with `git log --format="%h %s" --grep="{task_id}"`.\n- Next task: {next_task}\n'
path.write_text(text)
