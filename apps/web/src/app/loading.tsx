import React from "react";
import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-lg flex items-center justify-center text-emerald-600">
        <LoaderCircle size={28} className="animate-spin" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold text-slate-700">Loading government schemes…</p>
    </div>
  );
}
