"""Health and HTTP boundary tests."""

from fastapi.testclient import TestClient


def test_health_returns_public_service_metadata(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "Yojana Saathi API",
        "version": "0.1.0",
        "environment": "test",
    }
    assert response.headers["X-Request-ID"]


def test_request_id_is_echoed(client: TestClient) -> None:
    response = client.get("/health", headers={"X-Request-ID": "test-request-123"})

    assert response.headers["X-Request-ID"] == "test-request-123"


def test_missing_route_uses_standard_error_contract(client: TestClient) -> None:
    response = client.get("/does-not-exist")

    assert response.status_code == 404
    payload = response.json()
    assert payload["error"]["code"] == "NOT_FOUND"
    assert payload["error"]["message"] == "Not Found"
    assert payload["error"]["request_id"] == response.headers["X-Request-ID"]


def test_cors_allows_only_configured_origin(client: TestClient) -> None:
    allowed = client.options(
        "/health",
        headers={
            "Origin": "https://web.example.test",
            "Access-Control-Request-Method": "GET",
        },
    )
    denied = client.options(
        "/health",
        headers={
            "Origin": "https://attacker.example",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert allowed.status_code == 200
    assert allowed.headers["access-control-allow-origin"] == "https://web.example.test"
    assert denied.status_code == 400
    assert "access-control-allow-origin" not in denied.headers
