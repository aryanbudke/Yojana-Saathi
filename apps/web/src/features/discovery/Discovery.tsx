"use client";
import { useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useResource } from "@/lib/api/use-resource";
import {
  Button,
  EmptyState,
  InlineAlert,
  Input,
  Skeleton,
} from "@/components/ui";
import { states } from "@/features/profile/types";
import { useMessages } from "@/i18n/client";
import { format } from "@/i18n/config";
import { categories, queryFromSearch } from "./types";
import { CategoryChip } from "./CategoryChip";
import { SchemeCard } from "./SchemeCard";
export function Discovery() {
  const m = useMessages();
  const t = m.discover;
  const search = useSearchParams();
  const pathname = usePathname();
  const query = search.toString();
  const load = useCallback(() => api.schemes(queryFromSearch(query)), [query]);
  const r = useResource(load);
  function update(next: URLSearchParams) {
    next.delete("cursor");
    window.history.pushState(
      null,
      "",
      `${pathname}${next.size ? "?" + next.toString() : ""}#browse`,
    );
  }
  return (
    <section
      id="browse"
      className="browse-section"
      aria-labelledby="browse-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t.browseEyebrow}</p>
          <h2 id="browse-title">{t.browseTitle}</h2>
        </div>
        <span className="small muted">{t.browseNote}</span>
      </div>
      <div className="category-chips" aria-label={t.categoriesLabel}>
        {categories.map((c) => (
          <CategoryChip
            key={c.value}
            label={m.categoryAudience[c.value]}
            icon={c.icon}
            selected={search.get("category") === c.value}
            onClick={() => {
              const next = new URLSearchParams(query);
              if (next.get("category") === c.value) next.delete("category");
              else next.set("category", c.value);
              update(next);
            }}
          />
        ))}
      </div>
      <form
        key={query}
        className="search-form"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const next = new URLSearchParams(query);
          for (const key of ["q", "state_code"]) {
            const value = String(data.get(key) ?? "").trim();
            if (value) next.set(key, value);
            else next.delete(key);
          }
          update(next);
        }}
      >
        <div className="search-input">
          <Search size={18} aria-hidden="true" />
          <label className="sr-only" htmlFor="scheme-search">
            {t.searchLabel}
          </label>
          <Input
            id="scheme-search"
            name="q"
            maxLength={200}
            defaultValue={search.get("q") ?? ""}
            placeholder={t.searchPlaceholder}
          />
        </div>
        <label className="sr-only" htmlFor="scheme-state">
          {t.stateLabel}
        </label>
        <select
          id="scheme-state"
          name="state_code"
          className="input"
          defaultValue={search.get("state_code") ?? ""}
        >
          <option value="">{t.allStates}</option>
          {states.map((code) => (
            <option value={code} key={code}>
              {m.states[code]}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          {t.search}
          <ArrowRight size={16} />
        </Button>
        {query && (
          <Button
            type="button"
            variant="quiet"
            onClick={() => update(new URLSearchParams())}
          >
            {t.clearFilters}
          </Button>
        )}
      </form>
      <div aria-live="polite" className="result-count">
        {r.loading
          ? t.finding
          : r.data
            ? format(
                r.data.items.length === 1 ? t.resultsOne : t.resultsOther,
                { count: r.data.items.length },
              )
            : ""}
      </div>
      {r.error && (
        <>
          <InlineAlert error>{r.error}</InlineAlert>
          <Button variant="secondary" onClick={r.retry}>
            {m.common.tryAgain}
          </Button>
        </>
      )}
      {r.loading ? (
        <div className="scheme-grid">
          <Skeleton />
          <Skeleton />
        </div>
      ) : r.data?.items.length ? (
        <>
          <div className="scheme-grid">
            {r.data.items.map((s) => (
              <SchemeCard key={s.id} scheme={s} />
            ))}
          </div>
          {r.data.next_cursor && (
            <Button
              variant="secondary"
              onClick={() => {
                const next = new URLSearchParams(query);
                next.set("cursor", r.data!.next_cursor!);
                window.history.pushState(
                  null,
                  "",
                  `${pathname}?${next.toString()}#browse`,
                );
              }}
            >
              {t.nextPage}
              <ArrowRight size={16} />
            </Button>
          )}
        </>
      ) : (
        !r.error && (
          // No filters and nothing listed means the catalogue itself is empty.
          query ? (
            <EmptyState title={t.emptyTitle}>
              <p>{t.emptyText}</p>
              <Button
                variant="quiet"
                onClick={() => update(new URLSearchParams())}
              >
                {t.clearFilters}
              </Button>
            </EmptyState>
          ) : (
            <EmptyState title={t.catalogueEmptyTitle}>
              <p>{t.catalogueEmptyText}</p>
            </EmptyState>
          )
        )
      )}
    </section>
  );
}
