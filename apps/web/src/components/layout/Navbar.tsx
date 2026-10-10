"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, ChevronRight, Menu, X } from "lucide-react";
import { Brand } from "@/components/Brand";
import { useMessages } from "@/i18n/client";
import type { Messages } from "@/i18n/messages/en";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "@/features/auth/AuthProvider";

interface NavLink {
  href: string;
  label: keyof Messages["nav"];
  isActive: (path: string) => boolean;
}

/** Primary destinations; profile editing is available within the dashboard. */
const navLinks: NavLink[] = [
  { href: "/", label: "home", isActive: (p) => p === "/" },
  {
    href: "/discover",
    label: "discover",
    isActive: (p) =>
      p.startsWith("/discover") ||
      p.startsWith("/schemes") ||
      p.startsWith("/guide"),
  },
  {
    href: "/recommendations",
    label: "matches",
    isActive: (p) =>
      p.startsWith("/recommendations") || p.startsWith("/eligibility"),
  },
  {
    href: "/dashboard",
    label: "dashboard",
    isActive: (p) => p.startsWith("/dashboard") || p.startsWith("/profile"),
  },
  { href: "/saved", label: "saved", isActive: (p) => p.startsWith("/saved") },
];

/** The AI composer at the top of /discover: the one personalised matching flow. */
const CTA_HREF = "/discover";
const SCROLL_THRESHOLD_PX = 8;
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function Navbar() {
  const m = useMessages();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > SCROLL_THRESHOLD_PX,
    () => false,
  );

  // The native modal dialog traps focus, makes the page inert, closes on Escape
  // and returns focus to the menu button; we add the scroll lock.
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    if (open && !drawer.open) drawer.showModal();
    if (!open && drawer.open) drawer.close();
    document.documentElement.classList.toggle("nav-locked", open);
    if (!open) return;
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const closeOnDesktop = (e: MediaQueryListEvent) =>
      e.matches && setOpen(false);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      document.documentElement.classList.remove("nav-locked");
    };
  }, [open]);

  const close = () => setOpen(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      close();
      router.push("/signin");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="site-header" data-scrolled={scrolled || undefined}>
      <div className="site-header-inner">
        <Link className="brand site-brand" href="/" aria-label={m.nav.homeLink}>
          <Brand />
        </Link>

        <nav className="site-nav" aria-label={m.nav.mainNavigation}>
          {navLinks.map((link) => {
            const active = link.isActive(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="site-nav-link"
                aria-current={active ? "page" : undefined}
              >
                {m.nav[link.label]}
              </Link>
            );
          })}
        </nav>

        <div className="site-actions">
          <LanguageSwitcher className="site-language" />
          {!authLoading &&
            (user ? (
              <button
                type="button"
                className="site-auth-link"
                disabled={signingOut}
                onClick={handleSignOut}
              >
                {signingOut ? m.nav.signingOut : m.nav.signOut}
              </button>
            ) : (
              <Link
                className="site-auth-link"
                href="/signin"
                aria-current={pathname === "/signin" ? "page" : undefined}
              >
                {m.nav.signIn}
              </Link>
            ))}
          <Link className="site-cta" href={CTA_HREF}>
            <span>{m.nav.findMySchemes}</span>
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="site-cta-arrow"
            />
          </Link>
          <button
            type="button"
            className="site-menu-button"
            aria-label={m.nav.openNavigation}
            aria-expanded={open}
            aria-controls="site-drawer"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      <dialog
        id="site-drawer"
        ref={drawerRef}
        className="site-drawer"
        aria-label={m.nav.menu}
        onClose={close}
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div className="site-drawer-panel">
          <div className="site-drawer-head">
            <span className="site-drawer-title">{m.nav.menu}</span>
            <button
              type="button"
              className="site-menu-button site-drawer-close"
              aria-label={m.nav.closeNavigation}
              onClick={close}
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label={m.nav.mainNavigation}>
            <ul className="site-drawer-links">
              {navLinks.map((link) => {
                const active = link.isActive(pathname);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="site-drawer-link"
                      aria-current={active ? "page" : undefined}
                      onClick={close}
                    >
                      <span>{m.nav[link.label]}</span>
                      <ChevronRight size={18} aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
              {!authLoading && (
                <li>
                  {user ? (
                    <button
                      type="button"
                      className="site-drawer-link w-full"
                      disabled={signingOut}
                      onClick={handleSignOut}
                    >
                      <span>
                        {signingOut ? m.nav.signingOut : m.nav.signOut}
                      </span>
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>
                  ) : (
                    <Link
                      href="/signin"
                      className="site-drawer-link"
                      aria-current={pathname === "/signin" ? "page" : undefined}
                      onClick={close}
                    >
                      <span>{m.nav.signIn}</span>
                      <ChevronRight size={18} aria-hidden="true" />
                    </Link>
                  )}
                </li>
              )}
            </ul>
          </nav>
          <LanguageSwitcher className="site-drawer-language" />
          <Link
            className="site-cta site-cta-block"
            href={CTA_HREF}
            onClick={close}
          >
            <span>{m.nav.findMySchemes}</span>
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="site-cta-arrow"
            />
          </Link>
        </div>
      </dialog>
    </header>
  );
}
