import {
  Sprout,
  GraduationCap,
  HeartHandshake,
  Sun,
  BriefcaseBusiness,
  House,
} from "lucide-react";
/** Labels live in messages `categoryAudience`, keyed by value. */
export const categories = [
  { value: "agriculture", icon: Sprout },
  { value: "education", icon: GraduationCap },
  { value: "women", icon: HeartHandshake },
  { value: "senior_citizen", icon: Sun },
  { value: "entrepreneurship", icon: BriefcaseBusiness },
  { value: "housing", icon: House },
] as const;
export function queryFromSearch(search: string) {
  const source = new URLSearchParams(search);
  const result = new URLSearchParams();
  for (const key of ["q", "category", "state_code", "cursor"]) {
    const value = source.get(key);
    if (value) result.set(key, value);
  }
  result.set("limit", "20");
  return result;
}
