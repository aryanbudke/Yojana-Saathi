import { SchemeDetail } from "@/features/schemes/SchemeDetail";
export default async function Page({
  params,
}: {
  params: Promise<{ schemeId: string }>;
}) {
  const { schemeId } = await params;
  return <SchemeDetail id={schemeId} />;
}
