"""Responses for audited administrative state transitions."""

from typing import Literal
from uuid import UUID

from app.schemas.common import ContractModel


class CurationActionResponse(ContractModel):
    scheme_version_id: UUID
    action: Literal["verify", "publish"]
    source_count: int
    rule_count: int
    document_count: int
    step_count: int
