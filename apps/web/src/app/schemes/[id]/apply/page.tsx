import React from "react";
import { GuidancePage } from "@/features/guidance/GuidancePage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GuidancePage id={id} />;
}
