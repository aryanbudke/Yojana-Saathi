"""Guest saved-scheme request and response contracts."""

from datetime import datetime
from uuid import UUID

from app.schemas.common import ContractModel
from app.schemas.scheme import SchemeSummary


class SaveSchemeRequest(ContractModel):
    session_id: UUID
    scheme_id: UUID


class SavedSchemeItem(ContractModel):
    saved_at: datetime
    scheme: SchemeSummary


class SavedSchemesResponse(ContractModel):
    session_id: UUID
    items: list[SavedSchemeItem]
