import type { Metadata } from "next";
import { SignUp1 } from "@/components/ui/modern-stunning-sign-in";
import { getMessages } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages();
  return {
    title: `${m.auth.signUpTitle} — yojana saathi`,
    description: m.auth.signUpLead,
  };
}

export default function SignUpPage() {
  return <SignUp1 />;
}
