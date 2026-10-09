# Independent label review — pending

These are hypothetical policies, never real government criteria. Labels were proposed by the same developer who wrote the engine. They need independent review before accuracy is publishable.

## Hypothetical policies

| Policy | Required conditions | Exclusions |
| --- | --- | --- |
| Farmer | Age ≥18; MH/KA; farmer or farm labourer; annual family income ≤₹200,000; registration yes | Land >5 acres |
| Student | Age 18–25 inclusive; MH/KA; student true; income ≤₹300,000 | None |
| Disability | Disability true; MH/KA; income ≤₹300,000 | Government employee |
| Pension | Age ≥60; KA; income ≤₹150,000 | Student true |

E = all checked conditions met; N = not eligible; U = needs information; M = manual review. Unknown is null or registration not_sure, never zero/false. A known failed mandatory rule or triggered exclusion rejects. Otherwise manual overrides unknown; unreviewed/future policy never passes. Stale variants mark all policies stale. Ambiguous variants add a mandatory manual clause to Farmer; an explicit exclusion can still reject. Unmapped-root and future variants affect Farmer only.

## Review each profile

The expected column is ordered Farmer / Student / Disability / Pension. Relevance labels indicate the proposed shortlist intent, independently of the ranking implementation. Review those and missing fields in the JSON fixture too. A dash is unknown; it is never inferred from other fields.

| ID and scenario | Age | State | Occupation | Annual income ₹ | Acres | Registration | Student | Disability | Expected | Relevant | Variant |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| persona-01: Farmer known conditions | 24 | MH | farmer | 150000 | 2.0 | yes | False | False | E / N / N / N | farmer | standard |
| persona-02: Farmer minimum age inclusive | 18 | MH | farmer | 150000 | 2.0 | yes | False | False | E / N / N / N | farmer | standard |
| persona-03: Farmer below minimum age | 17 | MH | farmer | 150000 | 2.0 | yes | False | False | N / N / N / N | none | standard |
| persona-04: Farmer income cap inclusive | 24 | MH | farmer | 200000 | 2.0 | yes | False | False | E / N / N / N | farmer | standard |
| persona-05: Farmer over income cap | 24 | MH | farmer | 200001 | 2.0 | yes | False | False | N / N / N / N | none | standard |
| persona-06: Five acres is not exclusion | 24 | MH | farmer | 150000 | 5.0 | yes | False | False | E / N / N / N | farmer | standard |
| persona-07: Above five acres triggers exclusion | 24 | MH | farmer | 150000 | 5.0001 | yes | False | False | N / N / N / N | none | standard |
| persona-08: Zero land remains known | 24 | MH | farmer | 150000 | 0.0 | yes | False | False | E / N / N / N | farmer | standard |
| persona-09: Missing registration | 24 | MH | farmer | 150000 | 2.0 | — | False | False | U / N / N / N | farmer | standard |
| persona-10: Not sure registration | 24 | MH | farmer | 150000 | 2.0 | not_sure | False | False | U / N / N / N | farmer | standard |
| persona-11: Farmer zero income known | 24 | MH | farmer | 0 | 2.0 | yes | False | False | E / N / N / N | farmer | standard |
| persona-12: Wrong state for farmer | 24 | DL | farmer | 150000 | 2.0 | yes | False | False | N / N / N / N | none | standard |
| persona-13: Student known conditions | 22 | MH | student | 150000 | 0.0 | no | True | False | N / E / N / N | student | standard |
| persona-14: Student minimum age inclusive | 18 | MH | student | 150000 | 0.0 | no | True | False | N / E / N / N | student | standard |
| persona-15: Student maximum age inclusive | 25 | MH | student | 150000 | 0.0 | no | True | False | N / E / N / N | student | standard |
| persona-16: Student age outside upper bound | 26 | MH | student | 150000 | 0.0 | no | True | False | N / N / N / N | none | standard |
| persona-17: Student income cap inclusive | 22 | MH | student | 300000 | 0.0 | no | True | False | N / E / N / N | student | standard |
| persona-18: Student over income cap | 22 | MH | student | 300001 | 0.0 | no | True | False | N / N / N / N | none | standard |
| persona-19: Student status false is known fail | 22 | MH | student | 150000 | 0.0 | no | False | False | N / N / N / N | none | standard |
| persona-20: Student missing status | 22 | MH | student | 150000 | 0.0 | no | — | False | N / U / N / N | student | standard |
| persona-21: Disability known conditions | 30 | MH | tailor | 150000 | 0.0 | no | False | True | N / N / E / N | disability | standard |
| persona-22: Disability flag false is known fail | 30 | MH | tailor | 150000 | 0.0 | no | False | False | N / N / N / N | none | standard |
| persona-23: Disability income cap inclusive | 30 | MH | tailor | 300000 | 0.0 | no | False | True | N / N / E / N | disability | standard |
| persona-24: Disability public employment exclusion | 30 | MH | government_employee | 150000 | 0.0 | no | False | True | N / N / N / N | none | standard |
| persona-25: Disability missing occupation exclusion check | 30 | MH | — | 150000 | 0.0 | no | False | True | N / N / U / N | disability | standard |
| persona-26: Disability missing flag | 30 | MH | tailor | 150000 | 0.0 | no | False | — | N / N / U / N | disability | standard |
| persona-27: Pension known conditions | 65 | KA | retired | 150000 | 0.0 | no | False | False | N / N / N / E | pension | standard |
| persona-28: Pension minimum age inclusive | 60 | KA | retired | 150000 | 0.0 | no | False | False | N / N / N / E | pension | standard |
| persona-29: Pension below age boundary | 59 | KA | retired | 150000 | 0.0 | no | False | False | N / N / N / N | none | standard |
| persona-30: Pension income cap inclusive | 65 | KA | retired | 150000 | 0.0 | no | False | False | N / N / N / E | pension | standard |
| persona-31: Pension over income cap | 65 | KA | retired | 150001 | 0.0 | no | False | False | N / N / N / N | none | standard |
| persona-32: Pension student exclusion | 65 | KA | retired | 150000 | 0.0 | no | True | False | N / N / N / N | none | standard |
| persona-33: Pension unknown exclusion | 65 | KA | retired | 150000 | 0.0 | no | — | False | N / N / N / U | pension | standard |
| persona-34: All facts unprovided | — | — | — | — | — | — | — | — | U / U / U / U | farmer, student, disability, pension | standard |
| persona-35: Only age stated; no occupation inference | 24 | — | — | — | — | — | — | — | U / U / U / N | farmer, student, disability | standard |
| persona-36: Missing farmer income and registration | 24 | MH | farmer | — | 2.0 | — | False | False | U / N / N / N | farmer | standard |
| persona-37: Ambiguous farmer policy | 24 | MH | farmer | 150000 | 2.0 | yes | False | False | M / N / N / N | farmer | ambiguous_farmer |
| persona-38: Exclusion still rejects ambiguous farmer | 24 | MH | farmer | 150000 | 6.0 | yes | False | False | N / N / N / N | none | ambiguous_farmer |
| persona-39: Outdated versions cannot pass | 24 | MH | farmer | 150000 | 2.0 | yes | False | False | M / M / M / M | farmer | stale_all |
| persona-40: Unmapped root criterion cannot disappear | 24 | MH | farmer | 150000 | 2.0 | yes | False | False | M / N / N / N | farmer | bad_root_farmer |
| persona-41: Future publication cannot pass | 24 | MH | farmer | 150000 | 2.0 | yes | False | False | M / N / N / N | farmer | future_farmer |
| persona-42: Conflicting ages require correction | [18, 65] | MH | farmer | 150000 | 2.0 | yes | False | False | reject invalid input | none | standard |
| persona-43: Negative annual income rejected | 24 | MH | farmer | -1 | 2.0 | yes | False | False | reject invalid input | none | standard |
| persona-44: Unrecognized state rejected | 24 | XX | farmer | 150000 | 2.0 | yes | False | False | reject invalid input | none | standard |

## Record the review

Read and correct `services/api/tests/matching/fixtures/synthetic_profiles.json`, including expected verdicts, expected_missing and relevant labels. Do not copy labels from the observed evaluator results. Run the evaluation again after corrections; failures must be investigated before recording approval.

After an independent person approves the exact fixture, copy `review.example.json` to a separate review file, replace the reviewer/date, and calculate the fixture SHA-256. Its scope covers classification, missing fields and relevance. The CLI rejects a same-author, blank, future-dated or mismatched-hash review. The manifest records supplied review evidence; it cannot authenticate the person.

From `services/api`:

```bash
.venv/bin/python scripts/evaluate_matching.py --output ../../docs/ai/evaluation.json
shasum -a 256 tests/matching/fixtures/synthetic_profiles.json
.venv/bin/python scripts/evaluate_matching.py --review path/to/review.json --output ../../docs/ai/evaluation.json
```

Guidance completeness requires a separately reviewed real steps/documents checklist from Developer 2. The current synthetic seed verifies API wiring and source linkage only. Frontend review and a joint live demo are also outstanding. Phase C stays blocked, and Phase D stays pending, until those acceptance dependencies are satisfied.

## Current measured comparison

This is an unreviewed regression comparison, not matching accuracy:

| Measurement | Numerator / denominator | Meaning |
| --- | --- | --- |
| Proposed verdict agreement | 164 / 164 | 41 valid profiles × 4 hypothetical policies |
| Proposed unsafe pass rate | 0 / 149 | Pass where the proposed label was fail, unknown or manual |
| Proposed missing-field recall | 38 / 38 | Only explicitly labeled missing field checks |
| Proposed top-three relevance precision | 32 / 123 | Three returned slots for each valid profile |
| Synthetic source linkage | 781 / 781 | Source UUID belongs to that synthetic policy; no official verification |
| Invalid-input rejection | 3 / 3 | Conflicting age array, negative income, invalid state |
| Real guidance completeness | Unmeasured | No reviewed real guidance checklist supplied |

Top-three precision is 26.0% under this deliberately strict denominator: most profiles have only one relevant policy, while the API returns three verdict-grouped slots. The corpus is too small and unreviewed to establish real recommendation quality. The repository lacks category/geography metadata needed for richer relevance scoring. No baseline or live Gemini extraction-quality comparison was run.
