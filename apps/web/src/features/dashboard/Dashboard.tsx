"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
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
import { Badge, GlassCard, InlineAlert, Skeleton } from "@/components/ui";
import { useProfile } from "@/features/profile/hooks";
import { fields } from "@/features/profile/types";
import { ModeNotice } from "@/features/profile/ProfileComposer";
import { useMatching } from "@/features/matching/hooks";
import { MatchCard } from "@/features/matching/MatchCard";
import { categories } from "@/features/discovery/types";
import { useAuth } from "@/features/auth/AuthProvider";
import { useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import { dashboardSummary } from "./model";
import { CataloguePreview, SavedPreview } from "./Previews";

export function Dashboard() {
  const profile = useProfile();
  const matching = useMatching();
  const { user, loading: authLoading } = useAuth();
  const m = useMessages();
  const t = m.dashboard;
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
  const reviewHref = "/profile#profile-review";
  const reviewProfile = () => profile.setReviewing(true);
  const accountName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";
  const steps = [
    {
      label: t.profileStep,
      text: summary.active ? t.profileConfirmed : t.profileAdd,
      href: reviewHref,
      done: summary.active,
      action: summary.active ? t.editDetails : t.profileStep,
      onClick: reviewProfile,
    },
    {
      label: t.checkStep,
      text: summary.current ? t.checkReady : t.checkLead,
      href: summary.active ? "/recommendations" : reviewHref,
      done: Boolean(summary.current),
      action: summary.current ? t.viewChecks : t.checkStep,
      onClick: summary.active ? undefined : reviewProfile,
    },
    {
      label: t.guidanceStep,
      text: t.guidanceLead,
      href: nextScheme ? `/schemes/${nextScheme.scheme_id}/apply` : "/guide",
      done: false,
      action: nextScheme ? t.openGuidance : m.footer.guide,
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
              <LayoutDashboard size={21} aria-hidden="true" />
            </span>
            <div>
              <strong>{t.workspace}</strong>
              <span>
                {authLoading
                  ? m.common.loading
                  : user
                    ? t.accountAccess
                    : t.guestAccess}
              </span>
            </div>
          </div>
          <nav aria-label={t.sections}>
            <a href="#dashboard-overview" className="dashboard-nav-active">
              <LayoutDashboard size={18} aria-hidden="true" />
              {t.overview}
            </a>
            <a href="#dashboard-profile">
              <UserRound size={18} aria-hidden="true" />
              {m.footer.profile}
            </a>
            <a href="#dashboard-recommendations">
              <ListChecks size={18} aria-hidden="true" />
              {t.mySchemes}
            </a>
            <a href="#dashboard-saved">
              <Bookmark size={18} aria-hidden="true" />
              {m.nav.saved}
            </a>
            <Link href="/discover#browse">
              <Compass size={18} aria-hidden="true" />
              {m.common.exploreSchemes}
            </Link>
            <Link href="/help">
              <CircleHelp size={18} aria-hidden="true" />
              {t.help}
            </Link>
          </nav>
          <div className="dashboard-privacy">
            <LockKeyhole size={20} aria-hidden="true" />
            <strong>{t.privacyTitle}</strong>
            <p>
              {authLoading
                ? t.accountLoading
                : user
                  ? t.accountPrivacy
                  : t.guestPrivacy}
            </p>
            <Link className="text-link" href="/privacy">
              {t.privacyAction}
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </aside>
        <div className="dashboard-content" id="dashboard-overview">
          <div className="dashboard-breadcrumb">
            <Link href="/">{m.nav.home}</Link>
            <span aria-hidden="true">/</span>
            <span>{m.nav.dashboard}</span>
          </div>
          <header className="dashboard-heading">
            <div>
              <p className="section-eyebrow">{m.nav.dashboard}</p>
              <h1>{t.title}</h1>
              <p>{t.lead}</p>
            </div>
            <Link
              className="button primary"
              href={reviewHref}
              onClick={reviewProfile}
            >
              {summary.provided ? t.reviewDetails : t.createProfile}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </header>
          {summary.expired && <InlineAlert>{t.sessionExpired}</InlineAlert>}
          <div className="dashboard-stats" aria-label={t.progress}>
            <GlassCard className="dashboard-stat">
              <span className="dashboard-icon">
                <UserRound size={20} aria-hidden="true" />
              </span>
              <p>{t.detailsProvided}</p>
              <strong>
                {summary.provided}
                <small> / {summary.totalFields}</small>
              </strong>
              <span>{t.unknownRemain}</span>
            </GlassCard>
            <GlassCard className="dashboard-stat">
              <span className="dashboard-icon">
                <FileCheck2 size={20} aria-hidden="true" />
              </span>
              <p>{t.checked}</p>
              <strong>{results?.length ?? "—"}</strong>
              <span>
                {summary.current ? t.conditionsReviewed : t.confirmFirst}
              </span>
            </GlassCard>
            <GlassCard className="dashboard-stat">
              <span className="dashboard-icon">
                <CircleHelp size={20} aria-hidden="true" />
              </span>
              <p>{t.needsInformation}</p>
              <strong>{summary.needsInformation ?? "—"}</strong>
              <span>{t.unknownNotAssumed}</span>
            </GlassCard>
          </div>
          <div className="dashboard-main-grid">
            <div className="dashboard-primary-column">
              <GlassCard
                as="section"
                className="dashboard-panel dashboard-next-steps"
                aria-labelledby="next-steps-title"
              >
                <div className="dashboard-section-heading">
                  <div>
                    <p className="section-eyebrow">{t.stepEyebrow}</p>
                    <h2 id="next-steps-title">{t.continueJourney}</h2>
                  </div>
                  <Badge tone={summary.active ? "success" : "neutral"}>
                    {summary.active ? m.common.confirmedByYou : t.getStarted}
                  </Badge>
                </div>
                <ol>
                  {steps.map((step, index) => (
                    <li key={step.label}>
                      <span
                        className={`dashboard-step-number ${step.done ? "done" : ""}`}
                      >
                        {step.done ? (
                          <Check size={16} aria-hidden="true" />
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
                          <ArrowRight size={15} aria-hidden="true" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ol>
              </GlassCard>
              <section
                id="dashboard-recommendations"
                aria-labelledby="my-schemes-title"
                className="dashboard-recommendations"
              >
                <div className="dashboard-section-heading">
                  <div>
                    <p className="section-eyebrow">{t.schemeEyebrow}</p>
                    <h2 id="my-schemes-title">{t.schemeChecks}</h2>
                  </div>
                  {summary.current && (
                    <Link className="text-link" href="/recommendations">
                      {t.viewAll}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  )}
                </div>
                {results?.length ? (
                  <div className="stack">
                    {results.slice(0, 2).map((match) => (
                      <MatchCard key={match.scheme_id} match={match} />
                    ))}
                    {Boolean(summary.manualReview) && (
                      <p className="small muted">
                        {format(t.manualReviewCount, {
                          count: summary.manualReview ?? 0,
                        })}
                      </p>
                    )}
                    <p className="small muted">{t.preliminary}</p>
                  </div>
                ) : (
                  <GlassCard className="dashboard-panel dashboard-empty">
                    <span className="dashboard-empty-icon">
                      <Compass size={27} aria-hidden="true" />
                    </span>
                    <h3>
                      {summary.current
                        ? t.emptyCheckedTitle
                        : summary.active
                          ? t.readyTitle
                          : t.emptyTitle}
                    </h3>
                    <p>
                      {summary.current
                        ? t.emptyCheckedLead
                        : summary.active
                          ? t.readyLead
                          : t.emptyLead}
                    </p>
                    <Link
                      className="button secondary"
                      href={summary.active ? "/recommendations" : reviewHref}
                      onClick={summary.active ? undefined : reviewProfile}
                    >
                      {summary.active ? t.checkSchemes : t.createProfile}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </GlassCard>
                )}
              </section>
              <SavedPreview />
            </div>
            <aside className="dashboard-secondary-column">
              <GlassCard
                as="section"
                className="dashboard-panel dashboard-profile"
                id="dashboard-profile"
                aria-labelledby="dashboard-profile-title"
              >
                <div className="dashboard-section-heading">
                  <h2 id="dashboard-profile-title">{m.footer.profile}</h2>
                  <Link
                    className="dashboard-arrow"
                    href={reviewHref}
                    onClick={reviewProfile}
                    aria-label={t.editDetails}
                  >
                    <Pencil size={18} aria-hidden="true" />
                  </Link>
                </div>
                {authLoading ? (
                  <>
                    <p role="status" className="small muted">
                      {t.accountLoading}
                    </p>
                    <Skeleton />
                  </>
                ) : (
                  <>
                    <div className="dashboard-profile-identity">
                      <span className="dashboard-avatar">
                        <UserRound size={25} aria-hidden="true" />
                      </span>
                      <div>
                        <strong>
                          {user
                            ? accountName || t.accountProfile
                            : t.guestProfile}
                        </strong>
                        <span>
                          <MapPin size={13} aria-hidden="true" />
                          {profile.draft.facts.state_code
                            ? m.states[profile.draft.facts.state_code]
                            : t.stateMissing}
                        </span>
                      </div>
                    </div>
                    <Badge tone={summary.active ? "success" : "warning"}>
                      {summary.active
                        ? m.common.confirmedByYou
                        : summary.provided
                          ? t.awaiting
                          : t.notStarted}
                    </Badge>
                    <dl>
                      {fields
                        .slice(0, 4)
                        .filter((field) => field.key !== "state_code")
                        .map((field) => (
                          <div key={field.key}>
                            <dt>{m.fields[field.key]}</dt>
                            <dd>
                              {profile.draft.facts[field.key] === null
                                ? t.notProvided
                                : String(profile.draft.facts[field.key])}
                            </dd>
                          </div>
                        ))}
                    </dl>
                  </>
                )}
                <Link
                  className="button secondary wide"
                  href={reviewHref}
                  onClick={reviewProfile}
                >
                  {t.reviewAll}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <p className="small muted">{m.profile.privacy}</p>
              </GlassCard>
              <GlassCard
                as="section"
                variant="subtle"
                className="dashboard-panel dashboard-support"
                aria-labelledby="dashboard-help-title"
              >
                <span className="dashboard-icon">
                  <ShieldCheck size={22} aria-hidden="true" />
                </span>
                <h2 id="dashboard-help-title">{t.helpTitle}</h2>
                <p>{t.helpLead}</p>
                <Link className="text-link" href="/guide">
                  {m.footer.guide}
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </GlassCard>
              {!authLoading && !user && (
                <GlassCard
                  as="section"
                  className="dashboard-panel dashboard-account"
                >
                  <h2>{m.auth.asideTitle}</h2>
                  <p>{t.signInLead}</p>
                  <Link className="button secondary wide" href="/signin">
                    {m.nav.signIn}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </GlassCard>
              )}
            </aside>
          </div>
          <CataloguePreview />
          <section
            className="dashboard-categories"
            aria-labelledby="dashboard-categories-title"
          >
            <h2 id="dashboard-categories-title">{t.supportTitle}</h2>
            <div>
              {categories.map(({ value, icon: Icon }) => (
                <Link key={value} href={`/discover?category=${value}#browse`}>
                  <Icon size={20} aria-hidden="true" />
                  <span>{m.categoryAudience[value]}</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
