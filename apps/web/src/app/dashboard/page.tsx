import type { Metadata } from "next";
import { Dashboard } from "@/features/dashboard/Dashboard";
import "./dashboard.css";
import { getMessages } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages();
  return { title: m.dashboard.metaTitle, description: m.dashboard.lead };
}

export default function DashboardPage() {
  return <Dashboard />;
}
