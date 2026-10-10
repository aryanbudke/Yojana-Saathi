import React from "react";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { Disclaimer } from "@/components/ui";

const groups = [
  {
    title: "Product",
    links: [
      ["Home", "/"],
      ["Discover schemes", "/discover"],
      ["How it works", "/#how-it-works"],
      ["My Profile", "/profile"],
      ["Recommendations", "/recommendations"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Help center", "/help"],
      ["FAQ", "/help#faq"],
      ["About", "/about"],
    ],
  },
  {
    title: "Legal & Trust",
    links: [
      ["Privacy policy", "/privacy"],
      ["Disclaimer", "/disclaimer"],
      ["National Portal of India", "https://www.india.gov.in/"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full mt-24 bg-[#102A24] text-white py-14 relative overflow-hidden">
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
            <Link className="brand inline-block text-white" href="/" aria-label="yojana saathi home">
              <Brand />
            </Link>
            <p className="text-[#E7EDE7]/70 text-sm max-w-sm leading-relaxed">
              Find government support, understand the conditions and prepare your
              next step with clarity and trust.
            </p>
            <p className="text-xs text-[#D5DDD5] font-medium">
              Made for citizens across India · Available in English
            </p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {groups.map(({ title, links }) => (
              <div key={title} className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#D8C5A1]">
                  {title}
                </h3>
                <ul className="space-y-2">
                  {links.map(([label, href]) => (
                    <li key={href}>
                      {href.startsWith("http") ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#E7EDE7]/70 hover:text-white transition-colors"
                        >
                          {label}
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="text-sm text-[#E7EDE7]/70 hover:text-white transition-colors"
                        >
                          {label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#D5DDD5]">
          <span>© {new Date().getFullYear()} yojana saathi · Independent preliminary guidance</span>
          <div className="max-w-xl text-center sm:text-right text-[#D5DDD5] [&_.disclaimer]:text-[#D5DDD5]">
            <Disclaimer />
          </div>
        </div>
      </div>
    </footer>
  );
}
