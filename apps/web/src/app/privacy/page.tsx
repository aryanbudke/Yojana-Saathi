import Link from "next/link";

export default function Privacy() {
  return (
    <article className="reading-page">
      <h1>Privacy and your profile</h1>
      <p>
        Share only the details needed to understand scheme requirements. Do not
        enter Aadhaar numbers, bank account numbers or identity-document images.
      </p>
      <h2>What this interface keeps</h2>
      <p>
        Your description and editable profile stay in this tab’s memory. The
        interface does not save them in long-term browser storage. In live mode,
        confirmed facts are also sent to an anonymous backend session.
      </p>
      <h2>When you use AI extraction</h2>
      <p>
        In live mode, your description is sent to the configured backend, which
        can use Gemini to extract profile details. You can use manual entry
        instead. Provider handling and retention depend on that service’s
        configuration and policies.
      </p>
      <h2>Clearing your details</h2>
      <p>
        “Clear my details” requests deletion of the backend session and clears
        this interface’s profile and matching state when deletion succeeds.
        Backend sessions also expire. This action does not promise deletion of
        records held by external providers.
      </p>
      <p>
        Mock mode runs synthetic examples in the frontend instead of making
        those live API requests.
      </p>
      <Link className="button secondary" href="/discover">
        Review or clear my profile
      </Link>
    </article>
  );
}
