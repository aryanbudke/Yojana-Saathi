import React from "react";
import { SchemeDetail } from "@/features/schemes/SchemeDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SchemeDetail id={id} />;
}
