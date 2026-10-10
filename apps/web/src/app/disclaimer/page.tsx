import Link from "next/link";
import { getMessages } from "@/i18n/server";

export default async function DisclaimerPage() {
  const m = await getMessages();
  const d = m.disclaimerPage;
  return (
    <article className="reading-page">
      <h1>{d.title}</h1>
      <p>{d.intro}</p>
      <h2>{d.matchTitle}</h2>
      <p>{d.matchText}</p>
      <h2>{d.currentTitle}</h2>
      <p>{d.currentText}</p>
      <h2>{d.examplesTitle}</h2>
      <p>{d.examplesText}</p>
      <Link className="button secondary" href="/help">
        {d.cta}
      </Link>
    </article>
  );
}
