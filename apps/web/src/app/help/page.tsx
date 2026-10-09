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
      <Link href="/discover" className="button primary">
        Start discovering
      </Link>
    </article>
  );
}
