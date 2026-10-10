import React from "react";
import { Search, ArrowRight, X } from "lucide-react";
import { Input, Select, Button } from "@/components/ui";
import { states } from "@/features/profile/types";

export interface SchemeSearchProps {
  query: string;
  stateCode: string;
  hasFilters: boolean;
  onSearch: (q: string, state_code: string) => void;
  onClear: () => void;
}

export function SchemeSearch({
  query,
  stateCode,
  hasFilters,
  onSearch,
  onClear,
}: SchemeSearchProps) {
  return (
    <form
      className="search-form grid grid-cols-1 sm:grid-cols-12 gap-3 my-6"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const q = String(formData.get("q") ?? "");
        const state = String(formData.get("state_code") ?? "");
        onSearch(q, state);
      }}
    >
      <div className="sm:col-span-6 lg:col-span-7">
        <label className="sr-only" htmlFor="scheme-search">
          Search schemes
        </label>
        <Input
          id="scheme-search"
          name="q"
          maxLength={200}
          defaultValue={query}
          placeholder="Search schemes by name, keyword or support…"
          icon={<Search size={18} aria-hidden="true" />}
        />
      </div>

      <div className="sm:col-span-3 lg:col-span-3">
        <label className="sr-only" htmlFor="scheme-state">
          Filter by state
        </label>
        <Select id="scheme-state" name="state_code" defaultValue={stateCode}>
          <option value="">All States + National</option>
          {states.map(([code, label]) => (
            <option value={code} key={code}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="sm:col-span-3 lg:col-span-2 flex items-center gap-2">
        <Button type="submit" variant="primary" className="w-full">
          <span>Search</span>
          <ArrowRight size={15} />
        </Button>
        {hasFilters && (
          <Button
            type="button"
            variant="quiet"
            onClick={onClear}
            className="p-2.5 text-slate-500 hover:text-slate-900"
            aria-label="Clear filters"
          >
            <X size={18} />
          </Button>
        )}
      </div>
    </form>
  );
}
