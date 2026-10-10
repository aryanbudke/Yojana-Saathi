/**
 * Hero showcase examples. These are real central schemes shown for orientation only:
 * name, authority, category and purpose are stable public facts (translated in
 * messages `home.showcase.schemes`); amounts and eligibility are deliberately omitted
 * until a reviewed record exists in the catalogue.
 * Official URLs were checked to resolve (October 2026).
 */
export const showcaseSchemes = [
  { key: "pmKisan", shortName: "PM-KISAN", officialUrl: "https://pmkisan.gov.in" },
  {
    key: "pmVidyalaxmi",
    shortName: "PM-Vidyalaxmi",
    officialUrl: "https://www.education.gov.in",
  },
  {
    key: "pmayGramin",
    shortName: "PMAY-Gramin",
    officialUrl: "https://pmayg.dord.gov.in",
  },
] as const;
