"use client";

import React from "react";
import { Edit3, Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { states, type ProfileField, type FieldStatus } from "../types";
import { fieldValue } from "../model";
import type { ProfileFacts } from "@/lib/api/contracts";
import { useMessages } from "@/i18n/client";

export interface ExtractedFieldProps {
  field: ProfileField;
  value: ProfileFacts[ProfileField];
  status: FieldStatus;
  onChange: (value: ProfileFacts[ProfileField]) => void;
  disabled?: boolean;
}

export function ExtractedField({
  field,
  value,
  status,
  onChange,
  disabled = false,
}: ExtractedFieldProps) {
  const m = useMessages();
  const t = m.profile;
  const id = `fact-${field}`;

  const isCorrected = status === "user_corrected";

  return (
    <div className="p-4 rounded-2xl bg-white/70 border border-stone-200/80 shadow-xs hover:border-[#165541]/30 transition-colors space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label
          htmlFor={id}
          className="text-xs font-bold text-[#102A24] tracking-tight"
        >
          {m.fields[field]}
        </label>

        <span
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            isCorrected
              ? "bg-[#165541]/10 text-[#165541] border border-[#165541]/20"
              : "bg-stone-100 text-[#2E3C36] border border-stone-200/60"
          }`}

        >
          {isCorrected ? (
            <>
              <Edit3 size={10} aria-hidden="true" />
              <span>{t.correctedBadge}</span>
            </>
          ) : (
            <>
              <Check size={10} aria-hidden="true" />
              <span>{t.extractedBadge}</span>
            </>
          )}
        </span>
      </div>

      <div>
        {field === "state_code" ? (
          <Select
            id={id}
            disabled={disabled}
            value={value === null ? "" : String(value)}
            onChange={(e) => onChange(fieldValue("state", e.target.value))}
            className="w-full bg-white text-sm"
          >
            <option value="">{m.common.unknown}</option>
            {states.map((code) => (
              <option key={code} value={code}>
                {m.states[code]}
              </option>
            ))}
          </Select>
        ) : field === "land_registration" ? (
          <Select
            id={id}
            disabled={disabled}
            value={value === null ? "" : String(value)}
            onChange={(e) => onChange(fieldValue("choice", e.target.value))}
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
            onChange={(e) => onChange(fieldValue("boolean", e.target.value))}
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
            type={
              field === "age" ||
              field === "family_income_inr" ||
              field === "land_area_acres"
                ? "number"
                : "text"
            }
            min={
              field === "age" ||
              field === "family_income_inr" ||
              field === "land_area_acres"
                ? 0
                : undefined
            }
            max={
              field === "age"
                ? 120
                : field === "family_income_inr"
                  ? 1000000000
                  : field === "land_area_acres"
                    ? 1000000
                    : undefined
            }
            step={field === "land_area_acres" ? "any" : 1}
            maxLength={
              field === "occupation" ? 120 : field === "gender" ? 40 : 80
            }
            value={value === null ? "" : String(value)}
            placeholder={m.common.unknown}
            onChange={(e) =>
              onChange(
                fieldValue(
                  field === "age" ||
                    field === "family_income_inr" ||
                    field === "land_area_acres"
                    ? "number"
                    : "text",
                  e.target.value,
                ),
              )
            }
            className="w-full bg-white text-sm"
          />
        )}
      </div>
    </div>
  );
}
