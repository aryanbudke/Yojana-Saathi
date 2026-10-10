import { z } from "zod";

const sourceSchema = z
  .object({
    slug: z.string().min(1),
    name: z.string().min(1),
    review_status: z.literal("draft"),
    record: z.record(z.string(), z.string().nullable()),
  })
  .refine(
    ({ record }) =>
      record.verification_status === "unverified" &&
      !record.official_url &&
      !record.last_verified,
  );

export const draftAnswerSchema = z
  .object({
    publication_allowed: z.literal(false),
    answer: z.string().min(1).max(6000),
    cited_slugs: z.array(z.string()),
    sources: z.array(sourceSchema),
  })
  .refine(({ cited_slugs, sources }) =>
    cited_slugs.every((slug) => sources.some((source) => source.slug === slug)),
  );
export type DraftAnswer = z.infer<typeof draftAnswerSchema>;

export async function askDrafts(
  question: string,
  token: string,
): Promise<DraftAnswer> {
  if (question.trim().length < 2 || question.length > 500)
    throw new Error("Enter a question between 2 and 500 characters.");
  const base = new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? "");
  if (base.origin !== "http://localhost:8000")
    throw new Error("This test page requires the local backend on port 8000.");
  const response = await fetch(
    `${base.origin}/api/v1/admin/staging-schemes/ask`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify({ question, limit: 3 }),
      cache: "no-store",
      signal: AbortSignal.timeout(65_000),
    },
  );
  if (response.status === 403)
    throw new Error(
      "Reviewer token rejected. Copy ADMIN_REVIEW_TOKEN from your private backend .env and try again.",
    );
  if (!response.ok)
    throw new Error(
      "The local answer service is unavailable. Gemini may be rate limited; wait a minute and try again.",
    );
  const parsed = draftAnswerSchema.safeParse(await response.json());
  if (!parsed.success)
    throw new Error(
      "The answer or its source references could not be verified. Please try again.",
    );
  return parsed.data;
}
