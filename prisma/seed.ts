/**
 * Development seed data. Everything created here is clearly sample content —
 * names are prefixed "Sample" per Section 47 of the build spec — and is safe
 * to delete wholesale before real use:
 *
 *   DELETE FROM projects WHERE name LIKE 'Sample %';
 *
 * This only runs against a fresh dev DB with a user already created via
 * /setup — it does not create the User itself, to avoid seeding a password
 * you don't know.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found — run through /setup first, then re-run the seed.');
    return;
  }

  const skill = await prisma.skill.upsert({
    where: { userId_name: { userId: user.id, name: 'PostgreSQL' } },
    update: {},
    create: {
      userId: user.id,
      name: 'PostgreSQL',
      category: 'Databases',
      yearsOfExperience: 4,
      description: 'Sample skill — replace or delete freely.',
    },
  });

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Sample Project — Realtime Order Router',
      description: 'Sample project seeded for local development.',
      technologies: { create: [{ name: 'PostgreSQL' }, { name: 'Next.js' }] },
      skills: { create: [{ skillId: skill.id }] },
    },
  });

  await prisma.skillEvidence.create({
    data: { skillId: skill.id, projectId: project.id, note_text: 'Sample evidence link.' },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
