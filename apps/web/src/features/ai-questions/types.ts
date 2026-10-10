import type { NextQuestion } from "@/lib/api/contracts";

export interface AIQuestionState {
  question: NextQuestion | null;
  loading: boolean;
  error?: string;
}
