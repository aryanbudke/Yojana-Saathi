"""Citizen matching routes must not import retrieval or embedding code."""

import inspect

from app.modules.matching import routes


def test_matching_router_has_no_rag_dependency() -> None:
    source = inspect.getsource(routes)

    assert "from app.modules.ai.staging_search" not in source
    assert "from app.modules.ai.embeddings" not in source
    assert "from pgvector" not in source
