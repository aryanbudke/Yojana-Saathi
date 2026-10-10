"""Read-only audit of current main; does not implement or change backend routes."""
import ast
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

web = Path(__file__).resolve().parents[1]
repo = web.parents[1]

def git(*args: str) -> str:
    return subprocess.check_output(['git', *args], cwd=repo, text=True).strip()

paths = git('ls-tree', '-r', '--name-only', 'origin/main', 'services/api/app/api', 'services/api/app/modules/ai/routes.py').splitlines()
routes = []
for path in paths:
    if not path.endswith('.py'):
        continue
    tree = ast.parse(git('show', f'origin/main:{path}'))
    prefix = ''
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'APIRouter':
            prefix = next((keyword.value.value for keyword in node.keywords if keyword.arg == 'prefix' and isinstance(keyword.value, ast.Constant)), '')
    for node in ast.walk(tree):
        if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        for decorator in node.decorator_list:
            if isinstance(decorator, ast.Call) and isinstance(decorator.func, ast.Attribute) and decorator.func.attr in {'get', 'post', 'delete', 'patch', 'put'} and decorator.args and isinstance(decorator.args[0], ast.Constant):
                routes.append(f'{decorator.func.attr.upper()} {prefix}{decorator.args[0].value}')

required = ['POST /api/v1/profiles/extract', 'POST /api/v1/matches', 'POST /api/v1/questions/next', 'POST /api/v1/profiles/answers', 'POST /api/v1/profiles/sessions', 'GET /api/v1/schemes', 'GET /api/v1/schemes/{scheme_id}', 'GET /api/v1/guidance/{scheme_id}']
report = {'checked_at_utc': datetime.now(timezone.utc).isoformat(), 'backend_main_commit': git('rev-parse', 'origin/main'), 'inspection': 'Static route audit only; not live integration', 'available_routes': sorted(routes), 'missing_core_routes': [route for route in required if route not in routes], 'live_api_url_provided': False, 'live_smoke_test_passed': False}
output = web / 'artifacts' / 'backend-readiness.json'
output.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
