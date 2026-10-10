const LEADING_LABEL =
  /^(?:key benefits?|benefits?|support at a glance)\s*:\s*/i;

function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const candidate = text.slice(0, maxLength + 1);
  const lastSpace = candidate.lastIndexOf(" ");
  const cutAt =
    lastSpace >= Math.floor(maxLength * 0.7) ? lastSpace : maxLength;
  return `${candidate.slice(0, cutAt).replace(/[\s,;:.-]+$/, "")}…`;
}

/**
 * Produce a compact card preview without changing or discarding the source text.
 * Full documents and application instructions remain available in expandable UI.
 */
export function conciseSchemeText(
  value: string,
  { maxLength = 240, maxSentences = 2 } = {},
): string {
  const normalized = value
    .replace(/\s+/g, " ")
    .trim()
    .replace(LEADING_LABEL, "");
  if (!normalized) return "";

  const sentences = normalized.match(/[^.!?]+[.!?]+(?:[”\"])?|[^.!?]+$/g) ?? [
    normalized,
  ];
  const selected = sentences
    .slice(0, maxSentences)
    .map((sentence) => sentence.trim())
    .join(" ");

  return truncateAtWord(selected, maxLength);
}
