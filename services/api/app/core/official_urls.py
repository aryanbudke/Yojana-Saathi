"""Validation for manually reviewed official external links."""

import ipaddress
from urllib.parse import urlparse


class OfficialUrlValidationError(ValueError):
    """Raised when an external link is unsafe or clearly non-production."""


_RESERVED_HOSTS = {
    "example.com",
    "example.net",
    "example.org",
    "localhost",
}
_RESERVED_SUFFIXES = (".example", ".invalid", ".localhost", ".test")


def validate_official_url(url: str, *, allow_test_urls: bool = False) -> str:
    """Require a clean public HTTPS URL; domain ownership remains a human review."""

    parsed = urlparse(url.strip())
    if parsed.scheme != "https" or not parsed.hostname:
        raise OfficialUrlValidationError("official URLs must use HTTPS and include a host")
    if parsed.username or parsed.password:
        raise OfficialUrlValidationError("official URLs must not contain credentials")
    hostname = parsed.hostname.lower().rstrip(".")
    if not allow_test_urls and (
        hostname in _RESERVED_HOSTS
        or hostname.endswith(_RESERVED_SUFFIXES)
        or hostname.startswith("example.")
    ):
        raise OfficialUrlValidationError("placeholder or reserved official URLs are forbidden")
    try:
        address = ipaddress.ip_address(hostname)
    except ValueError:
        address = None
    if address is not None:
        raise OfficialUrlValidationError("official URLs must use a reviewed named host")
    return parsed.geturl()
