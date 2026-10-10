"""Conservative normalization for unverified eligibility prose.

The output is a review proposal only. It is never evaluated as an eligibility
rule until a human reviewer links it to an official source and publishes it.
"""

import re
from dataclasses import dataclass
from typing import Literal

from app.schemas.profile import ProfileField

RuleOperator = Literal["eq", "lt", "lte", "gte"]


@dataclass(frozen=True)
class ProposedEligibilityRule:
    field: ProfileField
    op: RuleOperator
    value: str | int
    evidence: str
    verified: Literal[False] = False


@dataclass(frozen=True)
class EligibilityNormalization:
    proposed_rules: tuple[ProposedEligibilityRule, ...]
    uncertain_fragments: tuple[str, ...]
    requires_verification: Literal[True] = True


STATE_NAMES = {
    "andhra pradesh": "AP",
    "assam": "AS",
    "bihar": "BR",
    "chhattisgarh": "CG",
    "gujarat": "GJ",
    "haryana": "HR",
    "himachal pradesh": "HP",
    "jharkhand": "JH",
    "karnataka": "KA",
    "kerala": "KL",
    "madhya pradesh": "MP",
    "maharashtra": "MH",
    "odisha": "OD",
    "punjab": "PB",
    "rajasthan": "RJ",
    "tamil nadu": "TN",
    "telangana": "TS",
    "uttar pradesh": "UP",
    "uttarakhand": "UK",
    "west bengal": "WB",
}

SENTENCE_BOUNDARY = re.compile(r"(?<!Rs\.)(?<!rs\.)(?<=[.!?;])\s+|\n+")
AGE_BETWEEN = re.compile(
    r"\bage\b[^.;]{0,40}?\bbetween\s+(\d{1,3})\s+(?:and|to)\s+(\d{1,3})\b",
    re.IGNORECASE,
)
INCOME_LIMIT = re.compile(
    r"\bannual\s+(?:family\s+)?income\b[^.;]{0,50}?"
    r"\b(not\s+exceed|not\s+more\s+than|up\s+to|less\s+than|below)\b\s*"
    r"(?:rs\.?|inr|₹)?\s*([0-9][0-9,.]*)\s*(lakh|lakhs)?\b",
    re.IGNORECASE,
)
MANDATORY_OCCUPATION = re.compile(
    r"\b(?:applicant|beneficiary)\s+must\s+be\s+(?:an?\s+)?"
    r"(farmer|student|artisan|weaver|entrepreneur|worker|vendor)\b",
    re.IGNORECASE,
)


def normalize_eligibility_text(text: str) -> EligibilityNormalization:
    """Propose only narrowly recognizable rules and retain everything else."""

    proposed: list[ProposedEligibilityRule] = []
    uncertain: list[str] = []
    fragments = [part.strip(" -•\t") for part in SENTENCE_BOUNDARY.split(text) if part.strip()]
    for fragment in fragments:
        fragment_rules = _rules_for_fragment(fragment)
        if fragment_rules:
            proposed.extend(fragment_rules)
        else:
            uncertain.append(fragment)
    return EligibilityNormalization(tuple(proposed), tuple(uncertain))


def _rules_for_fragment(fragment: str) -> list[ProposedEligibilityRule]:
    rules: list[ProposedEligibilityRule] = []
    if match := AGE_BETWEEN.search(fragment):
        lower, upper = (int(match.group(1)), int(match.group(2)))
        if 0 <= lower <= upper <= 120:
            rules.extend(
                [
                    ProposedEligibilityRule("age", "gte", lower, fragment),
                    ProposedEligibilityRule("age", "lte", upper, fragment),
                ]
            )
    if match := INCOME_LIMIT.search(fragment):
        amount = _amount_in_inr(match.group(2), match.group(3))
        if amount is not None:
            operator: RuleOperator = (
                "lt" if match.group(1).casefold() in {"less than", "below"} else "lte"
            )
            rules.append(ProposedEligibilityRule("family_income_inr", operator, amount, fragment))
    if match := MANDATORY_OCCUPATION.search(fragment):
        rules.append(
            ProposedEligibilityRule("occupation", "eq", match.group(1).casefold(), fragment)
        )
    lowered = fragment.casefold()
    for state_name, state_code in STATE_NAMES.items():
        if re.search(rf"\b(?:resident|domicile)\s+of\s+{re.escape(state_name)}\b", lowered):
            rules.append(ProposedEligibilityRule("state_code", "eq", state_code, fragment))
            break
    return rules


def _amount_in_inr(raw: str, unit: str | None) -> int | None:
    try:
        value = float(raw.replace(",", ""))
    except ValueError:
        return None
    if unit:
        value *= 100_000
    if not value.is_integer() or not 0 <= value <= 1_000_000_000:
        return None
    return int(value)
