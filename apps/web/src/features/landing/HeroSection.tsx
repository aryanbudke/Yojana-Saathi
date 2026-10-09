import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { heroValueProps, showcaseSchemes } from "./content";
import { SchemePreviewCard } from "./SchemePreviewCard";
import styles from "./landing.module.css";

const cardPositions = [styles.cardOne, styles.cardTwo, styles.cardThree];

export function HeroSection() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.heroCopy}>
        <p className="section-eyebrow">
          AI-powered government scheme discovery
        </p>
        <h1 id="hero-title" className={styles.heroTitle}>
          The support you deserve is{" "}
          <span className={styles.heroAccent}>closer than you think.</span>
        </h1>
        <p className={styles.heroLead}>
          Discover government schemes that match your needs, understand
          eligibility, and find the right next step — all in one simple place.
        </p>
        <div className={styles.heroActions}>
          <Link className="button primary" href="#finder">
            Find my schemes
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link className="button secondary" href="/discover">
            Explore schemes
          </Link>
        </div>
        <ul className={styles.valueProps}>
          {heroValueProps.map((prop) => (
            <li key={prop}>
              <span className={styles.valueCheck} aria-hidden="true">
                <Check size={13} strokeWidth={3} />
              </span>
              {prop}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.showcase} aria-label="Example schemes">
        <svg
          className={styles.showcaseLines}
          viewBox="0 0 520 520"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="300" cy="250" r="210" />
          <circle cx="300" cy="250" r="150" />
          <path d="M40 430C150 300 330 380 500 170" />
        </svg>
        {showcaseSchemes.map((scheme, index) => (
          <SchemePreviewCard
            key={scheme.shortName}
            scheme={scheme}
            className={cardPositions[index]}
          />
        ))}
        <p className={styles.showcaseNote}>
          Shown for orientation. Eligibility is not checked here — confirm
          details on each official portal.
        </p>
      </div>
    </section>
  );
}
