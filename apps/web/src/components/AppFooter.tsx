import Link from "next/link";
import { Brand } from "./Brand";
import { Disclaimer } from "./ui";

const groups = [
  {
    title: "Product",
    links: [
      ["Home", "/"],
      ["Discover schemes", "/discover"],
      ["How it works", "/#how-it-works"],
      ["About", "/about"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Help", "/help"],
      ["FAQ", "/help#faq"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy policy", "/privacy"],
      ["Disclaimer", "/disclaimer"],
    ],
  },
];

export function AppFooter() {
  return (
    <footer className="container site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link className="brand" href="/" aria-label="yojana saathi home">
            <Brand />
          </Link>
          <p>
            Find government support, understand the conditions and prepare your
            next step.
          </p>
          <p className="small muted">Available in English.</p>
        </div>
        <nav aria-label="Footer navigation" className="footer-links">
          {groups.map(({ title, links }) => (
            <div key={title}>
              <h2>{title}</h2>
              <ul>
                {links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} yojana saathi</span>
        <Disclaimer />
      </div>
    </footer>
  );
}
