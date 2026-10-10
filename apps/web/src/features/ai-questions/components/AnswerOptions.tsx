import React from "react";
import { Input } from "@/components/ui/Input";
import { humanize } from "@/lib/utils";
import type { NextQuestion } from "@/lib/api/contracts";

export interface AnswerOptionsProps {
  question: NextQuestion;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AnswerOptions({
  question,
  value,
  onChange,
  disabled = false,
}: AnswerOptionsProps) {
  if (question.answer_type === "single_choice") {
    return (
      <div className="question-options grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
        {question.options.map((option) => {
          const selected = value === option;
          return (
            <label
              key={option}
              className={`radio-option p-4 rounded-2xl border transition-all duration-150 flex items-center gap-3 cursor-pointer select-none backdrop-blur-md ${
                selected
                  ? "bg-emerald-100/90 border-emerald-500 shadow-sm text-emerald-950 font-bold"
                  : "bg-cream/80 border-slate-200/80 text-slate-700 hover:bg-cream hover:border-emerald-300"
              }`}
            >
              <input
                type="radio"
                name="follow-up-answer"
                value={option}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(option)}
                className="w-4 h-4 text-emerald-700 accent-emerald-600 focus:ring-emerald-500"
                required
              />
              <span className="text-sm">{humanize(option)}</span>
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <div className="my-4">
      <label className="sr-only" htmlFor="question-answer">
        {question.question}
      </label>
      <Input
        id="question-answer"
        type={question.answer_type === "number" ? "number" : "text"}
        step={question.field === "land_area_acres" ? "any" : 1}
        value={value}
        maxLength={120}
        required
        disabled={disabled}
        placeholder="Enter your answer…"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
