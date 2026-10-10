"use client";

import React, { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { type ProfileField } from "../types";
import { fieldValue } from "../model";
import type { ProfileFacts } from "@/lib/api/contracts";
import { useMessages } from "@/i18n/client";

export interface AdditionalDetailsAccordionProps {
  fields: ProfileField[];
  facts: ProfileFacts;
  onChange: (field: ProfileField, value: ProfileFacts[ProfileField]) => void;
  disabled?: boolean;
}

export function AdditionalDetailsAccordion({
  fields,
  facts,
  onChange,
  disabled = false,
}: AdditionalDetailsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const m = useMessages();
  const t = m.profile;

  if (fields.length === 0) return null;

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/50 backdrop-blur-xs overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="additional-details-content"
        className="w-full py-4 px-5 flex items-center justify-between text-left hover:bg-stone-50/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#165541]"
      >
        <div className="space-y-0.5">
          <span className="text-sm font-bold text-[#102A24] block">
            {t.accordionTitle}
          </span>
          <span className="text-xs text-[#3D4B44] block">
            {t.accordionSubtitle}
          </span>

        </div>

        <span
          className={`w-7 h-7 rounded-full flex items-center justify-center bg-stone-100/80 text-stone-700 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <ChevronDown size={16} />
        </span>
      </button>

      {isOpen && (
        <div
          id="additional-details-content"
          className="p-5 pt-2 border-t border-stone-200/70 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200"
        >
          {fields.map((field) => {
            const id = `additional-fact-${field}`;
            const value = facts[field];

            return (
              <div key={field} className="space-y-1.5">
                <label
                  htmlFor={id}
                  className="block text-xs font-bold text-[#102A24]"
                >
                  {m.fields[field]}
                  <span className="ml-1.5 text-[11px] font-normal text-[#68736D]">
                    (Optional)
                  </span>
                </label>

                {field === "land_registration" ? (
                  <Select
                    id={id}
                    disabled={disabled}
                    value={value === null ? "" : String(value)}
                    onChange={(e) =>
                      onChange(field, fieldValue("choice", e.target.value))
                    }
                    className="w-full bg-white text-sm"
                  >
                    <option value="">{m.common.unknown}</option>
                    <option value="yes">{m.common.yes}</option>
                    <option value="no">{m.common.no}</option>
                    <option value="not_sure">{m.common.notSure}</option>
                  </Select>
                ) : field === "is_student" || field === "has_disability" ? (
                  <Select
                    id={id}
                    disabled={disabled}
                    value={value === null ? "" : value ? "yes" : "no"}
                    onChange={(e) =>
                      onChange(field, fieldValue("boolean", e.target.value))
                    }
                    className="w-full bg-white text-sm"
                  >
                    <option value="">{m.common.unknown}</option>
                    <option value="yes">{m.common.yes}</option>
                    <option value="no">{m.common.no}</option>
                  </Select>
                ) : (
                  <Input
                    id={id}
                    disabled={disabled}
                    type={field === "land_area_acres" ? "number" : "text"}
                    min={field === "land_area_acres" ? 0 : undefined}
                    max={field === "land_area_acres" ? 1000000 : undefined}
                    step={field === "land_area_acres" ? "any" : undefined}
                    maxLength={field === "gender" ? 40 : 80}
                    value={value === null ? "" : String(value)}
                    placeholder={m.common.unknown}
                    onChange={(e) =>
                      onChange(
                        field,
                        fieldValue(
                          field === "land_area_acres" ? "number" : "text",
                          e.target.value,
                        ),
                      )
                    }
                    className="w-full bg-white text-sm"
                  />
                )}

                {/* Privacy and context explanations for sensitive fields */}
                {field === "social_category" && (
                  <p className="flex items-start gap-1.5 text-xs text-[#3D4B44] font-medium leading-tight">
                    <Info size={13} className="shrink-0 mt-0.5 text-stone-600" aria-hidden="true" />
                    <span>{t.socialCategoryNote}</span>
                  </p>
                )}

                {field === "has_disability" && (
                  <p className="flex items-start gap-1.5 text-xs text-[#3D4B44] font-medium leading-tight">
                    <Info size={13} className="shrink-0 mt-0.5 text-stone-600" aria-hidden="true" />
                    <span>{t.disabilityNote}</span>
                  </p>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
