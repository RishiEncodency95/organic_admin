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
import { setCredentials } from "@/store/slices/authSlice";
import { authApi } from "@/lib/authApi";
import { ApiRequestError } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

type Step =
  | "credentials"
  | "totp"
  | "2fa-setup"
  | "backup-codes"
  | "forgot-password"
  | "forgot-password-sent";

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
        /* stale/invalid session */
      });
  }, [
    hydrated,
    admin,
    router,
    step,
  ]);

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setError("");

    if (step === "credentials") {
      setStep("totp");
      return;
    }

    setIsSubmitting(true);

    try {
      const result =
        await authApi.login(
          email,
          password,
          totpCode || undefined,
        );

      if (
        result.user.userType !==
        "INTERNAL"
      ) {
        setError(
          "This portal is for Bharat Organic Expo staff accounts only.",
        );

        return;
      }

      dispatch(
        setCredentials({
          admin: result.user,
          accessToken:
            result.accessToken,
          refreshToken:
            result.refreshToken,
        }),
      );

      if (
        result.twoFactorSetupRequired
      ) {
        const setup =
          await authApi.setupTwoFactor();

        setSecret(setup.secret);

        setProvisioningUri(
          setup.provisioningUri,
        );

        setStep("2fa-setup");

        return;
      }

      router.push("/");
    } catch (err) {
      if (
        err instanceof ApiRequestError &&
        err.message ===
        "Two-factor code required"
      ) {
        setStep("totp");

        setError("");

        return;
      }

      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================================================
     CONFIRM 2FA SETUP
  ========================================================= */

  const handleConfirmSetup = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const result =
        await authApi.confirmTwoFactor(
          setupCode,
        );

      setBackupCodes(
        result.backupCodes,
      );

      setStep("backup-codes");
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Could not verify that code. Please try again.",
      );
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

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      });
  };

  /* =========================================================
     FORGOT PASSWORD
  ========================================================= */

  const handleForgotPassword = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await authApi.forgotPassword(
        forgotEmail,
      );

      setStep(
        "forgot-password-sent",
      );
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="login-page"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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

        <h1>
          Bharat Organic Expo
          <br />

          <span>
            {text.portalTitle}
          </span>
        </h1>

        <div className="gold-ornament">
          <i />
          <b>◆</b>
          <i />
        </div>

        {/* MESSAGE */}

        <p className="brand-message !font-bold">
          <strong className="!font-bold">{text.compassionLine}</strong>

          <br />

          <strong className="!font-bold">{text.honorLine}</strong>

          <br />

          <strong className="!font-bold">{text.dignityLine}</strong>
        </p>

        {/* ===================================================
            VALUES
            LEFT ALIGNED
        =================================================== */}

        <div
          className="
            value-grid
            !ml-0
            !mr-auto
            !self-start
            !justify-self-start
            !rounded-none
            !border-0
          "
        >
          {[
            [
              HeartHandshake,
              text.values.compassion,
              text.values.compassionCopy,
            ],

            [
              ShieldCheck,
              text.values.dignity,
              text.values.dignityCopy,
            ],

            [
              UsersRound,
              text.values.service,
              text.values.serviceCopy,
            ],

            [
              Flower2,
              text.values.trust,
              text.values.trustCopy,
            ],
          ].map(
            ([
              Icon,
              title,
              copy,
            ]) => {
              const ValueIcon =
                Icon as typeof ShieldCheck;

              return (
                <article
                  key={String(title)}
                >
                  <ValueIcon />

                  <strong>
                    {String(title)}
                  </strong>

                  <small>
                    {String(copy)}
                  </small>
                </article>
              );
            },
          )}
        </div>

        {/* ===================================================
            SECURE TRUST BLOCK
            SAME LEFT ALIGNMENT
        =================================================== */}

        <div
          className="
            trust-card
            !ml-0
            !mr-auto
            !w-fit
            !self-start
            !justify-self-start
            !justify-start
            !rounded-none
            !border-0
            !text-left

            [&>p]:!m-0
            [&>p]:!text-left
          "
        >
          <span>
            <Lock />
          </span>

          <p className="!text-left">
            <strong>
              {text.secureTitle}
            </strong>

            <br />

            {text.secureCopy}
          </p>
        </div>
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
            <span>
              <ShieldCheck />
            </span>

            <h2>
              {text.welcome}
            </h2>

            <p>
              {text.continue}

              <br />

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
                        text-blue-600
                        hover:text-blue-700
                      "
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

                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={
                      rememberMe
                    }
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked,
                      )
                    }
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
                  text-teal-800
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
                  label={
                    text.email
                  }
                  type="email"
                  required
                  autoFocus
                  value={
                    forgotEmail
                  }
                  onChange={(e) =>
                    setForgotEmail(
                      e.target.value,
                    )
                  }
                  placeholder="admin@bharatorganic.com"
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

          {step ===
            "forgot-password-sent" && (
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
                    <MailCheck className="h-7 w-7" />
                  </div>

                  <h3
                    className="
                    mt-5
                    text-xl
                    font-semibold
                    text-slate-900
                  "
                  >
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
              </div>
            )}

          {/* =================================================
              TOTP
          ================================================= */}

          {step === "totp" && (
            <form
              onSubmit={
                handleSubmit
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
                  <ShieldCheck className="h-7 w-7" />
                </div>

                <h3
                  className="
                    mt-5
                    text-xl
                    font-semibold
                    text-slate-900
                  "
                >
                  {text.twoStepTitle}
                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    text-slate-500
                  "
                >
                  {text.twoStepCopy}
                </p>
              </div>

              <Input
                label={
                  text.authCode
                }
                required
                autoFocus
                inputMode="numeric"
                maxLength={6}
                value={
                  totpCode
                }
                onChange={(e) =>
                  setTotpCode(
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
                {text.verify}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep(
                    "credentials",
                  );

                  setTotpCode("");

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

          {/* =================================================
              HELP
          ================================================= */}

          <div
            className="
              auth-help
              !text-[14px]

              [&>svg]:!h-[18px]
              [&>svg]:!w-[18px]
            "
          >
            <Headphones />

            {text.needHelp}

            {" "}

            {text.contact}

            {" "}

            <a href="mailto:support@mokshasewa.com">
              {text.itSupport}
            </a>
          </div>
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
                <StripIcon />

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