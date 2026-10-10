import type { Metadata } from "next";
import { Dashboard } from "@/features/dashboard/Dashboard";
import "./dashboard.css";

export const metadata: Metadata = {
  title: "My dashboard — yojana saathi",
  description:
    "Review your profile, scheme checks and next steps in your guest workspace.",
};

export default function DashboardPage() {
  return <Dashboard />;
}
