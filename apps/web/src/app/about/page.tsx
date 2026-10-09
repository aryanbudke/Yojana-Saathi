import Link from "next/link";

export default function About() {
  return (
    <article className="reading-page">
      <h1>Support starts with understanding.</h1>
      <p>
        yojana saathi is an independent project that helps citizens discover
        government schemes, understand checked conditions and prepare
        application documents.
      </p>
      <h2>AI assists. Rules explain.</h2>
      <p>
        AI can extract details from your description. You review and correct
        them before rule-based matching. Missing details stay unknown, and
        ambiguous conditions need manual verification.
      </p>
      <h2>The authority remains with government.</h2>
      <p>
        A match is preliminary guidance. The responsible department determines
        eligibility and makes the final decision. Mock mode uses clearly
        labelled synthetic examples.
      </p>
      <Link className="button primary" href="/discover">
        Explore schemes
      </Link>
    </article>
  );
}
