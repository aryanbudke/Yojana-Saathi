import { GuidancePage } from "@/features/guidance/GuidancePage";
export default async function Page({
  params,
}: {
  params: Promise<{ schemeId: string }>;
}) {
  const { schemeId } = await params;
  return <GuidancePage id={schemeId} />;
}
