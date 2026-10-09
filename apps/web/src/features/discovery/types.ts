import {
  Sprout,
  GraduationCap,
  HeartHandshake,
  Sun,
  BriefcaseBusiness,
  House,
} from "lucide-react";
export const categories = [
  { label: "Farmer", value: "agriculture", icon: Sprout },
  { label: "Student", value: "education", icon: GraduationCap },
  { label: "Women", value: "women", icon: HeartHandshake },
  { label: "Senior Citizen", value: "senior_citizen", icon: Sun },
  {
    label: "Small Business",
    value: "entrepreneurship",
    icon: BriefcaseBusiness,
  },
  { label: "Housing", value: "housing", icon: House },
];
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
