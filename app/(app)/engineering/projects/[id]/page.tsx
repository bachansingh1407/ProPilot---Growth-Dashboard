import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Github, ExternalLink, Network, FileText, Gauge, Trophy } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/components/data-display/empty-state';
import { AddArchitectureDialog } from '@/components/projects/add-architecture-dialog';
import { AddADRDialog } from '@/components/projects/add-adr-dialog';
import { AddMetricDialog } from '@/components/projects/add-metric-dialog';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const project = await prisma.project.findFirst({
    where: { id: id, userId: user.id },
    include: {
      technologies: true,
      skills: { include: { skill: { select: { id: true, name: true } } } },
      architecture: { orderBy: { createdAt: 'desc' } },
      adrs: { orderBy: { date: 'desc' } },
      metrics: { orderBy: { date: 'desc' } },
      achievements: true,
    },
  });

  if (!project) notFound();

  const nextAdrNumber = project.adrs.length + 1;
  const nextIdentifier = `ADR-${String(nextAdrNumber).padStart(3, '0')}`;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/engineering/projects" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      <div className="mb-2 flex items-start justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
        <div className="flex gap-2">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
              <Github className="h-4 w-4" />
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {project.description && <p className="mb-3 text-sm text-muted-foreground">{project.description}</p>}

      <div className="mb-6 flex flex-wrap gap-1.5">
        {project.technologies.map((t) => (
          <Badge key={t.id} variant="outline">
            {t.name}
          </Badge>
        ))}
      </div>

      {project.skills.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {project.skills.map((link) => (
            <Link key={link.skill.id} href={`/engineering/skills/${link.skill.id}`}>
              <Badge>{link.skill.name}</Badge>
            </Link>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="architecture">Architecture ({project.architecture.length})</TabsTrigger>
          <TabsTrigger value="adrs">ADRs ({project.adrs.length})</TabsTrigger>
          <TabsTrigger value="metrics">Metrics ({project.metrics.length})</TabsTrigger>
          <TabsTrigger value="achievements">Achievements ({project.achievements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <dl className="flex flex-col gap-4 text-sm">
            {project.problem && (
              <div>
                <dt className="font-medium">Problem</dt>
                <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">{project.problem}</dd>
              </div>
            )}
            {project.requirements && (
              <div>
                <dt className="font-medium">Requirements</dt>
                <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">{project.requirements}</dd>
              </div>
            )}
            {project.implementation && (
              <div>
                <dt className="font-medium">Implementation</dt>
                <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">{project.implementation}</dd>
              </div>
            )}
            {!project.problem && !project.requirements && !project.implementation && (
              <p className="text-muted-foreground">
                No problem/requirements/implementation notes yet — edit this project to add them.
              </p>
            )}
          </dl>
        </TabsContent>

        <TabsContent value="architecture">
          <div className="mb-3 flex justify-end">
            <AddArchitectureDialog projectId={project.id} />
          </div>
          {project.architecture.length === 0 ? (
            <EmptyState
              icon={Network}
              title="No architecture documented yet"
              explanation="Capture the system design decisions behind this project — this is what makes a resume claim like 'built a scalable system' verifiable."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {project.architecture.map((a) => (
                <div key={a.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{a.title}</p>
                    <Badge variant="outline">{a.category.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{a.description}</p>
                  {a.tradeoffs && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Tradeoffs: </span>
                      <span className="text-muted-foreground">{a.tradeoffs}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="adrs">
          <div className="mb-3 flex justify-end">
            <AddADRDialog projectId={project.id} nextIdentifier={nextIdentifier} />
          </div>
          {project.adrs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No ADRs yet"
              explanation="Architecture Decision Records capture why you chose one approach over another — exactly what interviewers ask about."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {project.adrs.map((adr) => (
                <div key={adr.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {adr.identifier} — {adr.title}
                    </p>
                    <Badge variant="outline">{adr.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{adr.decision}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="metrics">
          <div className="mb-3 flex justify-end">
            <AddMetricDialog projectId={project.id} />
          </div>
          {project.metrics.length === 0 ? (
            <EmptyState
              icon={Gauge}
              title="No metrics recorded yet"
              explanation="Numbers make impact claims credible — latency, throughput, cost savings, error rates."
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Metric</th>
                    <th className="px-4 py-2 text-left font-medium">Value</th>
                    <th className="px-4 py-2 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {project.metrics.map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-2">{m.name}</td>
                      <td className="px-4 py-2 tabular-nums">
                        {m.value}
                        {m.unit}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{new Date(m.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="achievements">
          {project.achievements.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No achievements linked yet"
              explanation="Add an achievement from Career → Achievements and connect it to this project."
              actionLabel="Add achievement"
              actionHref="/career/achievements/new"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {project.achievements.map((a) => (
                <Link key={a.id} href={`/career/achievements/${a.id}`} className="block rounded-lg border border-border p-4 hover:bg-muted/30">
                  <p className="font-medium">{a.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{a.impact}</p>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
