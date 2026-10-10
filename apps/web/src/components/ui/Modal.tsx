"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useMessages } from "@/i18n/client";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: ModalProps) {
  const m = useMessages();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  const maxWClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className={cn(
        "fixed inset-0 z-50 m-auto w-full p-4 bg-transparent backdrop:bg-slate-950/40 backdrop:backdrop-blur-md outline-none",
        "animate-reveal",
      )}
    >
      <div
        className={cn(
          "w-full mx-auto relative rounded-3xl bg-cream/90 backdrop-blur-2xl border border-white/90 shadow-2xl p-6 sm:p-8",
          "before:absolute before:inset-x-8 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent",
          maxWClasses[maxWidth],
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
            {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label={m.common.closeModal}
            className="p-2 -mr-2 -mt-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
}
