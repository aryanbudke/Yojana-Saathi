# Local website RAG test

Open http://localhost:3000/rag. The home page includes an Open RAG test link.

Paste ADMIN_REVIEW_TOKEN from the private backend configuration at
`/Users/srujanmirji/yojana-saathi/workspaces/rag-workbench/services/api/.env`
into the password field, then ask the prefilled Atal Pension Yojana question.
Do not send the token through chat. Clear token and answer removes it from tab
memory; refresh also clears it. The token is never in frontend environment,
browser storage, URLs or logs. The normal backend reviewer header is required.

The local sample contains eight actual but unverified records (seed support,
cultural infrastructure, export infrastructure, tea/rubber support, Atal Pension,
Jan Dhan, handloom loans, and backward-class scholarships). Citations open the
exact retrieved draft records. This is not official eligibility guidance or the
full3397-record index. Public discovery has no published schemes in this demo.

The page and its navigation link exist only in development with
RAG_DEMO_ENABLED=1. Gemini keys/database credentials remain in the backend only.
The API uses a disposable, isolated PostgreSQL schema and binds127.0.0.1:8000.
Normal backend shutdown removes that schema. Gemini quotas can cause a temporary
unavailable message; no invented answer or mock fallback is used.

Restart the existing backend from its configured working directory:

```sh
cd /Users/srujanmirji/yojana-saathi/workspaces/rag-workbench/services/api
PYTHONPATH=. /Users/srujanmirji/yojana-saathi/workspaces/upstream/services/api/.venv/bin/python scripts/serve_local_rag_demo.py
```

Start the website in another terminal:

```sh
cd /Users/srujanmirji/yojana-saathi/workspaces/local-rag-demo/apps/web
npm run dev -- --webpack --hostname 127.0.0.1
```

Its ignored .env.local sets NEXT_PUBLIC_API_BASE_URL=http://localhost:8000,
NEXT_PUBLIC_API_MODE=live and RAG_DEMO_ENABLED=1. No secrets belong in that file.
