import type { SkillLevel } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { SKILL_LEVEL_LABEL, SKILL_LEVEL_BADGE_VARIANT } from '@/lib/analysis/skill-level';

export function SkillLevelBadge({ level, isOverridden }: { level: SkillLevel; isOverridden?: boolean }) {
  return (
    <Badge variant={SKILL_LEVEL_BADGE_VARIANT[level]}>
      {SKILL_LEVEL_LABEL[level]}
      {isOverridden && <span className="ml-1 opacity-70">(manual)</span>}
    </Badge>
  );
}
