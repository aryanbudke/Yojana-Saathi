import { ProfileComposer } from "@/features/profile/ProfileComposer";
import { MatchingPreview } from "./MatchingPreview";
import styles from "./sections.module.css";

export function SchemeFinder() {
  return (
    <section id="finder" className={styles.section} aria-label="Scheme finder">
      <div className={styles.sectionHead}>
        <p className="section-eyebrow">A clearer next step</p>
        <h2 className={styles.sectionTitle}>Begin with what you know.</h2>
        <p className={styles.sectionLead}>
          You can leave details unknown and correct them at any time.
        </p>
      </div>
      <div className="finder-grid">
        <ProfileComposer landing />
        <MatchingPreview />
      </div>
    </section>
  );
}
