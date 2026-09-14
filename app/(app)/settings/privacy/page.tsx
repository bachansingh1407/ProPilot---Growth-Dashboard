import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { PageHeader } from '@/components/shared/page-header';
import { PortfolioVisibilityForm } from './portfolio-visibility-form';
import { EntityVisibilityList } from './entity-visibility-list';

export default async function PrivacySettingsPage() {
  const user = await requireUser();

  const [profile, projects, experiences, achievements] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.project.findMany({ where: { userId: user.id }, select: { id: true, name: true, isPublic: true }, orderBy: { name: 'asc' } }),
    prisma.experience.findMany({ where: { userId: user.id }, select: { id: true, title: true, company: true, isPublic: true }, orderBy: { startDate: 'desc' } }),
    prisma.achievement.findMany({ where: { userId: user.id }, select: { id: true, title: true, isPublic: true }, orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Privacy"
        description="Nothing is public by default. You explicitly choose what appears on your portfolio."
      />

      <section className="mb-10 rounded-lg border border-border p-4">
        <h2 className="mb-3 text-sm font-semibold">Public portfolio</h2>
        <PortfolioVisibilityForm profile={profile} />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold">Projects</h2>
        <EntityVisibilityList
          entityType="project"
          items={projects.map((p) => ({ id: p.id, label: p.name, isPublic: p.isPublic }))}
          emptyLabel="No projects yet."
        />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold">Experience</h2>
        <EntityVisibilityList
          entityType="experience"
          items={experiences.map((e) => ({ id: e.id, label: `${e.title} · ${e.company}`, isPublic: e.isPublic }))}
          emptyLabel="No experience recorded yet."
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Achievements</h2>
        <EntityVisibilityList
          entityType="achievement"
          items={achievements.map((a) => ({ id: a.id, label: a.title, isPublic: a.isPublic }))}
          emptyLabel="No achievements yet."
        />
      </section>

      <p className="mt-10 text-xs text-muted-foreground">
        Never made public regardless of these settings: Applications, recruiter information, interview
        feedback, ATS analysis, salary details, and any private notes.
      </p>
    </div>
  );
}
