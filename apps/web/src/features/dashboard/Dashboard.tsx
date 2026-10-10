"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CircleHelp,
  Compass,
  FileCheck2,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  MapPin,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  Badge,
  Button,
  InlineAlert,
  Skeleton,
  SourceLink,
} from "@/components/ui";
import { useProfile } from "@/features/profile/hooks";
import { fields, states } from "@/features/profile/types";
import { ModeNotice } from "@/features/profile/ProfileComposer";
import { useMatching } from "@/features/matching/hooks";
import { MatchCard } from "@/features/matching/MatchCard";
import { categories } from "@/features/discovery/types";
import { api } from "@/lib/api";
import { useResource } from "@/lib/api/use-resource";
import { displayDate } from "@/lib/format";
import { dashboardSummary, profileDisplay } from "./model";

function CataloguePreview() {
  const load = useCallback(
    () => api.schemes(new URLSearchParams({ limit: "3" })),
    [],
  );
  const resource = useResource(load);
  return (
    <section
      className="dashboard-panel dashboard-catalogue"
      aria-labelledby="catalogue-title"
    >
      <div className="dashboard-section-heading">
        <div>
          <p className="eyebrow">Explore your options</p>
          <h2 id="catalogue-title">From the scheme catalogue</h2>
        </div>
        <Link className="text-link" href="/discover#browse">
          Browse all <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <p className="muted small">
        Published scheme information. These are not personalized matches.
      </p>
      {resource.loading ? (
        <Skeleton />
      ) : resource.error ? (
        <div className="stack">
          <InlineAlert error>{resource.error}</InlineAlert>
          <Button variant="secondary" onClick={resource.retry}>
            Retry catalogue
          </Button>
        </div>
      ) : resource.data?.items.length ? (
        <div className="dashboard-catalogue-list">
          {resource.data.items.slice(0, 3).map((scheme) => (
            <article key={scheme.id}>
              <span className="dashboard-icon">
                <FileCheck2 size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="small muted">
                  {scheme.government_level === "central"
                    ? "Central government"
                    : "State government"}{" "}
                  · {scheme.category}
                </p>
                <h3>
                  <Link href={`/schemes/${scheme.id}`}>{scheme.name}</Link>
                </h3>
                <p className="small muted">{scheme.summary}</p>
                <div className="dashboard-source">
                  <span>
                    Last verified {displayDate(scheme.last_verified_at)}
                  </span>
                  <SourceLink url={scheme.official_sources[0].official_url} />
                </div>
              </div>
              <Link
                className="dashboard-arrow"
                href={`/schemes/${scheme.id}`}
                aria-label={`Read about ${scheme.name}`}
              >
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="dashboard-inline-empty">
          No published schemes are available right now. You can still review
          your profile.
        </p>
      )}
    </section>
  );
}

export function Dashboard() {
  const profile = useProfile();
  const matching = useMatching();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!profile.session) return;
    const delay = Math.max(
      0,
      Date.parse(profile.session.expires_at) - Date.now(),
    );
    const timer = setTimeout(
      () => setNow(Date.now()),
      Math.min(delay + 1, 2_147_483_647),
    );
    return () => clearTimeout(timer);
  }, [profile.session]);
  const summary = dashboardSummary({
    facts: profile.draft.facts,
    confirmed: profile.confirmed,
    session: profile.session,
    matches: matching.matches,
    matchKey: matching.key,
    now,
  });
  const results = summary.current?.results;
  const nextScheme = results?.find((match) => match.status !== "not_eligible");
  function reviewProfile() {
    profile.setReviewing(true);
  }
  const steps = [
    {
      label: "Review your details",
      text: summary.active
        ? "Your details are confirmed for this session."
        : "Add what you know. You can leave other details unknown.",
      href: "/discover#profile-review",
      done: summary.active,
      action: summary.active ? "Edit details" : "Review details",
      onClick: reviewProfile,
    },
    {
      label: "Check relevant schemes",
      text: summary.current
        ? "See the checked conditions and any information still needed."
        : "Get a shortlist after confirming your profile.",
      href: summary.active ? "/recommendations" : "/discover#profile-review",
      done: Boolean(summary.current),
      action: summary.current ? "View checks" : "Check schemes",
      onClick: summary.active ? undefined : reviewProfile,
    },
    {
      label: "Prepare your next step",
      text: "Read the official requirements before preparing an application.",
      href: nextScheme
        ? `/schemes/${nextScheme.scheme_id}/apply`
        : "/discover#browse",
      done: false,
      action: nextScheme ? "Open guidance" : "Explore schemes",
      onClick: undefined,
    },
  ];
  return (
    <>
      <ModeNotice />
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-workspace-label">
            <span className="dashboard-icon">
              <UserRound size={20} aria-hidden="true" />
            </span>
            <div>
              <strong>Your workspace</strong>
              <span>Guest access</span>
            </div>
          </div>
          <nav aria-label="Dashboard sections">
            <a href="#dashboard-overview" className="dashboard-nav-active">
              <LayoutDashboard size={18} aria-hidden="true" />
              Overview
            </a>
            <a href="#dashboard-profile">
              <UserRound size={18} aria-hidden="true" />
              My profile
            </a>
            <a href="#dashboard-recommendations">
              <ListChecks size={18} aria-hidden="true" />
              My schemes
            </a>
            <Link href="/discover#browse">
              <Compass size={18} aria-hidden="true" />
              Explore schemes
            </Link>
            <Link href="/help">
              <CircleHelp size={18} aria-hidden="true" />
              Help & guidance
            </Link>
          </nav>
          <div className="dashboard-privacy">
            <LockKeyhole size={19} aria-hidden="true" />
            <strong>Your details stay private</strong>
            <p>
              Your profile stays in this tab’s memory. Refreshing clears it.
              Server sessions expire automatically.
            </p>
            <Link className="text-link" href="/help">
              How your data is used{" "}
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </aside>
        <div className="dashboard-content" id="dashboard-overview">
          <div className="dashboard-breadcrumb">
            <Link href="/discover">Home</Link>
            <span aria-hidden="true">/</span>
            <span>My dashboard</span>
          </div>
          <header className="dashboard-heading">
            <div>
              <p className="eyebrow">My dashboard</p>
              <h1>
                Your next step starts here<span className="green">.</span>
              </h1>
              <p>
                A clear view of your details, scheme checks and what to do next.
              </p>
            </div>
            <Link
              className="button primary"
              href="/discover#profile-review"
              onClick={reviewProfile}
            >
              {summary.provided ? "Review my details" : "Create my profile"}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </header>
          {summary.expired && (
            <InlineAlert>
              Your session has expired. Your details are still here. Review and
              confirm them to check schemes again.
            </InlineAlert>
          )}
          <div className="dashboard-stats" aria-label="Your current progress">
            <div>
              <span className="dashboard-icon">
                <UserRound size={20} aria-hidden="true" />
              </span>
              <p>Details provided</p>
              <strong>
                {summary.provided}
                <small> / {summary.totalFields}</small>
              </strong>
              <span>Other details stay unknown</span>
            </div>
            <div>
              <span className="dashboard-icon">
                <FileCheck2 size={20} aria-hidden="true" />
              </span>
              <p>Schemes checked</p>
              <strong>{results ? results.length : "—"}</strong>
              <span>
                {results
                  ? "From your last completed check"
                  : "Confirm your profile to begin"}
              </span>
            </div>
            <div>
              <span className="dashboard-icon">
                <CircleHelp size={20} aria-hidden="true" />
              </span>
              <p>Need more information</p>
              <strong>{summary.needsInformation ?? "—"}</strong>
              <span>
                {summary.manualReview
                  ? `${summary.manualReview} also need manual review`
                  : "Unknown conditions are never assumed"}
              </span>
            </div>
          </div>
          <div className="dashboard-main-grid">
            <div className="dashboard-primary-column">
              <section
                className="dashboard-panel dashboard-next-steps"
                aria-labelledby="next-steps-title"
              >
                <div className="dashboard-section-heading">
                  <div>
                    <p className="eyebrow">One step at a time</p>
                    <h2 id="next-steps-title">Continue your journey</h2>
                  </div>
                  <Badge tone={summary.active ? "success" : "neutral"}>
                    {summary.active ? "Profile confirmed" : "Get started"}
                  </Badge>
                </div>
                <ol>
                  {steps.map((step, index) => (
                    <li key={step.label}>
                      <span
                        className={`dashboard-step-number ${step.done ? "done" : ""}`}
                      >
                        {step.done ? (
                          <ShieldCheck size={18} aria-label="Completed" />
                        ) : (
                          String(index + 1).padStart(2, "0")
                        )}
                      </span>
                      <div>
                        <h3>{step.label}</h3>
                        <p>{step.text}</p>
                        <Link
                          className="text-link"
                          href={step.href}
                          onClick={step.onClick}
                        >
                          {step.action}
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
              <section
                id="dashboard-recommendations"
                aria-labelledby="my-schemes-title"
                className="dashboard-recommendations"
              >
                <div className="dashboard-section-heading">
                  <div>
                    <p className="eyebrow">Based on your details</p>
                    <h2 id="my-schemes-title">Your scheme checks</h2>
                  </div>
                  {summary.current && (
                    <Link className="text-link" href="/recommendations">
                      View all <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  )}
                </div>
                {results?.length ? (
                  <div className="stack">
                    {results.slice(0, 2).map((match) => (
                      <MatchCard key={match.scheme_id} match={match} />
                    ))}
                    <p className="small muted">
                      These checks provide preliminary guidance. They do not
                      indicate approval.
                    </p>
                  </div>
                ) : (
                  <div className="dashboard-panel dashboard-empty">
                    <span className="dashboard-empty-icon">
                      <Compass size={28} aria-hidden="true" />
                    </span>
                    <h3>
                      {summary.current
                        ? "No matches in your latest check"
                        : summary.active
                          ? "Your profile is ready"
                          : "Let’s find the support relevant to you"}
                    </h3>
                    <p>
                      {summary.current
                        ? "Review your details or browse schemes for another kind of support."
                        : summary.active
                          ? "Check scheme conditions to bring your shortlist into this dashboard."
                          : "Start with your state, occupation and the support you need. We’ll help you understand the published conditions."}
                    </p>
                    <Link
                      className="button secondary"
                      href={
                        summary.active
                          ? "/recommendations"
                          : "/discover#profile-review"
                      }
                      onClick={summary.active ? undefined : reviewProfile}
                    >
                      {summary.active ? "Check my schemes" : "Add my details"}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </section>
            </div>
            <aside className="dashboard-secondary-column">
              <section
                className="dashboard-panel dashboard-profile"
                id="dashboard-profile"
                aria-labelledby="dashboard-profile-title"
              >
                <div className="dashboard-section-heading">
                  <h2 id="dashboard-profile-title">My profile</h2>
                  <Link
                    className="dashboard-arrow"
                    href="/discover#profile-review"
                    onClick={reviewProfile}
                    aria-label="Edit my profile"
                  >
                    <Pencil size={18} aria-hidden="true" />
                  </Link>
                </div>
                <div className="dashboard-profile-identity">
                  <span className="dashboard-avatar">
                    <UserRound size={25} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>Guest profile</strong>
                    <span>
                      <MapPin size={13} aria-hidden="true" />
                      {states.find(
                        ([code]) => code === profile.draft.facts.state_code,
                      )?.[1] ?? "State not provided"}
                    </span>
                  </div>
                </div>
                <Badge tone={summary.active ? "success" : "warning"}>
                  {summary.active
                    ? "Confirmed by you"
                    : summary.provided
                      ? "Awaiting your confirmation"
                      : "Not started"}
                </Badge>
                <dl>
                  {fields
                    .slice(0, 4)
                    .filter((field) => field.key !== "state_code")
                    .map((field) => (
                      <div key={field.key}>
                        <dt>{field.label}</dt>
                        <dd>
                          {profileDisplay(profile.draft.facts[field.key])}
                        </dd>
                      </div>
                    ))}
                </dl>
                <Link
                  className="button secondary wide"
                  href="/discover#profile-review"
                  onClick={reviewProfile}
                >
                  Review all details <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <p className="small muted">
                  Only share what’s needed. Don’t enter Aadhaar numbers.
                </p>
              </section>
              <section
                className="dashboard-support"
                aria-labelledby="dashboard-help-title"
              >
                <span className="dashboard-icon">
                  <ShieldCheck size={21} aria-hidden="true" />
                </span>
                <h2 id="dashboard-help-title">Know before you apply</h2>
                <p>
                  Check the conditions, keep your documents ready and use the
                  official application portal.
                </p>
                <Link className="text-link" href="/help">
                  How it works <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </section>
            </aside>
          </div>
          <CataloguePreview />
          <section
            className="dashboard-categories"
            aria-labelledby="dashboard-categories-title"
          >
            <h2 id="dashboard-categories-title">
              What support are you looking for?
            </h2>
            <div>
              {categories.map(({ label, value, icon: Icon }) => (
                <Link key={value} href={`/discover?category=${value}#browse`}>
                  <Icon size={19} aria-hidden="true" />
                  <span>{label}</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
