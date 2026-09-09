"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Mail,
  MailCheck,
  HeartHandshake,
  UsersRound,
  Flower2,
  Headphones,
  Clock3,
  MonitorCheck,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials, logout } from "@/store/slices/authSlice";
import { authApi } from "@/lib/authApi";
import { ApiRequestError } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import Swal from "sweetalert2";

type Step =
  | "credentials"
  | "totp"
  | "2fa-setup"
  | "backup-codes"
  | "forgot-password"
  | "forgot-password-sent"
  | "reset-password";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { admin, hydrated } = useAppSelector(
    (state) => state.auth,
  );

  /*
   * Language switcher removed.
   * Existing translations are still used for page text.
   */
  const { translations } = useLanguage();
  const text = translations.login;

  const [step, setStep] = useState<Step>("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [totpCode, setTotpCode] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [secret, setSecret] = useState("");
  const [provisioningUri, setProvisioningUri] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  const [setupCode, setSetupCode] = useState("");

  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const [copied, setCopied] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  /* =========================================================
     QR CODE
  ========================================================= */

  useEffect(() => {
    if (!provisioningUri) {
      setQrDataUrl("");
      return;
    }

    QRCode.toDataURL(provisioningUri, {
      width: 220,
      margin: 1,
    })
      .then(setQrDataUrl)
      .catch(() => {
        setQrDataUrl("");
      });
  }, [provisioningUri]);

  /* =========================================================
     SESSION CHECK
  ========================================================= */

  useEffect(() => {
    if (
      !hydrated ||
      !admin ||
      step !== "credentials"
    ) {
      return;
    }

    authApi
      .getMe()
      .then(async (me) => {
        if (!me.twoFactorPending) {
          router.replace("/");
          return;
        }

        const setup =
          await authApi.setupTwoFactor();

        setSecret(setup.secret);

        setProvisioningUri(
          setup.provisioningUri,
        );

        setStep("2fa-setup");
      })
      .catch(() => {
        /* stale/invalid session - reset */
        dispatch(logout());
        if (typeof window !== "undefined") {
          localStorage.removeItem("ms_admin_auth");
        }
      });
  }, [
    hydrated,
    admin,
    router,
    step,
    dispatch,
  ]);

  /* SweetAlert2 Toast */
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    background: "#1e2433",
    color: "#e2e8f0",
  });

  const showToast = (icon: "success" | "error" | "info" | "warning", title: string) => {
    Toast.fire({
      icon,
      title,
      iconColor: icon === "success" ? "#4ade80" : icon === "error" ? "#f87171" : "#60a5fa",
    });
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (step === "credentials") {
        const result = await authApi.login(email, password);

        if (result.requiresTwoFactor) {
          setTempToken(result.tempToken || "");
          setStep("totp");
          showToast("info", "Please enter 6-digit code from Microsoft Authenticator");
          return;
        }

        if (result.user.userType !== "INTERNAL") {
          const msg = "This portal is for Bharat Organic Expo staff accounts only.";
          setError(msg);
          showToast("error", msg);
          return;
        }

        dispatch(
          setCredentials({
            admin: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          }),
        );

        if (result.twoFactorSetupRequired) {
          const setup = await authApi.setupTwoFactor();
          setSecret(setup.secret);
          setProvisioningUri(setup.provisioningUri);
          setStep("2fa-setup");

          Swal.fire({
            title: "Setup Two-Factor Authentication",
            text: "Scan the QR code with Microsoft Authenticator to secure your account.",
            icon: "info",
            confirmButtonColor: "#4B1426",
            confirmButtonText: "I'm Ready to Scan",
          });
          return;
        }

        showToast("success", `Welcome back, ${result.user.name}!`);
        router.push("/");
        return;
      }

      if (step === "totp") {
        if (!totpCode || totpCode.length !== 6) {
          const msg = "Please enter a valid 6-digit code from Microsoft Authenticator.";
          setError(msg);
          showToast("error", msg);
          return;
        }

        let res: any;
        if (tempToken) {
          res = await authApi.verifyTwoFactor(totpCode, tempToken);
        } else {
          res = await authApi.login(email, password, totpCode);
        }

        const data = res?.data || res;
        if (data && data.accessToken && data.admin) {
          dispatch(
            setCredentials({
              admin: {
                id: data.admin.id || data.admin._id,
                name: data.admin.name,
                email: data.admin.email,
                phone: data.admin.phone || "",
                avatarUrl: data.admin.avatarUrl || undefined,
                userType: "INTERNAL",
                roleSlug: data.admin.role === "superadmin" ? "SUPER_ADMIN" : "EXPO_ADMIN",
                permissions: ["*"],
              },
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            }),
          );
          showToast("success", "2FA Verified! Logging in...");
          router.push("/");
          return;
        }

        if (data && data.requiresTwoFactor) {
          const msg = "Invalid 2FA code. Please check Microsoft Authenticator.";
          setError(msg);
          showToast("error", msg);
          return;
        }
      }
    } catch (err: any) {
      if (
        err instanceof ApiRequestError &&
        (err.message.includes("Two-factor") || err.message.includes("2FA"))
      ) {
        setStep("totp");
        setError("");
        showToast("info", "Please enter your 2FA code");
        return;
      }

      // 429 — Too Many Login Attempts → show prominent lock alert
      if (err instanceof ApiRequestError && err.status === 429) {
        const lockMsg = "Account temporarily locked. Too many failed login attempts. Please try again in 15 minutes.";
        setError(lockMsg);
        Swal.fire({
          title: "🔒 Account Locked",
          html: `<p style="font-size:0.95rem;">Too many incorrect password attempts.<br/><br/>Your account has been <strong style="color:#ef4444;">temporarily deactivated</strong> for <strong>15 minutes</strong>.<br/><br/>Please wait and try again later.</p>`,
          icon: "error",
          confirmButtonColor: "#4B1426",
          confirmButtonText: "OK, I'll wait",
          showClass: { popup: "animate__animated animate__shakeX" },
        });
        return;
      }

      const msg = err?.message || (err instanceof ApiRequestError ? err.message : "Invalid credentials. Please try again.");
      setError(msg);
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     CONFIRM 2FA SETUP
  ========================================================= */

  const handleConfirmSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await authApi.confirmTwoFactor(setupCode);
      setBackupCodes(result.backupCodes);
      setStep("backup-codes");

      Swal.fire({
        title: "2FA Activated Successfully!",
        text: "Microsoft Authenticator is now linked to your account. Please save your backup codes.",
        icon: "success",
        confirmButtonColor: "#4B1426",
        confirmButtonText: "View Backup Codes",
      });
    } catch (err: any) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not verify that code. Please try again.";
      setError(msg);
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     COPY SECRET
  ========================================================= */

  const copySecret = () => {
    navigator.clipboard
      .writeText(secret)
      .then(() => {
        setCopied(true);
        showToast("success", "Secret key copied to clipboard!");
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      });
  };

  /* =========================================================
     FORGOT PASSWORD
  ========================================================= */

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res: any = await authApi.forgotPassword(forgotEmail);
      if (res?.resetToken) {
        setResetToken(res.resetToken);
        if (res.email) setEmail(res.email);
        setStep("reset-password");
        showToast("success", "Account verified! Set your new password.");
      } else {
        setStep("forgot-password-sent");
        showToast("success", "Password reset instructions sent!");
      }
    } catch (err: any) {
      const msg = err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(resetToken, newPassword);
      setResetDone(true);
      showToast("success", "Password reset successfully! Please sign in.");
      setTimeout(() => {
        setStep("credentials");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setResetToken("");
        setResetDone(false);
      }, 1500);
    } catch (err: any) {
      const msg = err instanceof ApiRequestError ? err.message : "Failed to reset password. Please try again.";
      setError(msg);
      showToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="login-page"
      style={{
        fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="login-bg"
        aria-hidden
      />

      {/* =====================================================
          LEFT BRAND
      ===================================================== */}

      <section
        className="
          login-brand
          md:translate-y-10
          xl:translate-y-14
        "
        aria-label="Moksha Sewa values"
      >
        {/* LOGO */}

        <div
          className="
            brand-emblem
            !h-[170px]
            !w-[170px]
            xl:!h-[195px]
            xl:!w-[195px]
          "
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}

          <img
            src="/bharat-organic-logo.png"
            alt="Bharat Organic"
          />
        </div>

        {/* ORNAMENT */}

        <div className="gold-ornament">
          <i />
          <b>◆</b>
          <i />
        </div>

        {/* INITIATIVE */}

        <p
          className="
            brand-initiative
            !text-[18px]
            xl:!text-[20px]
            !font-semibold
          "
        >
          {text.initiative}
        </p>

        <div className="gold-ornament">
          <i />
          <b>◆</b>
          <i />
        </div>

        {/* TITLE */}

        <h1 style={{ WebkitTextStroke: "none", textShadow: "none", border: "none" }}>
          <span style={{ color: "#14532d", fontWeight: 600 }}>Bharat</span>{" "}
          <span style={{ color: "#3A6806", fontWeight: 600 }}>Organic</span>{" "}
          <span style={{ color: "#4B1426", fontWeight: 600 }}>Expo</span>
          <br />

          <span style={{ color: "#ffffff", WebkitTextStroke: "none", textShadow: "none" }}>
            {text.portalTitle}
          </span>
        </h1>





      </section>

      {/* =====================================================
          RIGHT AUTH
      ===================================================== */}

      <section className="login-auth">
        <div
          className="
            auth-card
            !rounded-none
            !border-0
          "
        >
          {/* HEADING */}

          <div className="auth-heading">
            <div
              style={{
                width: 72,
                height: 72,
                margin: "0 auto 6px",
                overflow: "visible",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mixBlendMode: "multiply",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/admin.png"
                alt="Bharat Organic"
                style={{ width: "100%", height: "100%", objectFit: "contain", transform: "scale(2.2)" }}
              />
            </div>

            <h2>
              {text.welcome}
            </h2>

            <p>
              <strong>
                {text.portalName}
              </strong>
            </p>

            <div className="gold-ornament">
              <i />
              <b>◆</b>
              <i />
            </div>
          </div>

          {/* =================================================
              CREDENTIALS
          ================================================= */}

          {step ===
            "credentials" && (
              <form
                onSubmit={
                  handleSubmit
                }
                className="
                credentials-form
                relative
                space-y-4
                [&_label]:!text-[13px]
              "
              >
                <div className="space-y-5">
                  {/* EMAIL */}

                  <Input
                    label={
                      text.identifier
                    }
                    type="text"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value,
                      )
                    }
                    placeholder={
                      text.identifierPlaceholder
                    }
                  />

                  {/* PASSWORD */}

                  <div className="relative">
                    <div
                      className="
                      mb-1
                      flex
                      items-center
                      justify-between
                    "
                    >
                      <label
                        className="
                        font-semibold
                        tracking-wide
                        text-text-secondary
                      "
                      >
                        {text.password}

                        <span className="ml-0.5 text-red-500">
                          *
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(
                            email,
                          );

                          setError("");

                          setStep(
                            "forgot-password",
                          );
                        }}
                        className="
                        text-[11px]
                        font-semibold
                      "
                        style={{ color: "#4B1426" }}
                      >
                        {text.forgot}
                      </button>
                    </div>

                    <Input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      required
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value,
                        )
                      }
                      placeholder="••••••••"
                      className="pr-10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) =>
                            !value,
                        )
                      }
                      className="
                      absolute
                      right-3
                      top-[30px]
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      transition-colors
                      hover:bg-slate-100
                      hover:text-slate-600
                      focus:outline-none
                    "
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* REMEMBER */}

                <label className="remember-option" style={{ color: "#2563eb" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  {" "}
                  {text.remember}
                </label>

                {/* ERROR */}

                {error && (
                  <div
                    className="
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-red-100
                    bg-red-50/80
                    p-3.5
                    text-sm
                    text-red-700
                  "
                  >
                    <AlertTriangle
                      className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                      text-red-600
                    "
                    />

                    <span className="font-medium">
                      {error}
                    </span>
                  </div>
                )}

                {/* LOGIN BUTTON */}

                <Button
                  type="submit"
                  loading={
                    isSubmitting
                  }
                  className="
                  h-12
                  w-full
                  text-[15px]
                  shadow-sm
                "
                >
                  {isSubmitting
                    ? text.signingIn
                    : text.loginSecurely}
                </Button>

                {/* 2FA MESSAGE */}

                <p
                  className="
                  flex
                  items-center
                  justify-center
                  gap-1.5
                  text-[13px]
                  font-semibold
                  text-red-600
                "
                >
                  <ShieldCheck className="h-4 w-4" />

                  {
                    text.twoFactorProtected
                  }
                </p>

                {/* ACCESS NOTICE */}

                <div
                  className="
                  access-notice
                  !rounded-none

                  [&>svg]:!h-[18px]
                  [&>svg]:!w-[18px]

                  [&>p]:!text-[13px]
                  [&>p]:!leading-[1.45]
                "
                >
                  <Lock />

                  <p>
                    <strong>
                      {
                        text.authorizedTitle
                      }
                    </strong>

                    {" "}

                    {
                      text.authorizedCopy
                    }
                  </p>
                </div>
              </form>
            )}

          {/* =================================================
              FORGOT PASSWORD
          ================================================= */}

          {step ===
            "forgot-password" && (
              <form
                onSubmit={
                  handleForgotPassword
                }
                className="space-y-6"
              >
                <div className="text-center">
                  <div
                    className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-50
                    text-blue-600
                    shadow-sm
                    ring-1
                    ring-blue-100
                  "
                  >
                    <Mail className="h-7 w-7" />
                  </div>

                  <h3
                    className="
                    mt-5
                    text-xl
                    font-semibold
                    text-slate-900
                  "
                  >
                    {text.resetTitle}
                  </h3>

                  <p
                    className="
                    mt-2
                    text-sm
                    text-slate-500
                  "
                  >
                    {text.resetCopy}
                  </p>
                </div>

                <Input
                  label={text.identifier || "Email / Mobile / Staff ID"}
                  type="text"
                  required
                  autoFocus
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder={text.identifierPlaceholder || "Enter email, mobile number or staff ID"}
                />

                {error && (
                  <div
                    className="
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-red-100
                    bg-red-50/80
                    p-3.5
                    text-sm
                    text-red-700
                  "
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                    <span className="font-medium">
                      {error}
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={
                    isSubmitting
                  }
                  className="
                  h-12
                  w-full
                  text-[15px]
                  shadow-sm
                "
                >
                  {text.sendReset}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(
                      "credentials",
                    );

                    setError("");
                  }}
                  className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  text-sm
                  font-medium
                  text-slate-500
                  transition-colors
                  hover:text-slate-800
                "
                >
                  ← {text.back}
                </button>
              </form>
            )}

          {/* =================================================
              EMAIL SENT
          ================================================= */}

          {step === "forgot-password-sent" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                  <MailCheck className="h-7 w-7" />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-slate-900">
                  {text.inboxTitle}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {forgotEmail}
                  </span>
                  {" — "}
                  {text.inboxCopy}
                </p>
              </div>

              {resetToken && (
                <Button
                  type="button"
                  onClick={() => setStep("reset-password")}
                  className="h-12 w-full text-[15px] font-semibold text-white shadow-sm"
                  style={{ background: "#16a34a" }}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Set New Password Now
                </Button>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setError("");
                }}
                className="flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
              >
                ← {text.back}
              </button>
            </div>
          )}

          {/* =================================================
              RESET PASSWORD FORM (NEW)
          ================================================= */}

          {step === "reset-password" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                  <KeyRound className="h-7 w-7" />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-slate-900">
                  Set New Password
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Account verified for{" "}
                  <strong className="text-slate-800">{forgotEmail}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    required
                    autoFocus
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-[32px] text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <Input
                  label="Confirm New Password"
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/80 p-3.5 text-sm text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {resetDone ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Password updated! Returning to sign in...
                </div>
              ) : (
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="h-12 w-full text-[15px] font-semibold shadow-sm"
                  style={{ background: "#16a34a" }}
                >
                  Update Password
                </Button>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setError("");
                  setResetToken("");
                }}
                className="flex w-full items-center justify-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
              >
                ← {text.back}
              </button>
            </form>
          )}

          {/* =================================================
              TOTP
          ================================================= */}

          {step === "totp" && (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 [&_label]:!text-[13px]"
            >
              {/* Header */}
              <div className="text-center">
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ring-1"
                  style={{ backgroundColor: "#4B142610", color: "#4B1426", borderColor: "#4B142630" }}
                >
                  <ShieldCheck className="h-7 w-7" />
                </div>

                <h3 className="mt-4 text-xl font-semibold text-slate-900">
                  {text.twoStepTitle}
                </h3>

                <p className="mt-1.5 text-sm font-medium" style={{ color: "#4B1426" }}>
                  {text.twoStepCopy}
                </p>
              </div>

              {/* OTP Input */}
              <Input
                label={text.authCode}
                required
                autoFocus
                inputMode="numeric"
                maxLength={6}
                value={totpCode}
                onChange={(e) =>
                  setTotpCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="123456"
                className="h-14 text-center font-mono text-2xl tracking-[0.25em] shadow-sm"
              />

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/80 p-3.5 text-sm text-red-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 uppercase tracking-wide"
                style={{ backgroundColor: "#1b5e20", height: "40px", borderRadius: "7px", fontSize: "12px", fontWeight: 600 }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying…
                  </>
                ) : (
                  text.verify
                )}
              </button>

              {/* Back link */}
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setTotpCode("");
                  setError("");
                }}
                className="flex w-full items-center justify-center gap-1.5 text-[13px] font-semibold transition-colors hover:opacity-80"
                style={{ color: "#4B1426" }}
              >
                ← {text.back}
              </button>
            </form>
          )}

          {/* =================================================
              2FA SETUP
          ================================================= */}

          {step ===
            "2fa-setup" && (
              <form
                onSubmit={
                  handleConfirmSetup
                }
                className="space-y-6"
              >
                <div className="text-center">
                  <div
                    className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-blue-50
                    text-blue-600
                    shadow-sm
                    ring-1
                    ring-blue-100
                  "
                  >
                    <KeyRound className="h-7 w-7" />
                  </div>

                  <h3
                    className="
                    mt-5
                    text-xl
                    font-semibold
                    text-slate-900
                  "
                  >
                    {text.setupTitle}
                  </h3>

                  <p
                    className="
                    mt-2
                    text-sm
                    text-slate-500
                  "
                  >
                    {text.setupCopy}
                  </p>
                </div>

                {/* QR CODE */}

                {qrDataUrl && (
                  <div className="flex justify-center">
                    <div
                      className="
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      p-4
                      shadow-sm
                    "
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}

                      <img
                        src={
                          qrDataUrl
                        }
                        alt="QR Code"
                        className="h-40 w-40"
                      />
                    </div>
                  </div>
                )}

                {/* MANUAL KEY */}

                <div
                  className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50/50
                "
                >
                  <div
                    className="
                    border-b
                    border-slate-200
                    bg-slate-100/50
                    p-2.5
                    text-center
                  "
                  >
                    <p
                      className="
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-500
                    "
                    >
                      {text.manualKey}
                    </p>
                  </div>

                  <div
                    className="
                    flex
                    items-center
                    justify-between
                    p-3
                    pl-4
                  "
                  >
                    <code
                      className="
                      text-sm
                      font-semibold
                      tracking-wide
                      text-slate-800
                    "
                    >
                      {secret}
                    </code>

                    <button
                      type="button"
                      onClick={
                        copySecret
                      }
                      className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      bg-white
                      shadow-sm
                      transition-colors
                      hover:bg-slate-50
                    "
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* CONFIRM CODE */}

                <Input
                  label={
                    text.confirmCode
                  }
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  value={
                    setupCode
                  }
                  onChange={(e) =>
                    setSetupCode(
                      e.target.value.replace(
                        /\D/g,
                        "",
                      ),
                    )
                  }
                  placeholder="123456"
                  className="
                  h-14
                  text-center
                  font-mono
                  text-2xl
                  tracking-[0.25em]
                  shadow-sm
                "
                />

                {error && (
                  <div
                    className="
                    flex
                    items-start
                    gap-3
                    rounded-xl
                    border
                    border-red-100
                    bg-red-50/80
                    p-3.5
                    text-sm
                    text-red-700
                  "
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                    <span className="font-medium">
                      {error}
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={
                    isSubmitting
                  }
                  className="
                  h-12
                  w-full
                  text-[15px]
                  shadow-sm
                "
                >
                  {text.enable2fa}
                </Button>
              </form>
            )}

          {/* =================================================
              BACKUP CODES
          ================================================= */}

          {step ===
            "backup-codes" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div
                    className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-emerald-50
                    text-emerald-600
                    shadow-sm
                    ring-1
                    ring-emerald-100
                  "
                  >
                    <CheckCircle2 className="h-7 w-7" />
                  </div>

                  <h3
                    className="
                    mt-5
                    text-xl
                    font-semibold
                    text-slate-900
                  "
                  >
                    {text.enabledTitle}
                  </h3>

                  <p
                    className="
                    mt-2
                    text-sm
                    text-slate-500
                  "
                  >
                    {text.backupCopy}
                  </p>
                </div>

                <div
                  className="
                  grid
                  grid-cols-2
                  gap-3
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50/50
                  p-5
                "
                >
                  {backupCodes.map(
                    (code) => (
                      <span
                        key={code}
                        className="
                        select-all
                        rounded-lg
                        border
                        border-slate-100
                        bg-white
                        py-2
                        text-center
                        font-mono
                        text-sm
                        font-medium
                        tracking-wider
                        text-slate-800
                        shadow-sm
                      "
                      >
                        {code}
                      </span>
                    ),
                  )}
                </div>

                <Button
                  onClick={() =>
                    router.push("/")
                  }
                  className="
                  h-12
                  w-full
                  text-[15px]
                  shadow-sm
                "
                >
                  {text.savedCodes}
                </Button>
              </div>
            )}


        </div>
      </section>

      {/* =====================================================
          SECURITY STRIP
      ===================================================== */}

      <footer className="security-strip">
        {[
          [
            ShieldCheck,
            text.footer.access,
            text.footer.accessCopy,
          ],

          [
            Lock,
            text.footer.security,
            text.footer.securityCopy,
          ],

          [
            Clock3,
            text.footer.audit,
            text.footer.auditCopy,
          ],

          [
            MonitorCheck,
            text.footer.reliable,
            text.footer.reliableCopy,
          ],
        ].map(
          ([
            Icon,
            title,
            copy,
          ]) => {
            const StripIcon =
              Icon as typeof ShieldCheck;

            return (
              <div
                key={String(
                  title,
                )}
              >
                <div className="icon-wrap">
                  <StripIcon />
                </div>

                <p>
                  <strong>
                    {String(
                      title,
                    )}
                  </strong>

                  <small>
                    {String(
                      copy,
                    )}
                  </small>
                </p>
              </div>
            );
          },
        )}
      </footer>
    </main>
  );
}