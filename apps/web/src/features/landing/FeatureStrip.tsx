import { features } from "./content";
import styles from "./landing.module.css";

export function FeatureStrip() {
  return (
    <section className={styles.featureStrip} aria-labelledby="features-title">
      <h2 id="features-title" className="sr-only">
        What yojana saathi helps with
      </h2>
      <ul className={styles.featureList}>
        {features.map(({ icon: Icon, title, text }) => (
          <li key={title} className={styles.featureItem}>
            <span className={styles.featureIcon} aria-hidden="true">
              <Icon size={20} />
            </span>
            <h3 className={styles.featureTitle}>{title}</h3>
            <p className={styles.featureText}>{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
