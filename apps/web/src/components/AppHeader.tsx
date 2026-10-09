"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Globe2, Menu, X } from "lucide-react";

export function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const links = [
    { href: "/discover", label: "Discover", active: pathname !== "/help" },
    { href: "/help", label: "How it works", active: pathname === "/help" },
  ];
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
          onClick={() => setOpen(false)}
        >
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path
                d="M9 22V11m0 5c0-5 5-8 13-8 0 8-3 13-9 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="m10 22 9-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>
            yojana saathi<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav
          id="main-navigation"
          className={open ? "is-open" : ""}
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <span
          className="header-language"
          aria-label="Current language: English"
        >
          <Globe2 size={16} aria-hidden="true" /> English
        </span>
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
