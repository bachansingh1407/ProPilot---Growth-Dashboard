import Link from 'next/link';
import { FolderGit2, Trophy, Gauge, FileText, NotebookText } from 'lucide-react';

type EvidenceRow = {
  id: string;
  note_text: string | null;
  project: { id: string; name: string } | null;
  achievement: { id: string; title: string } | null;
  metric: { id: string; name: string; value: number; unit: string; projectId: string } | null;
  adr: { id: string; identifier: string; title: string; projectId: string } | null;
  note: { id: string; title: string } | null;
};

const SOURCE_META = {
  project: { icon: FolderGit2, label: 'Project' },
  achievement: { icon: Trophy, label: 'Achievement' },
  metric: { icon: Gauge, label: 'Metric' },
  adr: { icon: FileText, label: 'ADR' },
  note: { icon: NotebookText, label: 'Note' },
} as const;

export function EvidenceList({ evidence }: { evidence: EvidenceRow[] }) {
  if (evidence.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        No evidence linked yet. Link a project, achievement, metric, ADR, or note that proves this skill.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {evidence.map((e) => {
        let content: React.ReactNode = null;
        let meta: (typeof SOURCE_META)[keyof typeof SOURCE_META] | null = null;
        let href = '#';

        if (e.project) {
          meta = SOURCE_META.project;
          content = e.project.name;
          href = `/engineering/projects/${e.project.id}`;
        } else if (e.achievement) {
          meta = SOURCE_META.achievement;
          content = e.achievement.title;
          href = `/career/achievements/${e.achievement.id}`;
        } else if (e.metric) {
          meta = SOURCE_META.metric;
          content = `${e.metric.name}: ${e.metric.value}${e.metric.unit}`;
          href = `/engineering/projects/${e.metric.projectId}`;
        } else if (e.adr) {
          meta = SOURCE_META.adr;
          content = `${e.adr.identifier} — ${e.adr.title}`;
          href = `/engineering/projects/${e.adr.projectId}`;
        } else if (e.note) {
          meta = SOURCE_META.note;
          content = e.note.title;
          href = `/engineering/notes/${e.note.id}`;
        }

        if (!meta) return null;
        const Icon = meta.icon;

        return (
          <li key={e.id} className="flex items-start gap-3 rounded-md border border-border px-3 py-2.5">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{meta.label}</p>
              <Link href={href} className="text-sm font-medium hover:underline">
                {content}
              </Link>
              {e.note_text && <p className="mt-0.5 text-sm text-muted-foreground">{e.note_text}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
