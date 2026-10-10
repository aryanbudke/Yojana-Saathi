"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button, InlineAlert } from "@/components/ui";
import type { SchemeSummary } from "@/lib/api/contracts";
import { useMessages } from "@/i18n/client";
import { useSavedSchemes } from "../hooks/useSavedSchemes";

export function SaveSchemeButton({ scheme }: { scheme: SchemeSummary }) {
  const m = useMessages();
  const { isSaved, saveScheme, removeScheme } = useSavedSchemes();
  const [error, setError] = useState(false);
  const saved = isSaved(scheme.id);
  const Icon = saved ? BookmarkCheck : Bookmark;
  return (
    <div>
      <Button
        variant="quiet"
        size="sm"
        aria-pressed={saved}
        onClick={() => {
          const success = saved ? removeScheme(scheme.id) : saveScheme(scheme);
          setError(!success);
        }}
      >
        <Icon size={16} aria-hidden="true" />
        {saved ? m.dashboard.removeSaved : m.dashboard.saveScheme}
      </Button>
      {error && <InlineAlert error>{m.errors.generic}</InlineAlert>}
    </div>
  );
}
