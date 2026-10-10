import { Landmark } from "lucide-react";
import { SourceLink } from "@/components/ui";
import type { ShowcaseScheme } from "./content";
import styles from "./landing.module.css";

type Props = { scheme: ShowcaseScheme; className?: string };

export function SchemePreviewCard({ scheme, className = "" }: Props) {
  return (
    <article className={`glass ${styles.previewCard} ${className}`}>
      <div className={styles.previewTop}>
        <span className={styles.exampleTag}>Example scheme</span>
        <span className={styles.categoryTag}>{scheme.category}</span>
      </div>
      <h3 className={styles.previewName}>{scheme.shortName}</h3>
      <p className={styles.previewFull}>{scheme.fullName}</p>
      <p className={styles.previewAuthority}>
        <Landmark size={14} aria-hidden="true" />
        {scheme.authority}
      </p>
      <p className={styles.previewPurpose}>{scheme.purpose}</p>
      <SourceLink url={scheme.officialUrl}>
        Official portal<span className="sr-only"> for {scheme.shortName}</span>
      </SourceLink>
    </article>
  );
}
