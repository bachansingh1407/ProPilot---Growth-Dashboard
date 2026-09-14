import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Briefcase,
  Trophy,
  GitBranch,
  Target,
  Wrench,
  TrendingUp,
  FolderGit2,
  Network,
  FileText,
  NotebookText,
  Gauge,
  FileSearch,
  ScanSearch,
  ClipboardList,
  MessagesSquare,
  HelpCircle,
  BookMarked,
  Building2,
  UserSearch,
  Globe,
  Settings,
  Sparkles,
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const NAV_TOP: NavItem = { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard };

export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Career',
    items: [
      { label: 'Experience', href: '/career/experience', icon: Briefcase },
      { label: 'Achievements', href: '/career/achievements', icon: Trophy },
      { label: 'Career Timeline', href: '/career/timeline', icon: GitBranch },
      { label: 'Career Goals', href: '/career/goals', icon: Target },
    ],
  },
  {
    label: 'Engineering',
    items: [
      { label: 'Skills', href: '/engineering/skills', icon: Wrench },
      { label: 'Improvements', href: '/engineering/improvements', icon: TrendingUp },
      { label: 'Projects', href: '/engineering/projects', icon: FolderGit2 },
      { label: 'Architecture', href: '/engineering/architecture', icon: Network },
      { label: 'ADRs', href: '/engineering/adrs', icon: FileText },
      { label: 'Engineering Notes', href: '/engineering/notes', icon: NotebookText },
      { label: 'Metrics', href: '/engineering/metrics', icon: Gauge },
    ],
  },
  {
    label: 'Career Preparation',
    items: [
      { label: 'Resume Lab', href: '/prep/resume-lab', icon: FileSearch },
      { label: 'ATS Analysis', href: '/prep/ats-analysis', icon: ScanSearch },
      { label: 'Applications', href: '/prep/applications', icon: ClipboardList },
      { label: 'Interviews', href: '/prep/interviews', icon: MessagesSquare },
      { label: 'Interview Questions', href: '/prep/interview-questions', icon: HelpCircle },
      { label: 'Story Bank', href: '/prep/story-bank', icon: BookMarked },
    ],
  },
  {
    label: 'Research',
    items: [
      { label: 'Companies', href: '/research/companies', icon: Building2 },
      { label: 'Roles', href: '/research/roles', icon: UserSearch },
    ],
  },
  {
    label: 'Intelligence',
    items: [{ label: 'Readiness', href: '/readiness', icon: Sparkles }],
  },
  {
    label: 'Public',
    items: [{ label: 'Portfolio', href: '/settings/privacy', icon: Globe }],
  },
];

export const NAV_SETTINGS: NavItem = { label: 'Settings', href: '/settings/account', icon: Settings };
