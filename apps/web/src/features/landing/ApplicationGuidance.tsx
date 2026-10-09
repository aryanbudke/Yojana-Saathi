import Link from "next/link";
import { ClipboardCheck, Files, ExternalLink, SearchCheck } from "lucide-react";
import styles from "./sections.module.css";

const steps = [
  {
    title: "Check eligibility",
    text: "Read the checked conditions and resolve any missing or unverified details.",
    icon: ClipboardCheck,
  },
  {
    title: "Prepare documents",
    text: "Use the scheme’s personal checklist to prepare the documents its reviewed guidance lists.",
    icon: Files,
  },
  {
    title: "Apply through the official portal",
    text: "Follow the verified application route. Some schemes require an office visit instead.",
    icon: ExternalLink,
  },
  {
    title: "Track on the official portal",
    text: "Where tracking is available, keep your reference number and check with the responsible authority.",
    icon: SearchCheck,
  },
];

export function ApplicationGuidance() {
  return (
    <section className={styles.section} aria-labelledby="guidance-title">
      <div className={styles.sectionHead}>
        <h2 id="guidance-title" className={styles.sectionTitle}>
          Application guidance
        </h2>
        <p className={styles.sectionLead}>
          Get step-by-step guidance to apply for relevant schemes.
        </p>
      </div>
      <ol className={styles.guidanceList}>
        {steps.map(({ title, text, icon: Icon }) => (
          <li key={title}>
            <Icon size={24} aria-hidden="true" />
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
      <div className={styles.guidanceNote}>
        <p>
          We help you prepare. We don’t submit, approve or track applications on
          your behalf.
        </p>
        <Link className="button secondary" href="/discover">
          Explore scheme guidance
        </Link>
      </div>
    </section>
  );
}
