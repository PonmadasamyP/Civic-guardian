import React from 'react';
import { IssueCategory, IssueSeverity, IssueStatus, PriorityLevel } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Flame, 
  Zap, 
  Droplet, 
  Trash2, 
  HelpCircle 
} from 'lucide-react';

export const CategoryBadge: React.FC<{ category: IssueCategory; size?: 'sm' | 'md' }> = ({
  category,
  size = 'md',
}) => {
  const configs: Record<IssueCategory, { label: string; bg: string; text: string; icon: any }> = {
    'road damage': {
      label: 'Road Damage',
      bg: 'bg-amber-100 border-amber-200 text-amber-800',
      text: 'text-amber-800',
      icon: AlertTriangle,
    },
    streetlight: {
      label: 'Streetlight',
      bg: 'bg-yellow-100 border-yellow-200 text-yellow-800',
      text: 'text-yellow-800',
      icon: Zap,
    },
    drainage: {
      label: 'Drainage',
      bg: 'bg-cyan-100 border-cyan-200 text-cyan-800',
      text: 'text-cyan-800',
      icon: Droplet,
    },
    garbage: {
      label: 'Garbage',
      bg: 'bg-emerald-100 border-emerald-200 text-emerald-800',
      text: 'text-emerald-800',
      icon: Trash2,
    },
    other: {
      label: 'Other Civic',
      bg: 'bg-purple-100 border-purple-200 text-purple-800',
      text: 'text-purple-800',
      icon: HelpCircle,
    },
  };

  const config = configs[category] || configs.other;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ level: PriorityLevel; score?: number }> = ({
  level,
  score,
}) => {
  const configs: Record<PriorityLevel, { label: string; bg: string; text: string; border: string; icon: any }> = {
    high: {
      label: 'High Priority',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: Flame,
    },
    medium: {
      label: 'Medium Priority',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: AlertTriangle,
    },
    low: {
      label: 'Low Priority',
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: Clock,
    },
  };

  const config = configs[level];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
      title={score ? `Priority Score: ${score}` : undefined}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="ml-0.5 px-1.5 py-0.2 rounded bg-white/70 text-[10px] font-mono font-bold border border-current/20">
          {score}
        </span>
      )}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IssueStatus }> = ({ status }) => {
  const configs: Record<IssueStatus, { label: string; bg: string; text: string; icon: any }> = {
    pending: {
      label: 'Pending Action',
      bg: 'bg-amber-100 text-amber-800 border-amber-200',
      text: 'text-amber-700',
      icon: Clock,
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-blue-100 text-blue-800 border-blue-200',
      text: 'text-blue-700',
      icon: Wrench,
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      text: 'text-emerald-700',
      icon: CheckCircle2,
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};

export const VerifiedBadge: React.FC<{
  isVerified: boolean;
  distanceMeters?: number;
  compact?: boolean;
}> = ({ isVerified, distanceMeters, compact = false }) => {
  if (isVerified) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 ${
          compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        }`}
        title={
          distanceMeters !== undefined
            ? `Photo GPS matches current user location within ${Math.round(distanceMeters)}m (limit: 100m)`
            : 'Geotag matches verified GPS location'
        }
      >
        <ShieldCheck className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5 text-emerald-600'} />
        <span>Verified Location</span>
        {distanceMeters !== undefined && (
          <span className="text-[10px] text-emerald-600 font-normal">
            ({Math.round(distanceMeters)}m)
          </span>
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border bg-slate-100 text-slate-600 border-slate-200 ${
        compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
      title={
        distanceMeters !== undefined
          ? `Photo GPS is ${Math.round(distanceMeters)}m away from device (threshold: 100m)`
          : 'Location unverified or taken offsite'
      }
    >
      <AlertTriangle className={compact ? 'w-3 h-3 text-amber-500' : 'w-3.5 h-3.5 text-amber-500'} />
      <span>Unverified Location</span>
    </span>
  );
};
