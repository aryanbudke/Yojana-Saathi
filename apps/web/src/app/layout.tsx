import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import "@/styles/shell.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PageContainer } from "@/components/layout/PageContainer";
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
      <body className="min-h-screen flex flex-col bg-[#f3e8bc] text-[#022c2b] selection:bg-[#035352] selection:text-white pb-16 md:pb-0">
        <ProfileProvider>
          <MatchingProvider>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <Navbar />
            <PageContainer ambientGlow>
              <main id="main" className="container flex-1">
                {children}
              </main>
            </PageContainer>
            <Footer />
            <MobileBottomNav />
          </MatchingProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
