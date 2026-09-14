import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';

export type SearchResultItem = { id: string; label: string; sublabel?: string; href: string };
export type SearchResults = Record<string, SearchResultItem[]>;

const LIMIT = 5;

export async function GET(request: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();

  if (q.length < 2) {
    return NextResponse.json<SearchResults>({});
  }

  const contains = { contains: q, mode: 'insensitive' as const };

  const [projects, skills, achievements, resumes, applications, interviews, questions, stories, companies, roles, notes, adrs] =
    await Promise.all([
      prisma.project.findMany({ where: { userId: user.id, name: contains }, take: LIMIT, select: { id: true, name: true } }),
      prisma.skill.findMany({ where: { userId: user.id, name: contains }, take: LIMIT, select: { id: true, name: true, category: true } }),
      prisma.achievement.findMany({ where: { userId: user.id, title: contains }, take: LIMIT, select: { id: true, title: true } }),
      prisma.resume.findMany({ where: { userId: user.id, name: contains }, take: LIMIT, select: { id: true, name: true, versions: { take: 1, select: { id: true } } } }),
      prisma.application.findMany({
        where: { userId: user.id, role: { title: contains } },
        take: LIMIT,
        select: { id: true, role: { select: { title: true, company: { select: { name: true } } } } },
      }),
      prisma.interview.findMany({ where: { userId: user.id, round: contains }, take: LIMIT, select: { id: true, round: true } }),
      prisma.interviewQuestion.findMany({ where: { text: contains }, take: LIMIT, select: { id: true, text: true } }),
      prisma.story.findMany({ where: { userId: user.id, title: contains }, take: LIMIT, select: { id: true, title: true } }),
      prisma.company.findMany({ where: { userId: user.id, name: contains }, take: LIMIT, select: { id: true, name: true } }),
      prisma.role.findMany({ where: { userId: user.id, title: contains }, take: LIMIT, select: { id: true, title: true, company: { select: { name: true } } } }),
      prisma.technicalNote.findMany({ where: { userId: user.id, title: contains }, take: LIMIT, select: { id: true, title: true } }),
      prisma.aDR.findMany({
        where: { project: { userId: user.id }, title: contains },
        take: LIMIT,
        select: { id: true, identifier: true, title: true, projectId: true },
      }),
    ]);

  const results: SearchResults = {
    Projects: projects.map((p) => ({ id: p.id, label: p.name, href: `/engineering/projects/${p.id}` })),
    Skills: skills.map((s) => ({ id: s.id, label: s.name, sublabel: s.category, href: `/engineering/skills/${s.id}` })),
    Achievements: achievements.map((a) => ({ id: a.id, label: a.title, href: `/career/achievements/${a.id}` })),
    Resumes: resumes
      .filter((r) => r.versions[0])
      .map((r) => ({ id: r.id, label: r.name, href: `/prep/resume-lab/${r.id}/${r.versions[0]!.id}` })),
    Applications: applications.map((a) => ({ id: a.id, label: a.role.title, sublabel: a.role.company.name, href: `/prep/applications/${a.id}` })),
    Interviews: interviews.map((i) => ({ id: i.id, label: i.round, href: `/prep/interviews/${i.id}` })),
    'Interview Questions': questions.map((q) => ({ id: q.id, label: q.text.slice(0, 80), href: '/prep/interview-questions' })),
    Stories: stories.map((s) => ({ id: s.id, label: s.title, href: `/prep/story-bank/${s.id}` })),
    Companies: companies.map((c) => ({ id: c.id, label: c.name, href: `/research/companies/${c.id}` })),
    Roles: roles.map((r) => ({ id: r.id, label: r.title, sublabel: r.company.name, href: `/research/roles/${r.id}` })),
    Notes: notes.map((n) => ({ id: n.id, label: n.title, href: `/engineering/notes/${n.id}` })),
    ADRs: adrs.map((a) => ({ id: a.id, label: `${a.identifier} — ${a.title}`, href: `/engineering/projects/${a.projectId}` })),
  };

  // Drop empty groups so the client doesn't render headings with nothing under them.
  const nonEmptyResults = Object.fromEntries(Object.entries(results).filter(([, items]) => items.length > 0));

  return NextResponse.json<SearchResults>(nonEmptyResults);
}
