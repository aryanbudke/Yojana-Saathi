import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <article className="reading-page">
      <h1>Preliminary guidance, clear limits.</h1>
      <p>
        yojana saathi is independent and is not an official government service.
        Government portals and authorities make final eligibility and approval
        decisions.
      </p>
      <h2>What a match means</h2>
      <p>
        “All checked conditions met” means that the available verified rules
        passed for your confirmed profile. It is not a guarantee of eligibility
        or approval. Unknown and manually reviewed conditions require further
        verification.
      </p>
      <h2>Check current information</h2>
      <p>
        Criteria, benefits and application processes may change. Read the
        scheme’s source references and verification date, and confirm current
        requirements with the responsible authority.
      </p>
      <h2>Examples and application actions</h2>
      <p>
        Mock results are synthetic contract demonstrations. Showcase schemes are
        examples and are not personalized matches. We do not submit forms,
        verify identity documents or track applications on your behalf.
      </p>
      <Link className="button secondary" href="/help">
        Understand the process
      </Link>
    </article>
  );
}
