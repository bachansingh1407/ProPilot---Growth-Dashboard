import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';

export async function GET() {
  const user = await requireUser();

  const [
    profile, experiences, skills, projects, achievements, resumes, companies, roles,
    applications, interviews, stories, notes, careerGoals, timelineItems, improvements,
  ] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.experience.findMany({ where: { userId: user.id }, include: { technologies: true } }),
    prisma.skill.findMany({ where: { userId: user.id }, include: { evidence: true } }),
    prisma.project.findMany({
      where: { userId: user.id },
      include: { technologies: true, links: true, architecture: { include: { diagrams: true } }, adrs: true, metrics: true },
    }),
    prisma.achievement.findMany({ where: { userId: user.id } }),
    prisma.resume.findMany({ where: { userId: user.id }, include: { versions: { include: { bullets: { include: { evidence: true } } } } } }),
    prisma.company.findMany({ where: { userId: user.id } }),
    prisma.role.findMany({ where: { userId: user.id } }),
    prisma.application.findMany({ where: { userId: user.id } }),
    prisma.interview.findMany({ where: { userId: user.id }, include: { answers: true, feedback: true } }),
    prisma.story.findMany({ where: { userId: user.id } }),
    prisma.technicalNote.findMany({ where: { userId: user.id } }),
    prisma.careerGoal.findMany({ where: { userId: user.id } }),
    prisma.careerTimelineItem.findMany({ where: { userId: user.id } }),
    prisma.improvement.findMany({ where: { userId: user.id } }),
  ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    profile, experiences, skills, projects, achievements, resumes, companies, roles,
    applications, interviews, stories, notes, careerGoals, timelineItems, improvements,
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="career-os-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
