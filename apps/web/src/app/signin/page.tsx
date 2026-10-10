import type { Metadata } from "next";
import { SignIn1 } from "@/components/ui/modern-stunning-sign-in";
import { getMessages } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages();
  return {
    title: `${m.auth.signInTitle} — yojana saathi`,
    description: m.auth.signInLead,
  };
}

export default function SignInPage() {
  return <SignIn1 />;
}
