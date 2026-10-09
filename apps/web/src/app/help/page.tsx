import Link from "next/link";
export default function Help() {
  return (
    <article className="reading-page">
      <p className="eyebrow">Made to make things clearer</p>
      <h1>
        A few details.
        <br />A better starting point.
      </h1>
      <ol className="steps">
        <li>
          <h2>Tell us about yourself</h2>
          <p>
            Share only what is needed. Never enter Aadhaar numbers, bank details
            or identity documents.
          </p>
        </li>
        <li>
          <h2>Check your details</h2>
          <p>
            Review every extracted fact. Correct mistakes or leave anything you
            don’t know blank.
          </p>
        </li>
        <li>
          <h2>Understand your options</h2>
          <p>
            Read which conditions pass, fail or need more information. Follow
            the source links and prepare your documents.
          </p>
        </li>
      </ol>
      <section id="faq" className="faq" aria-labelledby="faq-title">
        <h2 id="faq-title">Frequently asked questions</h2>
        <details>
          <summary>Does a match mean I am officially eligible?</summary>
          <p>
            No. Results explain checked conditions. The responsible government
            authority makes the final decision.
          </p>
        </details>
        <details>
          <summary>What if I do not know an answer?</summary>
          <p>
            Leave a field blank or choose “Not sure.” It remains unknown. You
            can correct it later.
          </p>
        </details>
        <details>
          <summary>Can I use the service without AI extraction?</summary>
          <p>
            Yes. Choose “Enter details manually,” review your profile and
            confirm it before matching.
          </p>
        </details>
        <details>
          <summary>Does this platform submit or track my application?</summary>
          <p>
            No. Follow the scheme’s verified official application route.
            Tracking, where offered, is handled by the responsible portal or
            authority.
          </p>
        </details>
        <details>
          <summary>Why do I see mock mode?</summary>
          <p>
            Mock mode demonstrates the workflow with synthetic fixtures. Those
            results are not real scheme recommendations.
          </p>
        </details>
      </section>
      <Link href="/discover" className="button primary">
        Start discovering
      </Link>
    </article>
  );
}
