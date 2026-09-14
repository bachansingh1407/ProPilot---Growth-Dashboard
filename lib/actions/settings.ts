'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/db/client';
import { profileSchema, portfolioVisibilitySchema } from '@/lib/validation/settings';
import { logActivity } from './activity';

export async function updateProfile(_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  await prisma.profile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      fullName: parsed.data.fullName,
      headline: parsed.data.headline || undefined,
      currentTitle: parsed.data.currentTitle || undefined,
      yearsOfExperience: parsed.data.yearsOfExperience,
      primaryFocus: parsed.data.primaryFocus || undefined,
      location: parsed.data.location || undefined,
      bio: parsed.data.bio || undefined,
      contactEmail: parsed.data.contactEmail || undefined,
      githubUrl: parsed.data.githubUrl || undefined,
      linkedinUrl: parsed.data.linkedinUrl || undefined,
      websiteUrl: parsed.data.websiteUrl || undefined,
    },
    update: {
      fullName: parsed.data.fullName,
      headline: parsed.data.headline || undefined,
      currentTitle: parsed.data.currentTitle || undefined,
      yearsOfExperience: parsed.data.yearsOfExperience,
      primaryFocus: parsed.data.primaryFocus || undefined,
      location: parsed.data.location || undefined,
      bio: parsed.data.bio || undefined,
      contactEmail: parsed.data.contactEmail || undefined,
      githubUrl: parsed.data.githubUrl || undefined,
      linkedinUrl: parsed.data.linkedinUrl || undefined,
      websiteUrl: parsed.data.websiteUrl || undefined,
    },
  });

  await logActivity({ userId: user.id, type: 'UPDATED', entityType: 'Profile', entityId: user.id, summary: 'Updated profile' });

  revalidatePath('/settings/account');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updatePortfolioVisibility(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const user = await requireUser();
  const parsed = portfolioVisibilitySchema.safeParse({
    isPortfolioPublished: formData.get('isPortfolioPublished') === 'on',
    portfolioSlug: formData.get('portfolioSlug'),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input.' };

  if (parsed.data.isPortfolioPublished && !parsed.data.portfolioSlug) {
    return { error: 'Choose a slug before publishing your portfolio.' };
  }

  if (parsed.data.portfolioSlug) {
    const existing = await prisma.profile.findUnique({ where: { portfolioSlug: parsed.data.portfolioSlug } });
    if (existing && existing.userId !== user.id) {
      return { error: 'That slug is already taken.' };
    }
  }

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return { error: 'Set up your profile in Account settings first.' };

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      isPortfolioPublished: parsed.data.isPortfolioPublished,
      portfolioSlug: parsed.data.portfolioSlug || profile.portfolioSlug,
    },
  });

  await logActivity({
    userId: user.id,
    type: 'UPDATED',
    entityType: 'Profile',
    entityId: user.id,
    summary: parsed.data.isPortfolioPublished ? 'Published public portfolio' : 'Unpublished public portfolio',
  });

  revalidatePath('/settings/privacy');
  return { success: true };
}

export async function toggleProjectVisibility(id: string, isPublic: boolean) {
  const user = await requireUser();
  const owned = await prisma.project.findFirst({ where: { id, userId: user.id } });
  if (!owned) throw new Error('Not found');
  await prisma.project.update({ where: { id }, data: { isPublic } });
  revalidatePath('/settings/privacy');
}

export async function toggleExperienceVisibility(id: string, isPublic: boolean) {
  const user = await requireUser();
  const owned = await prisma.experience.findFirst({ where: { id, userId: user.id } });
  if (!owned) throw new Error('Not found');
  await prisma.experience.update({ where: { id }, data: { isPublic } });
  revalidatePath('/settings/privacy');
}

export async function toggleAchievementVisibility(id: string, isPublic: boolean) {
  const user = await requireUser();
  const owned = await prisma.achievement.findFirst({ where: { id, userId: user.id } });
  if (!owned) throw new Error('Not found');
  await prisma.achievement.update({ where: { id }, data: { isPublic } });
  revalidatePath('/settings/privacy');
}
