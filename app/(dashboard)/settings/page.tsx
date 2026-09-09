"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import { settingsApi } from "@/lib/settingsApi";
import { Settings } from "@/lib/types";
import { ApiRequestError } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    settingsApi
      .get()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await settingsApi.update(settings);
      setSettings(updated);
      setMessage({ type: "success", text: "Settings saved." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof ApiRequestError ? err.message : "Could not save settings." });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="flex min-h-[40vh] items-center justify-center text-text-muted">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]">
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* Page Heading */}
        <div className="mb-[20px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1
              className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em]"
              style={{ color: "#23471d" }}
            >
              Settings
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Site-wide configuration and 80G registration details.
            </p>
          </div>
        </div>

        <div className="w-full space-y-4">

          {message && (
            <div
              className={`rounded border p-3 text-xs font-medium ${
                message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* General */}
          <Card>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#2563eb]">General</h2>
            <div className="grid grid-cols-4 gap-3">
              <Input label="Site Name" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
              <Input
                label="Helpline Number"
                value={settings.helplineNumber}
                onChange={(e) => setSettings({ ...settings, helplineNumber: e.target.value })}
              />
              <Input
                label="WhatsApp Number"
                value={settings.whatsappNumber ?? ""}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              />
              <Input
                label="Support Email"
                type="email"
                value={settings.supportEmail ?? ""}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
              <div className="col-span-4">
                <Input label="Address" value={settings.address ?? ""} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
              </div>
            </div>
          </Card>

          {/* 80G / Organisation */}
          <Card>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#2563eb]">80G / Organisation Registration</h2>
            <p className="mb-3 text-[11px] text-[#4B1426]">
              A donation receipt is only ever issued once <strong>Exemption Reference</strong> below is filled in — an
              unconfigured organisation must never imply a tax exemption it doesn&apos;t actually have.
            </p>
            <div className="grid grid-cols-4 gap-3">
              <Input
                label="Legal Name"
                value={settings.organisation?.legalName ?? ""}
                onChange={(e) => setSettings({ ...settings, organisation: { ...settings.organisation, legalName: e.target.value } })}
              />
              <Input
                label="Organisation PAN"
                value={settings.organisation?.panNumber ?? ""}
                onChange={(e) => setSettings({ ...settings, organisation: { ...settings.organisation, panNumber: e.target.value } })}
              />
              <Input
                label="80G Exemption Reference"
                value={settings.organisation?.exemptionRef ?? ""}
                onChange={(e) => setSettings({ ...settings, organisation: { ...settings.organisation, exemptionRef: e.target.value } })}
                hint="Leave blank to keep receipt generation disabled."
              />
              <Input
                label="Registered Address"
                value={settings.organisation?.registeredAddress ?? ""}
                onChange={(e) => setSettings({ ...settings, organisation: { ...settings.organisation, registeredAddress: e.target.value } })}
              />
            </div>
          </Card>

          {/* Notification Quiet Hours */}
          <Card>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#2563eb]">Notification Quiet Hours</h2>
            <p className="mb-3 text-[11px] text-[#4B1426]">
              Marketing-category notifications are held back during this window and sent right after it ends — an
              assignment, receipt, or other transactional notification always goes out immediately regardless. Leave both
              blank to disable quiet hours entirely.
            </p>
            <div className="grid grid-cols-4 gap-3">
              <Input
                label="Quiet Hours Start"
                type="time"
                value={settings.notifications?.quietHoursStart ?? ""}
                onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, quietHoursStart: e.target.value } })}
              />
              <Input
                label="Quiet Hours End"
                type="time"
                value={settings.notifications?.quietHoursEnd ?? ""}
                onChange={(e) => setSettings({ ...settings, notifications: { ...settings.notifications, quietHoursEnd: e.target.value } })}
              />
            </div>
          </Card>

          {/* Advanced SEO / Scripts */}
          <Card>
            <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#2563eb]">Advanced SEO / Scripts</h2>
            <p className="mb-3 text-[11px] text-[#4B1426]">
              Global head and body scripts (like GTM or Analytics) and robots.txt configuration.
            </p>
            <div className="grid grid-cols-4 gap-3">
              <Input
                label="Google Search Console Verification"
                value={settings.advancedSeo?.googleSearchConsoleVerification ?? ""}
                onChange={(e) => setSettings({ ...settings, advancedSeo: { ...settings.advancedSeo, googleSearchConsoleVerification: e.target.value } })}
                hint="The meta content value (e.g., 'v1234...')"
              />
              <Input
                label="Default Open Graph Image URL"
                value={settings.advancedSeo?.defaultOgImage ?? ""}
                onChange={(e) => setSettings({ ...settings, advancedSeo: { ...settings.advancedSeo, defaultOgImage: e.target.value } })}
                hint="Fallback image for pages without an explicit OG image."
              />
              <Input
                label="GA4 Measurement ID"
                value={settings.advancedSeo?.ga4MeasurementId ?? ""}
                onChange={(e) => setSettings({ ...settings, advancedSeo: { ...settings.advancedSeo, ga4MeasurementId: e.target.value } })}
                hint="e.g., 'G-XXXXXXXXXX'"
              />
              <Input
                label="GTM Container ID"
                value={settings.advancedSeo?.gtmContainerId ?? ""}
                onChange={(e) => setSettings({ ...settings, advancedSeo: { ...settings.advancedSeo, gtmContainerId: e.target.value } })}
                hint="e.g., 'GTM-XXXXXXX'"
              />
              <div className="col-span-4">
                <Textarea
                  label="Global Head Code"
                  value={settings.advancedSeo?.globalHeadCode ?? ""}
                  onChange={(e) => setSettings({ ...settings, advancedSeo: { ...settings.advancedSeo, globalHeadCode: e.target.value } })}
                  rows={4}
                  hint="Raw HTML scripts to be placed in the <head> of every page."
                />
              </div>
              <div className="col-span-4">
                <Textarea
                  label="Global Body Code"
                  value={settings.advancedSeo?.globalBodyCode ?? ""}
                  onChange={(e) => setSettings({ ...settings, advancedSeo: { ...settings.advancedSeo, globalBodyCode: e.target.value } })}
                  rows={4}
                  hint="Raw HTML scripts to be placed at the end of the <body>."
                />
              </div>
              <div className="col-span-4">
                <Textarea
                  label="Robots.txt Content"
                  value={settings.advancedSeo?.robotsTxt ?? ""}
                  onChange={(e) => setSettings({ ...settings, advancedSeo: { ...settings.advancedSeo, robotsTxt: e.target.value } })}
                  rows={4}
                  hint="Override the default robots.txt. Leave blank to use Next.js defaults."
                />
              </div>
            </div>
          </Card>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
            style={{
              background: "#16a34a",
              borderRadius: "4px",
              boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px",
            }}
          >
            {saving && <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

