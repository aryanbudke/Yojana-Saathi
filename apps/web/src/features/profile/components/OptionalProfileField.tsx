"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { type ProfileField, supportCategoryOptions } from "../types";
import { fieldValue } from "../model";
import type { ProfileFacts } from "@/lib/api/contracts";
import { useMessages } from "@/i18n/client";

export interface OptionalProfileFieldProps {
  field: ProfileField;
  value: ProfileFacts[ProfileField];
  onChange: (value: ProfileFacts[ProfileField]) => void;
  disabled?: boolean;
}

export function OptionalProfileField({
  field,
  value,
  onChange,
  disabled = false,
}: OptionalProfileFieldProps) {
  const m = useMessages();
  const t = m.profile;
  const id = `fact-${field}`;
  const [customCategory, setCustomCategory] = useState(false);

  if (field === "age") {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-xs font-bold text-[#102A24]"
          >
            {m.fields.age}
          </label>
          <span className="text-xs font-medium text-[#3D4B44]">
            Optional
          </span>
        </div>
        <Input
          id={id}
          disabled={disabled}
          type="number"
          min={0}
          max={120}
          value={value === null ? "" : String(value)}
          placeholder="e.g. 24"
          onChange={(e) => onChange(fieldValue("number", e.target.value))}
          className="w-full bg-white text-sm"
        />
      </div>
    );
  }

  if (field === "family_income_inr") {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-xs font-bold text-[#102A24]"
          >
            {m.fields.family_income_inr}
          </label>
          <span className="text-xs font-medium text-[#3D4B44]">
            Optional
          </span>
        </div>

        <div className="relative">
          <span
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-bold select-none text-sm pointer-events-none"
            aria-hidden="true"
          >
            {t.currencySymbol}
          </span>
          <Input
            id={id}
            disabled={disabled}
            type="number"
            min={0}
            max={1000000000}
            value={value === null ? "" : String(value)}
            placeholder="e.g. 150000"
            onChange={(e) => onChange(fieldValue("number", e.target.value))}
            className="w-full bg-white text-sm pl-8"
          />
        </div>
      </div>
    );
  }


  if (field === "category") {
    const currentVal = value === null ? "" : String(value);

    return (
      <div className="space-y-2 sm:col-span-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-xs font-bold text-[#102A24]"
          >
            {m.fields.category}
          </label>
          <span className="text-xs font-medium text-[#3D4B44]">
            Optional
          </span>
        </div>



        {!customCategory ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {supportCategoryOptions.map((opt) => {
                const isSelected = currentVal.toLowerCase() === opt.value.toLowerCase();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(isSelected ? null : opt.value)}
                    className={`text-xs py-1.5 px-3 rounded-full font-medium transition-all ${
                      isSelected
                        ? "bg-[#165541] text-white shadow-xs"
                        : "bg-white/80 hover:bg-white text-[#102A24] border border-stone-200/90"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
              <button
                type="button"
                disabled={disabled}
                onClick={() => setCustomCategory(true)}
                className="text-xs py-1.5 px-3 rounded-full font-medium text-[#165541] hover:underline underline-offset-2"
              >
                + Type custom
              </button>
            </div>
            {/* Hidden or read-only input so accessibility & standard form fields work */}
            <input
              type="hidden"
              id={id}
              value={currentVal}
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              id={id}
              disabled={disabled}
              type="text"
              maxLength={80}
              value={currentVal}
              placeholder={t.supportNeedPlaceholder}
              onChange={(e) => onChange(fieldValue("text", e.target.value))}
              className="w-full bg-white text-sm"
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => setCustomCategory(false)}
              className="text-xs text-stone-500 hover:text-stone-800 whitespace-nowrap px-2 py-1"
            >
              Choose preset
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
