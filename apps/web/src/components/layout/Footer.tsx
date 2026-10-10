import React from "react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Disclaimer } from "@/components/ui";
import { format } from "@/i18n/config";
import { getMessages } from "@/i18n/server";
import type { Messages } from "@/i18n/messages/en";

type FooterKey = keyof Messages["footer"];
const groups: { title: FooterKey; links: [FooterKey, string][] }[] = [
  {
    title: "product",
    links: [
      ["home", "/"],
      ["discover", "/discover"],
      ["howItWorks", "/#how-it-works"],
      ["profile", "/profile"],
      ["recommendations", "/recommendations"],
    ],
  },
  {
    title: "support",
    links: [
      ["guide", "/guide"],
      ["helpCenter", "/help"],
      ["faq", "/help#faq"],
      ["about", "/about"],
    ],
  },
  {
    title: "legal",
    links: [
      ["privacy", "/privacy"],
      ["disclaimer", "/disclaimer"],
      ["nationalPortal", "https://www.india.gov.in/"],
    ],
  },
];

export async function Footer() {
  const m = await getMessages();
  return (
    <footer className="w-full mt-24 bg-[#022c2b] text-white py-14 relative overflow-hidden">
      {/* Decorative leaf motif watermark outline in bottom-right corner */}
      <div className="absolute bottom-0 right-0 w-56 h-56 pointer-events-none select-none opacity-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/botanical-leaf.png"
          alt=""
          className="w-full h-full object-contain filter invert brightness-200"
          aria-hidden="true"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <Link className="brand inline-block text-white" href="/" aria-label={m.nav.homeLink}>
              <Brand />
            </Link>
            <p className="text-[#e9dca4]/70 text-sm max-w-sm leading-relaxed">
              {m.footer.tagline}
            </p>
            <p className="text-xs text-[#d8c98a] font-medium">
              {m.footer.madeFor}
            </p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {groups.map(({ title, links }) => (
              <div key={title} className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#D8C5A1]">
                  {m.footer[title]}
                </h3>
                <ul className="space-y-2">
                  {links.map(([label, href]) => (
                    <li key={href}>
                      {href.startsWith("http") ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#e9dca4]/70 hover:text-white transition-colors"
                        >
                          {m.footer[label]}
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="text-sm text-[#e9dca4]/70 hover:text-white transition-colors"
                        >
                          {m.footer[label]}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#d8c98a]">
          <span>© {format(m.footer.copyright, { year: new Date().getFullYear() })}</span>
          <div className="max-w-xl text-center sm:text-right text-[#d8c98a] [&_.disclaimer]:text-[#d8c98a]">
            <Disclaimer />
          </div>
        </div>
      </div>
    </footer>
  );
}
