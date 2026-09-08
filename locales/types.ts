export type Language = "en" | "hi";

export interface TranslationDictionary {
  language: { english: string; hindi: string };
  login: {
    initiative: string; portalTitle: string; compassionLine: string; honorLine: string; dignityLine: string;
    values: { compassion: string; compassionCopy: string; dignity: string; dignityCopy: string; service: string; serviceCopy: string; trust: string; trustCopy: string };
    secureTitle: string; secureCopy: string; welcome: string; continue: string; portalName: string;
    identifier: string; identifierPlaceholder: string; password: string; passwordPlaceholder: string; remember: string; forgot: string;
    loginSecurely: string; signingIn: string; or: string; otpLogin: string; authorizedTitle: string; authorizedCopy: string;
    twoFactorProtected: string;
    needHelp: string; contact: string; itSupport: string;
    footer: { access: string; accessCopy: string; security: string; securityCopy: string; audit: string; auditCopy: string; reliable: string; reliableCopy: string };
    resetTitle: string; resetCopy: string; email: string; sendReset: string; inboxTitle: string; inboxCopy: string; back: string;
    twoStepTitle: string; twoStepCopy: string; authCode: string; verify: string;
    setupTitle: string; setupCopy: string; manualKey: string; confirmCode: string; enable2fa: string;
    enabledTitle: string; backupCopy: string; savedCodes: string;
  };
}
