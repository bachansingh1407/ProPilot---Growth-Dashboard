import { Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';

export default function ImportExportSettingsPage() {
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Import / Export" description="Your data belongs to you — no vendor lock-in." />

      <section className="rounded-lg border border-border p-4">
        <h2 className="mb-1 text-sm font-semibold">Export everything</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Downloads a complete JSON dump of your profile, skills, projects, resumes, interviews, and every
          other entity you own — structured, not a black box.
        </p>
        <Button asChild size="sm">
          <a href="/api/export" download>
            <Download className="mr-1.5 h-4 w-4" /> Download JSON export
          </a>
        </Button>
      </section>

      <section className="mt-6 rounded-lg border border-dashed border-border p-4">
        <h2 className="mb-1 text-sm font-semibold">Import</h2>
        <p className="text-sm text-muted-foreground">
          Backup import isn't built yet — it needs careful conflict handling (duplicate skills, existing
          projects) to avoid corrupting your evidence graph on a bad import. Planned for a future polish pass.
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-dashed border-border p-4">
        <h2 className="mb-1 text-sm font-semibold">Markdown / CSV export</h2>
        <p className="text-sm text-muted-foreground">
          Per-section Markdown and CSV exports (e.g. just your resume bullets, or just your metrics as CSV)
          aren't built yet — the full JSON export above covers everything in the meantime.
        </p>
      </section>
    </div>
  );
}
