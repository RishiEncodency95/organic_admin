"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
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
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Settings</h1>
        <p className="text-xs text-text-muted">Site-wide configuration and 80G registration details.</p>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-3 text-xs font-medium ${
            message.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">General</h2>
        <div className="grid gap-3 sm:grid-cols-2">
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
          <div className="sm:col-span-2">
            <Input label="Address" value={settings.address ?? ""} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">80G / Organisation Registration</h2>
        <p className="mb-3 text-[11px] text-text-muted">
          A donation receipt is only ever issued once <strong>Exemption Reference</strong> below is filled in — an
          unconfigured organisation must never imply a tax exemption it doesn&apos;t actually have.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
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

      <Card>
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Notification Quiet Hours</h2>
        <p className="mb-3 text-[11px] text-text-muted">
          Marketing-category notifications are held back during this window and sent right after it ends — an
          assignment, receipt, or other transactional notification always goes out immediately regardless. Leave both
          blank to disable quiet hours entirely.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
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

      <Card>
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Advanced SEO / Scripts</h2>
        <p className="mb-3 text-[11px] text-text-muted">
          Global head and body scripts (like GTM or Analytics) and robots.txt configuration.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
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
          <div className="sm:col-span-2">
            <Textarea
              label="Global Head Code"
              value={settings.advancedSeo?.globalHeadCode ?? ""}
              onChange={(e) => setSettings({ ...settings, advancedSeo: { ...settings.advancedSeo, globalHeadCode: e.target.value } })}
              rows={4}
              hint="Raw HTML scripts to be placed in the <head> of every page."
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Global Body Code"
              value={settings.advancedSeo?.globalBodyCode ?? ""}
              onChange={(e) => setSettings({ ...settings, advancedSeo: { ...settings.advancedSeo, globalBodyCode: e.target.value } })}
              rows={4}
              hint="Raw HTML scripts to be placed at the end of the <body>."
            />
          </div>
          <div className="sm:col-span-2">
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

      <Button onClick={handleSave} loading={saving}>
        Save Settings
      </Button>
    </div>
  );
}
