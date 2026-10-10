import React from "react";
import { discoveryCategories } from "../types";
import { cn } from "@/lib/utils";

export interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div
      className="category-chips flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none"
      role="group"
      aria-label="Support categories"
    >
      {discoveryCategories.map((c) => {
        const Icon = c.icon;
        const isSelected = selectedCategory === c.value;

        return (
          <button
            key={c.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectCategory(isSelected ? null : c.value)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0",
              "border backdrop-blur-md shadow-xs",
              isSelected
                ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-400 shadow-md shadow-emerald-700/25 scale-[1.02]"
                : "bg-cream/80 text-slate-700 border-white/90 hover:bg-cream hover:border-emerald-300 hover:text-emerald-900",
            )}
          >
            <Icon size={16} aria-hidden="true" className={isSelected ? "text-amber-300" : "text-emerald-700"} />
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
