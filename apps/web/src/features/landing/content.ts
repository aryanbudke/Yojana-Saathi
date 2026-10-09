import {
  ExternalLink,
  HandHeart,
  ListChecks,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

/**
 * Hero showcase examples. These are real central schemes shown for orientation only:
 * name, authority, category and purpose are stable public facts; amounts and eligibility
 * are deliberately omitted until a reviewed record exists in the catalogue.
 * Official URLs were checked to resolve (October 2026).
 */
export type ShowcaseScheme = {
  shortName: string;
  fullName: string;
  authority: string;
  category: string;
  purpose: string;
  officialUrl: string;
};

export const showcaseSchemes: ShowcaseScheme[] = [
  {
    shortName: "PM-KISAN",
    fullName: "Pradhan Mantri Kisan Samman Nidhi",
    authority: "Ministry of Agriculture & Farmers Welfare",
    category: "Agriculture",
    purpose: "Income support for landholding farmer families.",
    officialUrl: "https://pmkisan.gov.in",
  },
  {
    shortName: "PM-Vidyalaxmi",
    fullName: "PM-Vidyalaxmi education loan scheme",
    authority: "Ministry of Education",
    category: "Education",
    purpose:
      "Education loans for students admitted to quality higher-education institutions.",
    officialUrl: "https://www.education.gov.in",
  },
  {
    shortName: "PMAY-Gramin",
    fullName: "Pradhan Mantri Awas Yojana – Gramin",
    authority: "Ministry of Rural Development",
    category: "Housing",
    purpose: "Assistance to build pucca houses for eligible rural households.",
    officialUrl: "https://pmayg.dord.gov.in",
  },
];

export const heroValueProps = [
  "Simple eligibility guidance",
  "Multiple scheme categories",
  "Official application links",
];

export type Feature = { icon: LucideIcon; title: string; text: string };

export const features: Feature[] = [
  {
    icon: UsersRound,
    title: "Discover schemes by life situation",
    text: "Start from who you are — a farmer, a student, a senior citizen — not from scheme names.",
  },
  {
    icon: ListChecks,
    title: "Understand eligibility requirements",
    text: "See which conditions you meet, which do not, and which still need information.",
  },
  {
    icon: ExternalLink,
    title: "Explore official application links",
    text: "Published schemes link to their official government source and portal.",
  },
  {
    icon: HandHeart,
    title: "Designed for simpler access to public services",
    text: "Plain language, keyboard friendly and readable on any phone.",
  },
];
