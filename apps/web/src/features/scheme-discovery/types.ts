import {
  Sprout,
  GraduationCap,
  HeartHandshake,
  Sun,
  BriefcaseBusiness,
  House,
  type LucideIcon,
} from "lucide-react";

export interface CategoryItem {
  label: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  glow?: "emerald" | "saffron" | "cyan" | "indigo";
}

export const discoveryCategories: CategoryItem[] = [
  {
    label: "Farmer & Agriculture",
    value: "agriculture",
    icon: Sprout,
    description: "Farming, crop loans & rural livelihoods",
    glow: "emerald",
  },
  {
    label: "Education & Students",
    value: "education",
    icon: GraduationCap,
    description: "Scholarships, admissions & skill loans",
    glow: "indigo",
  },
  {
    label: "Women & Child Welfare",
    value: "women",
    icon: HeartHandshake,
    description: "Nutrition, maternity & empowerment",
    glow: "saffron",
  },
  {
    label: "Senior Citizens",
    value: "senior_citizen",
    icon: Sun,
    description: "Pensions, social security & healthcare",
    glow: "saffron",
  },
  {
    label: "Small Business & MSME",
    value: "entrepreneurship",
    icon: BriefcaseBusiness,
    description: "Credit support, subsidies & trade",
    glow: "cyan",
  },
  {
    label: "Housing & Shelter",
    value: "housing",
    icon: House,
    description: "Affordable housing & construction aid",
    glow: "cyan",
  },
];

export function queryFromSearch(search: string): URLSearchParams {
  const source = new URLSearchParams(search);
  const result = new URLSearchParams();
  for (const key of ["q", "category", "state_code", "cursor"]) {
    const value = source.get(key);
    if (value) result.set(key, value);
  }
  result.set("limit", "20");
  return result;
}
