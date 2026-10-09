"""Database engine and unit-of-work session construction."""

from collections.abc import Iterator

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings, get_settings


def create_database_engine(settings: Settings | None = None) -> Engine:
    """Create a pooled synchronous SQLAlchemy engine."""

    runtime_settings = settings or get_settings()
    return create_engine(runtime_settings.database_url, pool_pre_ping=True)


def create_session_factory(engine: Engine) -> sessionmaker[Session]:
    """Create sessions that retain loaded values after transaction commits."""

    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def session_dependency(factory: sessionmaker[Session]) -> Iterator[Session]:
    """Yield a request-scoped session and always release its connection."""

    with factory() as session:
        yield session
