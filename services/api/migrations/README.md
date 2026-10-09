# Database migrations

Apply migrations from `services/api` with:

```bash
.venv/bin/alembic upgrade head
```

`DATABASE_URL` overrides the placeholder URL in `alembic.ini`. Published
production credentials must be supplied only through the runtime environment.
