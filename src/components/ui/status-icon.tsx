import { 
  CircleDashed, 
  CalendarCheck, 
  CalendarClock, 
  CheckCircle2, 
  Clock, 
  SkipForward, 
  Undo2,
  Trophy,
  XCircle,
  Snowflake,
  Scale,
  ArrowRight,
  Send,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  'circle-dashed': CircleDashed,
  'calendar-check': CalendarCheck,
  'calendar-clock': CalendarClock,
  'check-circle-2': CheckCircle2,
  'clock': Clock,
  'skip-forward': SkipForward,
  'undo-2': Undo2,
  'trophy': Trophy,
  'x-circle': XCircle,
  'snowflake': Snowflake,
  'scale': Scale,
  'arrow-right': ArrowRight,
  'send': Send,
};

// Color class mapping
const colorClasses: Record<string, string> = {
  gray: 'text-gray-500 dark:text-gray-400',
  blue: 'text-blue-600 dark:text-blue-400',
  orange: 'text-orange-600 dark:text-orange-400',
  green: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
  red: 'text-red-600 dark:text-red-400',
  cyan: 'text-cyan-600 dark:text-cyan-400',
  purple: 'text-purple-600 dark:text-purple-400',
  primary: 'text-primary',
};

interface StatusIconProps {
  iconName: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIcon({ iconName, color = 'gray', size = 'sm', className }: StatusIconProps) {
  const IconComponent = iconMap[iconName];
  
  if (!IconComponent) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <IconComponent 
      className={cn(
        sizeClasses[size],
        colorClasses[color] || colorClasses.gray,
        className
      )} 
    />
  );
}

export { iconMap, colorClasses };
