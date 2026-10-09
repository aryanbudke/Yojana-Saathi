import { BookOpen, Globe2, Landmark, MapPinned } from "lucide-react";
import { SourceLink } from "@/components/ui";
import styles from "./sections.module.css";

const sources = [
  {
    name: "National Portal of India",
    text: "Government information and services.",
    url: "https://www.india.gov.in/",
    icon: Globe2,
  },
  {
    name: "Relevant ministry portals",
    text: "Find ministry and department websites in the government directory.",
    url: "https://igod.gov.in/",
    icon: Landmark,
  },
  {
    name: "Official Gazette notifications",
    text: "Read published government notifications.",
    url: "https://egazette.gov.in/",
    icon: BookOpen,
  },
  {
    name: "State government portals",
    text: "Find your state’s official website.",
    url: "https://igod.gov.in/sg/states",
    icon: MapPinned,
  },
];

export function OfficialSources() {
  return (
    <section className={styles.section} aria-labelledby="sources-title">
      <div className={styles.sectionHead}>
        <h2 id="sources-title" className={styles.sectionTitle}>
          Trusted official sources
        </h2>
        <p className={styles.sectionLead}>
          We surface information from verifiable government sources. Check
          current criteria on the relevant official portal.
        </p>
      </div>
      <div className={styles.sourceGrid}>
        {sources.map(({ name, text, url, icon: Icon }) => (
          <article key={url} className={styles.sourceCard}>
            <Icon size={24} aria-hidden="true" />
            <h3>{name}</h3>
            <p>{text}</p>
            <SourceLink url={url}>Visit official website</SourceLink>
          </article>
        ))}
      </div>
      <p className={styles.sourceNote}>
        These destinations help you verify information. They do not endorse this
        independent platform or verify the synthetic mock records.
      </p>
    </section>
  );
}
