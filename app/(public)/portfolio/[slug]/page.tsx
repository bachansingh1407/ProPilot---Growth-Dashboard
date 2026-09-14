import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/client';

async function getPublicProjects(userId: string) {
  return prisma.project.findMany({
    where: { userId, isPublic: true },
    include: { technologies: true, skills: { include: { skill: { select: { id: true, name: true } } } } },
  });
}

type PublicExperience = Awaited<ReturnType<typeof prisma.experience.findMany>>[number];
type PublicProject = Awaited<ReturnType<typeof getPublicProjects>>[number];
type PublicAchievement = Awaited<ReturnType<typeof prisma.achievement.findMany>>[number];

/**
 * Public, unauthenticated route. Reads ONLY rows explicitly marked
 * isPublic / isPortfolioPublished (Section 32). Never imports Application,
 * Interview, ResumeAnalysis, or any private-note models — those tables
 * aren't even queried here, so there's no path for that data to leak
 * through this page even by mistake.
 */
export default async function PublicPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await prisma.profile.findUnique({
    where: { portfolioSlug: slug, isPortfolioPublished: true },
  });

  if (!profile) notFound();

  const [experiences, projects, achievements] = await Promise.all([
    prisma.experience.findMany({ where: { userId: profile.userId, isPublic: true }, orderBy: { startDate: 'desc' } }),
    getPublicProjects(profile.userId),
    prisma.achievement.findMany({ where: { userId: profile.userId, isPublic: true }, orderBy: { createdAt: 'desc' } }),
  ]);

  // Skills shown on the portfolio are exactly those used by a public project —
  // never the full private skill list, and never gated by a separate flag
  // the user would have to remember to set.
  const skillNames = Array.from(
    new Map<string, string>(
      projects.flatMap((p) => p.skills.map((s) => [s.skill.id, s.skill.name] as [string, string])),
    ).values(),
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold">{profile.fullName}</h1>
      {profile.headline && <p className="mt-1 text-muted-foreground">{profile.headline}</p>}
      {profile.bio && <p className="mt-6 leading-relaxed">{profile.bio}</p>}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        {profile.githubUrl && (
          <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="underline">
            GitHub
          </a>
        )}
        {profile.linkedinUrl && (
          <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="underline">
            LinkedIn
          </a>
        )}
        {profile.websiteUrl && (
          <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="underline">
            Website
          </a>
        )}
        {profile.contactEmail && (
          <a href={`mailto:${profile.contactEmail}`} className="underline">
            Contact
          </a>
        )}
      </div>

      {skillNames.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {skillNames.map((name) => (
              <span key={name} className="rounded-full border border-border px-2.5 py-0.5 text-xs">
                {name}
              </span>
            ))}
          </div>
        </section>
      )}

      {experiences.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Experience</h2>
          <div className="mt-4 flex flex-col gap-4">
            {experiences.map((exp: PublicExperience) => (
              <div key={exp.id}>
                <p className="font-medium">
                  {exp.title} · {exp.company}
                </p>
                <p className="text-sm text-muted-foreground">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Selected Projects</h2>
          <div className="mt-4 flex flex-col gap-4">
            {projects.map((p: PublicProject) => (
              <div key={p.id}>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                {p.technologies.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">{p.technologies.map((t) => t.name).join(' · ')}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {achievements.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Achievements</h2>
          <div className="mt-4 flex flex-col gap-4">
            {achievements.map((a: PublicAchievement) => (
              <div key={a.id}>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.impact}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
