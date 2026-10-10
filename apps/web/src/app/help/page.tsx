import Link from "next/link";
import { getMessages } from "@/i18n/server";

export default async function Help() {
  const m = await getMessages();
  const h = m.help;
  return (
    <article className="reading-page">
      <p className="eyebrow">{h.eyebrow}</p>
      <h1>
        {h.titleLine1}
        <br />
        {h.titleLine2}
      </h1>
      <ol className="steps">
        {h.steps.map((step) => (
          <li key={step.title}>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
      <section id="faq" className="faq" aria-labelledby="faq-title">
        <h2 id="faq-title">{h.faqTitle}</h2>
        {h.faq.map(({ q, a }) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <Link href="/discover" className="button primary">
        {h.cta}
      </Link>
    </article>
  );
}
