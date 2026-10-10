import Link from "next/link";
import { getMessages } from "@/i18n/server";

export default async function Privacy() {
  const m = await getMessages();
  const p = m.privacy;
  return (
    <article className="reading-page">
      <h1>{p.title}</h1>
      <p>{p.intro}</p>
      <h2>{p.keepsTitle}</h2>
      <p>{p.keepsText}</p>
      <h2>{p.aiTitle}</h2>
      <p>{p.aiText}</p>
      <h2>{p.clearTitle}</h2>
      <p>{p.clearText}</p>
      <p>{p.mockText}</p>
      <Link className="button secondary" href="/discover">
        {p.cta}
      </Link>
    </article>
  );
}
