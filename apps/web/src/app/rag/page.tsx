import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RagTester } from "@/features/rag/RagTester";

export const metadata: Metadata = {
  title: "Local RAG test — Yojana Saathi",
  robots: { index: false, follow: false },
};

export default function RagPage() {
  if (
    process.env.RAG_DEMO_ENABLED !== "1" ||
    process.env.NODE_ENV !== "development"
  )
    notFound();
  return (
    <section className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="page-heading space-y-4">
        <h1>
          Ask the draft records<span className="green">.</span>
        </h1>
        <p className="muted text-base">
          Live Gemini retrieval and answers from eight actual, unverified scheme
          records. This is a local sample; the full 3,397-record index is
          unfinished. Answers are draft evidence, not official government
          guidance.
        </p>
      </div>
      <RagTester />
    </section>
  );
}
