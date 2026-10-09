import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { AppHeader, Disclaimer } from "@/components/ui";
import { ProfileProvider } from "@/features/profile/hooks";
import { MatchingProvider } from "@/features/matching/hooks";
export const metadata: Metadata = {
  title: "yojana saathi — Government schemes, made simple.",
  description:
    "Discover government support, understand the conditions, and prepare your next step. Independent preliminary guidance.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ProfileProvider>
          <MatchingProvider>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <AppHeader />
            <main id="main" className="container">
              {children}
            </main>
            <footer className="container footer">
              <span className="brand-small">yojana saathi.</span>
              <Disclaimer />
            </footer>
          </MatchingProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
