import Link from "next/link";
import { getMessages } from "@/i18n/server";

export default async function About() {
  const m = await getMessages();
  return (
    <article className="reading-page">
      <h1>{m.about.title}</h1>
      <p>{m.about.intro}</p>
      <h2>{m.about.aiTitle}</h2>
      <p>{m.about.aiText}</p>
      <h2>{m.about.authorityTitle}</h2>
      <p>{m.about.authorityText}</p>
      <Link className="button primary" href="/discover">
        {m.common.exploreSchemes}
      </Link>
    </article>
  );
}
