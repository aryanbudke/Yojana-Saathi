import { describe, expect, it, vi, afterEach } from "vitest";
import { askDrafts, draftAnswerSchema } from "./model";

const fixture = {
  publication_allowed: false,
  answer: "SYNTHETIC answer",
  cited_slugs: ["synthetic"],
  sources: [
    {
      slug: "synthetic",
      name: "SYNTHETIC ONLY",
      review_status: "draft",
      record: {
        benefits: "SYNTHETIC evidence",
        verification_status: "unverified",
        official_url: "",
        last_verified: "",
      },
    },
  ],
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("local reviewer answer boundary", () => {
  it("rejects publication and citations outside retrieved records", () => {
    expect(draftAnswerSchema.safeParse(fixture).success).toBe(true);
    expect(
      draftAnswerSchema.safeParse({ ...fixture, publication_allowed: true })
        .success,
    ).toBe(false);
    expect(
      draftAnswerSchema.safeParse({ ...fixture, cited_slugs: ["invented"] })
        .success,
    ).toBe(false);
  });
  it("requires the fixed local origin before sending a token", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://example.invalid");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    await expect(askDrafts("SYNTHETIC", "synthetic-token")).rejects.toThrow(
      "local backend",
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("uses normal reviewer auth without persisting it", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000");
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(fixture)));
    vi.stubGlobal("fetch", fetcher);
    expect(await askDrafts("SYNTHETIC question", "synthetic-token")).toEqual(
      fixture,
    );
    expect(fetcher.mock.calls[0][1].headers["X-Admin-Token"]).toBe(
      "synthetic-token",
    );
  });
  it("shows a recoverable authentication error", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8000");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("", { status: 403 })),
    );
    await expect(askDrafts("SYNTHETIC", "synthetic-token")).rejects.toThrow(
      "Reviewer token rejected",
    );
  });
});
