"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button, GlassCard, InlineAlert, Input } from "@/components/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { useProfile } from "@/features/profile/hooks";
import { api, errorMessage, isMock } from "@/lib/api";
import type {
  EligibilityDecision,
  VerificationStart,
} from "@/lib/api/contracts";

export function EligibilityVerificationPanel({
  schemeId,
}: {
  schemeId: string;
}) {
  const { user } = useAuth();
  const profile = useProfile();
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [challenge, setChallenge] = useState<VerificationStart | null>(null);
  const [decision, setDecision] = useState<EligibilityDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const metadataName = user?.user_metadata?.full_name;
  const effectiveName =
    name ?? (typeof metadataName === "string" ? metadataName : "");
  const effectiveEmail = email ?? user?.email ?? "";

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(
      () => setCooldown((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [cooldown]);

  function resetChallenge() {
    setChallenge(null);
    setOtp("");
    setDecision(null);
    setError(null);
  }

  async function sendCode() {
    if (!profile.confirmed || !profile.session) {
      setError("Confirm your profile before requesting a verification code.");
      return;
    }
    setBusy(true);
    setError(null);
    setDecision(null);
    try {
      const response = await api.startVerification(
        profile.session.session_id,
        schemeId,
        effectiveName,
        effectiveEmail,
      );
      setChallenge(response);
      setOtp("");
      setCooldown(response.resend_after_seconds);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    if (!challenge) return;
    setBusy(true);
    setError(null);
    try {
      const response = await api.confirmVerification(
        challenge.verification_token,
        otp,
      );
      setDecision(response);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function retryEmail() {
    if (!decision?.notification_retry_token) return;
    setBusy(true);
    setError(null);
    try {
      setDecision(
        await api.retryVerificationNotification(
          decision.notification_retry_token,
        ),
      );
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard className="panel space-y-5 p-6">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-emerald-100 p-2 text-emerald-800">
          <ShieldCheck size={22} aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow">Email verification</p>
          <h2 className="text-xl font-bold text-slate-900">
            Verify, check and receive your result
          </h2>
          <p className="small muted mt-1">
            We check this scheme only after your email is verified. The code
            expires in five minutes.
          </p>
        </div>
      </div>

      {isMock ? (
        <InlineAlert>
          Connect the live API to send real verification emails. Mock mode never
          sends email or produces a citizen decision.
        </InlineAlert>
      ) : !profile.confirmed || !profile.session ? (
        <InlineAlert>
          <Link className="source-link" href="/profile">
            Complete and confirm your profile
          </Link>{" "}
          before checking this scheme.
        </InlineAlert>
      ) : decision ? (
        <div className="space-y-4" role="status" aria-live="polite">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-700" size={22} />
            <strong className="text-lg capitalize">
              {decision.status.replaceAll("_", " ")}
            </strong>
          </div>
          <p>{decision.reason}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {decision.next_steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
          {decision.notification_status === "failed_retryable" ? (
            <InlineAlert error>
              Your result is ready, but the email could not be delivered.
              <Button
                className="mt-3"
                size="sm"
                variant="secondary"
                busy={busy}
                onClick={retryEmail}
              >
                Retry result email
              </Button>
            </InlineAlert>
          ) : (
            <p className="small muted flex items-center gap-2">
              <Mail size={15} /> Result email sent to the verified address.
            </p>
          )}
        </div>
      ) : challenge ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void verifyCode();
          }}
        >
          <InlineAlert>
            We sent a six-digit code to {effectiveEmail}. Enter it below. Do not
            share this code.
          </InlineAlert>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">
              Verification code
            </span>
            <Input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              required
            />
          </label>
          {error && <InlineAlert error>{error}</InlineAlert>}
          <Button
            className="w-full"
            type="submit"
            busy={busy}
            disabled={otp.length !== 6}
          >
            Verify and check eligibility
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="quiet"
              size="sm"
              onClick={resetChallenge}
            >
              Change email
            </Button>
            <Button
              type="button"
              variant="quiet"
              size="sm"
              disabled={cooldown > 0}
              onClick={() => void sendCode()}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </Button>
          </div>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void sendCode();
          }}
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">
              Full name
            </span>
            <Input
              autoComplete="name"
              maxLength={120}
              value={effectiveName}
              onChange={(event) => {
                resetChallenge();
                setName(event.target.value);
              }}
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">
              Email address
            </span>
            <Input
              autoComplete="email"
              type="email"
              maxLength={254}
              value={effectiveEmail}
              onChange={(event) => {
                resetChallenge();
                setEmail(event.target.value);
              }}
              required
            />
          </label>
          {error && <InlineAlert error>{error}</InlineAlert>}
          <Button className="w-full" type="submit" busy={busy}>
            Email verification code
          </Button>
          <p className="text-xs text-slate-500">
            Your OTP is handled by the server and Google Apps Script. It is not
            returned to this browser or stored in frontend code.
          </p>
        </form>
      )}
    </GlassCard>
  );
}
