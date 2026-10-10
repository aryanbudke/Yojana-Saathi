"use client";

import React from "react";
import { ProfileConfirmation } from "@/features/profile/ProfileConfirmation";

export interface ProfileEditorProps {
  onConfirmed?: () => void;
}

export function ProfileEditor({ onConfirmed }: ProfileEditorProps) {
  return <ProfileConfirmation onConfirmed={onConfirmed} />;
}
