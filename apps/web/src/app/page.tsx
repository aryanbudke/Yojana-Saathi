import { ProfileComposer } from "@/features/profile/ProfileComposer";
import { Discovery } from "@/features/discovery/Discovery";
import { Skeleton } from "@/components/ui";
import { Suspense } from "react";
export default function Home() {
  return (
    <>
      <ProfileComposer />
      <Suspense fallback={<Skeleton />}>
        <Discovery />
      </Suspense>
    </>
  );
}
