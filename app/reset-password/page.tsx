"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { authApi } from "@/lib/authApi";
import { ApiRequestError } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-orange-400/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[60%] w-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] h-[50%] w-[50%] rounded-full bg-teal-400/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900">Reset Password</h2>
          <p className="mt-2 text-center text-sm font-medium text-slate-500">Choose a new password for your admin account</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/20 px-4 py-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-2xl sm:px-10">
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-orange-400 via-blue-500 to-teal-400 opacity-80"></div>

            {!token ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">Invalid Link</h3>
                <p className="mt-2 text-sm text-slate-500">
                  This reset link is missing its token. Please request a new one from the sign-in page.
                </p>
                <Button onClick={() => router.push("/login")} className="mt-6 h-12 w-full text-[15px] shadow-sm">
                  Back to Sign In
                </Button>
              </div>
            ) : done ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">Password Reset</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Your password has been changed and every other session has been signed out. Sign in with your new
                  password to continue.
                </p>
                <Button onClick={() => router.push("/login")} className="mt-6 h-12 w-full text-[15px] shadow-sm">
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                    <KeyRound className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">Set a new password</h3>
                  <p className="mt-2 text-sm text-slate-500">Must be at least 8 characters.</p>
                </div>

                <div className="space-y-5">
                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoFocus
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-[30px] flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <Input
                    label="Confirm New Password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/80 p-3.5 text-sm text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <Button type="submit" loading={isSubmitting} className="h-12 w-full text-[15px] shadow-sm">
                  Reset Password
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
