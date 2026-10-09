"use client";

import Link from "next/link";
import { Brand } from "./Brand";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowRight, Globe2, Menu, X } from "lucide-react";
import { cn } from "@/lib/classes";

type NavLink = {
  href: string;
  label: string;
  isActive: (path: string) => boolean;
};

const links: NavLink[] = [
  { href: "/", label: "Home", isActive: (path) => path === "/" },
  {
    href: "/discover",
    label: "Discover schemes",
    isActive: (path) =>
      path.startsWith("/discover") ||
      path.startsWith("/schemes") ||
      path.startsWith("/recommendations"),
  },
  {
    href: "/help",
    label: "How it works",
    isActive: (path) => path === "/help",
  },
  { href: "/about", label: "About", isActive: (path) => path === "/about" },
];

export function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);
  return (
    <header
      className="header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <div className="header-inner">
        <Link
          className="brand"
          href="/"
          aria-label="yojana saathi home"
          onClick={close}
        >
          <Brand />
        </Link>
        <nav
          id="main-navigation"
          className={cn(open && "is-open")}
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.isActive(pathname) ? "page" : undefined}
              onClick={close}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="button primary nav-cta-mobile"
            href="/#finder"
            onClick={close}
          >
            Find my schemes
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </nav>
        <div className="header-actions">
          <span
            className="header-language"
            aria-label="Current language: English"
          >
            <Globe2 size={16} aria-hidden="true" /> English
          </span>
          <Link className="button primary header-cta" href="/#finder">
            Find my schemes
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <button
          ref={trigger}
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  );
}
