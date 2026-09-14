import { Gauge } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/data-display/empty-state';
import { DateRangeFilter } from '@/components/date-range/date-range-filter';
import { TrendLine } from '@/components/charts/trend-line';
import Link from 'next/link';

function parseRangeFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const preset = (searchParams.range as string) ?? '30d';
  const now = new Date();
  if (preset === 'custom' && searchParams.from && searchParams.to) {
    return { from: new Date(searchParams.from as string), to: new Date(searchParams.to as string) };
  }
  const days = preset === '24h' ? 1 : preset === '7d' ? 7 : 30;
  const from = new Date(now);
  from.setDate(from.getDate() - days);
  return { from, to: now };
}

export default async function MetricsHubPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const { from, to } = parseRangeFromSearchParams(resolvedSearchParams);

  const metrics = await prisma.projectMetric.findMany({
    where: { project: { userId: user.id }, date: { gte: from, lte: to } },
    include: { project: { select: { id: true, name: true } } },
    orderBy: { date: 'asc' },
  });

  const grouped = new Map<string, { unit: string; points: { date: string; value: number }[]; projectName: string }>();
  for (const m of metrics) {
    const key = `${m.name} (${m.project.name})`;
    if (!grouped.has(key)) grouped.set(key, { unit: m.unit, points: [], projectName: m.project.name });
    grouped.get(key)!.points.push({ date: new Date(m.date).toLocaleDateString(), value: m.value });
  }

  return (
    <div>
      <PageHeader
        title="Engineering Metrics"
        description="Manually recorded metrics across every project — latency, throughput, cost, coverage."
        actions={<DateRangeFilter defaultPreset="30d" />}
      />

      {grouped.size === 0 ? (
        <EmptyState
          icon={Gauge}
          title="No metrics in this range"
          explanation="Metrics live on individual projects — open a project and use 'Record metric' to add one, or widen the date range above."
          actionLabel="Go to Projects"
          actionHref="/engineering/projects"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from(grouped.entries()).map(([key, group]) => (
            <div key={key} className="rounded-lg border border-border p-4">
              <p className="text-sm font-medium">{key}</p>
              <TrendLine data={group.points} unit={group.unit} />
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Showing metrics from <Link href="/engineering/projects" className="underline">projects</Link> between{' '}
        {from.toLocaleDateString()} and {to.toLocaleDateString()}.
      </p>
    </div>
  );
}
