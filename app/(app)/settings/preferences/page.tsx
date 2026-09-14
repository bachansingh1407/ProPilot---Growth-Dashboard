import { PageHeader } from '@/components/shared/page-header';

export default function PreferencesSettingsPage() {
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Preferences" />
      <div className="rounded-lg border border-border p-4">
        <h2 className="mb-1 text-sm font-semibold">Theme</h2>
        <p className="text-sm text-muted-foreground">
          Light, dark, and system theme are controlled from the toggle in the top bar — it applies instantly
          and is remembered on this device.
        </p>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Additional preferences (default date range, notification settings) aren't needed yet for a
        single-user app and haven't been built.
      </p>
    </div>
  );
}
