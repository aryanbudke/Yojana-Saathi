import React from "react";
import { ArrowRight } from "lucide-react";
import { Skeleton, EmptyState, Button, InlineAlert } from "@/components/ui";
import { SchemeCard } from "./SchemeCard";
import type { SchemeSummary } from "@/lib/api/contracts";

export interface SchemeGridProps {
  loading: boolean;
  error?: string;
  items: SchemeSummary[];
  nextCursor?: string | null;
  onNextPage?: () => void;
  onClearFilters?: () => void;
  onRetry?: () => void;
}

export function SchemeGrid({
  loading,
  error,
  items,
  nextCursor,
  onNextPage,
  onClearFilters,
  onRetry,
}: SchemeGridProps) {
  if (error) {
    return (
      <div className="space-y-4 my-8">
        <InlineAlert error>{error}</InlineAlert>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="scheme-grid grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="my-10">
        <EmptyState title="No schemes found for these filters">
          <p>
            Try selecting another category or broadening your search keywords.
            National schemes are included when applicable.
          </p>
          {onClearFilters && (
            <Button variant="quiet" onClick={onClearFilters}>
              Clear all filters
            </Button>
          )}
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-8 my-8">
      <div className="scheme-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>

      {nextCursor && onNextPage && (
        <div className="flex justify-center pt-4">
          <Button variant="secondary" onClick={onNextPage}>
            <span>Next page</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
