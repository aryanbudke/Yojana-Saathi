"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Brand } from "@/components/Brand";
import { useMessages } from "@/i18n/client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/features/auth/AuthProvider";

export type AuthFormValues = {
  name?: string;
  email: string;
  password: string;
};

type AuthMode = "sign-in" | "sign-up";

type AuthCardProps = {
  mode: AuthMode;
  onSubmit?: (values: AuthFormValues) => void | Promise<void>;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function AuthCard({ mode, onSubmit }: AuthCardProps) {
  const m = useMessages();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const copy = m.auth;
  const isSignUp = mode === "sign-up";
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!authLoading && user) router.replace("/profile");
  }, [authLoading, router, user]);

  const validate = () => {
    if (isSignUp && !name.trim()) return copy.errors.nameRequired;
    if (!email.trim() || !password) return copy.errors.required;
    if (!EMAIL_PATTERN.test(email.trim())) return copy.errors.invalidEmail;
    if (password.length < MIN_PASSWORD_LENGTH)
      return copy.errors.passwordLength;
    if (isSignUp && password !== confirmPassword)
      return copy.errors.passwordMismatch;
    return "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const values = {
        ...(isSignUp ? { name: name.trim() } : {}),
        email: email.trim(),
        password,
      };

      if (onSubmit) {
        await onSubmit(values);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError(copy.errors.configuration);
        return;
      }

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { data: { full_name: values.name } },
        });

        if (signUpError) {
          setError(authErrorMessage(signUpError.code));
          return;
        }

        if (data.user?.identities?.length === 0) {
          setError(copy.errors.accountExists);
          return;
        }

        setPassword("");
        setConfirmPassword("");
        if (data.session) {
          router.push("/profile");
          router.refresh();
        } else {
          setNotice(copy.checkEmail);
        }
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        setError(authErrorMessage(signInError.code));
        return;
      }

      setPassword("");
      router.push("/profile");
      router.refresh();
    } catch {
      setError(copy.errors.submitFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const authErrorMessage = (code?: string) => {
    switch (code) {
      case "invalid_credentials":
        return copy.errors.invalidCredentials;
      case "email_not_confirmed":
        return copy.errors.emailNotConfirmed;
      case "user_already_exists":
        return copy.errors.accountExists;
      case "signup_disabled":
        return copy.errors.signupDisabled;
      case "over_email_send_rate_limit":
      case "over_request_rate_limit":
        return copy.errors.rateLimited;
      case "weak_password":
        return copy.errors.passwordLength;
      default:
        return copy.errors.submitFailed;
    }
  };

  const title = isSignUp ? copy.signUpTitle : copy.signInTitle;
  const lead = isSignUp ? copy.signUpLead : copy.signInLead;
  const submitLabel = isSignUp ? copy.createAccount : copy.signIn;

  return (
    <section className="auth-shell relative isolate mx-auto flex w-full max-w-5xl items-center justify-center overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute left-[8%] top-[14%] -z-10 h-64 w-64 rounded-full bg-[#dff2a2]/55 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[8%] right-[6%] -z-10 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl"
      />

      <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/80 bg-cream/80 shadow-[0_28px_70px_-30px_rgba(2,66,65,0.38)] backdrop-blur-xl md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-emerald-900 px-10 py-10 text-white md:flex md:flex-col md:justify-between">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[44px] border-[#dff2a2]/15"
          />
          <div className="brand relative flex items-center gap-3 text-xl font-semibold">
            <Brand />
          </div>
          <div className="relative space-y-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff2a2] text-emerald-950 shadow-lg shadow-black/10">
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <p className="max-w-xs text-3xl font-semibold leading-tight tracking-tight">
              {copy.asideTitle}
            </p>
            <p className="max-w-sm text-sm leading-6 text-emerald-50/80">
              {copy.asideText}
            </p>
          </div>
          <p className="relative text-xs leading-5 text-emerald-50/65">
            {copy.privacyNote}
          </p>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
          <Link
            href="/"
            className="brand mb-9 inline-flex text-emerald-950 md:hidden"
            aria-label={m.nav.homeLink}
          >
            <Brand />
          </Link>

          <div className="mb-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              {copy.eyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              {title}
              <span className="text-emerald-600">.</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
              {lead}
            </p>
          </div>

          <form
            className={
              isSignUp ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "space-y-4"
            }
            noValidate
            onSubmit={handleSubmit}
          >
            {isSignUp && (
              <Field
                id="auth-name"
                label={copy.name}
                icon={<UserRound size={18} aria-hidden="true" />}
              >
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={copy.namePlaceholder}
                  className="auth-input"
                />
              </Field>
            )}

            <Field
              id="auth-email"
              label={copy.email}
              icon={<Mail size={18} aria-hidden="true" />}
            >
              <input
                id="auth-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={copy.emailPlaceholder}
                className="auth-input"
              />
            </Field>

            <Field
              id="auth-password"
              label={copy.password}
              icon={<LockKeyhole size={18} aria-hidden="true" />}
            >
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={copy.passwordPlaceholder}
                className="auth-input auth-input-with-action"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                aria-label={
                  showPassword ? copy.hidePassword : copy.showPassword
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </Field>

            {isSignUp && (
              <Field
                id="auth-confirm-password"
                label={copy.confirmPassword}
                icon={<LockKeyhole size={18} aria-hidden="true" />}
              >
                <input
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder={copy.confirmPasswordPlaceholder}
                  className="auth-input"
                />
              </Field>
            )}

            <div
              aria-live="polite"
              className={isSignUp ? "min-h-5 sm:col-span-2" : "min-h-5"}
            >
              {error && (
                <p className="text-sm font-medium text-red-700" role="alert">
                  {error}
                </p>
              )}
              {!error && notice && (
                <p
                  className="rounded-xl border border-amber-700/20 bg-amber-50/60 px-3 py-2 text-sm text-amber-900"
                  role="status"
                >
                  {notice}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:translate-y-0 disabled:opacity-60 ${isSignUp ? "sm:col-span-2" : ""}`}
            >
              {submitting ? copy.submitting : submitLabel}
              {!submitting && (
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-600">
            {isSignUp ? copy.haveAccount : copy.noAccount}{" "}
            <Link
              href={isSignUp ? "/signin" : "/signup"}
              className="font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-950"
            >
              {isSignUp ? copy.signIn : copy.signUp}
            </Link>
          </p>

          {isSignUp && (
            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              {copy.termsPrefix}{" "}
              <Link
                className="underline underline-offset-2 hover:text-emerald-900"
                href="/privacy"
              >
                {copy.privacyPolicy}
              </Link>{" "}
              {copy.termsJoin}{" "}
              <Link
                className="underline underline-offset-2 hover:text-emerald-900"
                href="/disclaimer"
              >
                {copy.disclaimer}
              </Link>
              .
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-emerald-950"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

export function SignIn1({
  onSubmit,
}: {
  onSubmit?: AuthCardProps["onSubmit"];
} = {}) {
  return <AuthCard mode="sign-in" onSubmit={onSubmit} />;
}

export function SignUp1({
  onSubmit,
}: {
  onSubmit?: AuthCardProps["onSubmit"];
} = {}) {
  return <AuthCard mode="sign-up" onSubmit={onSubmit} />;
}

export default SignIn1;
