import Link from "next/link";
import {
  ArrowUpRight,
  Sprout,
  GraduationCap,
  HeartHandshake,
  House,
  HeartPulse,
  BriefcaseBusiness,
} from "lucide-react";
import styles from "./sections.module.css";

const items = [
  {
    name: "Agriculture",
    value: "agriculture",
    label: "Farming & rural livelihoods",
    icon: Sprout,
  },
  {
    name: "Education",
    value: "education",
    label: "Learning & student support",
    icon: GraduationCap,
  },
  {
    name: "Women & Child Welfare",
    value: "women",
    label: "Support for women & families",
    icon: HeartHandshake,
  },
  {
    name: "Housing",
    value: "housing",
    label: "A place to call home",
    icon: House,
  },
  {
    name: "Health & Wellness",
    value: "health",
    label: "Care & wellbeing",
    icon: HeartPulse,
  },
  {
    name: "Skill Development & Employment",
    value: "employment",
    label: "Skills & work opportunities",
    icon: BriefcaseBusiness,
  },
];

export function PopularCategories() {
  return (
    <section className={styles.section} aria-labelledby="categories-title">
      <div className={styles.sectionHead}>
        <h2 id="categories-title" className={styles.sectionTitle}>
          Popular categories
        </h2>
        <p className={styles.sectionLead}>
          Explore schemes by your area of interest.
        </p>
      </div>
      <div className={styles.categoryGrid}>
        {items.map(({ name, value, label, icon: Icon }) => (
          <Link
            key={value}
            className={styles.categoryCard}
            href={`/discover?category=${value}#browse`}
          >
            <Icon size={24} aria-hidden="true" />
            <div>
              <h3>{name}</h3>
              <p>{label}</p>
            </div>
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
