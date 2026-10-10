import { InlineAlert } from "@/components/ui";
import type { DraftAnswer } from "./model";

export function DraftResult({ result }: { result: DraftAnswer }) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="draft-answer-title" className="panel space-y-4">
        <h2 id="draft-answer-title">What the records say</h2>
        <p className="whitespace-pre-wrap break-words">{result.answer}</p>
        {result.cited_slugs.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <span>Cited records:</span>
            {result.cited_slugs.map((slug) => (
              <a
                className="button secondary"
                key={slug}
                href={`#source-${encodeURIComponent(slug)}`}
              >
                {slug}
              </a>
            ))}
          </div>
        )}
      </section>
      <section aria-labelledby="retrieved-title" className="space-y-4">
        <h2 id="retrieved-title">Retrieved source records</h2>
        <p className="muted">
          These records have no verified official URL or verification date. They
          remain unpublished and cannot confirm eligibility.
        </p>
        {result.sources.length === 0 && (
          <InlineAlert>
            No draft records were retrieved. Check the sample backend and try a
            scheme name above.
          </InlineAlert>
        )}
        {result.sources.map((source) => (
          <details
            id={`source-${encodeURIComponent(source.slug)}`}
            key={source.slug}
            className="panel scroll-mt-24"
          >
            <summary className="min-h-12 cursor-pointer py-2 font-semibold break-words">
              {source.name} —{" "}
              {result.cited_slugs.includes(source.slug)
                ? "cited"
                : "retrieved context"}
            </summary>
            <dl className="mt-4 space-y-5">
              {Object.entries(source.record)
                .filter(([, value]) => value)
                .map(([field, value]) => (
                  <div key={field}>
                    <dt className="font-semibold break-words">
                      {field.replaceAll("_", " ")}
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words">
                      {value}
                    </dd>
                  </div>
                ))}
            </dl>
          </details>
        ))}
      </section>
    </div>
  );
}
