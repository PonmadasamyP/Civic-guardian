import React from 'react';
import { TimelineEvent } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Users, 
  Wrench, 
  Award, 
  Building2 
} from 'lucide-react';

interface StatusTimelineProps {
  events: TimelineEvent[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ events }) => {
  const getActionConfig = (action: TimelineEvent['action']) => {
    switch (action) {
      case 'REPORTED':
        return {
          icon: MapPin,
          bg: 'bg-blue-100 text-blue-700 border-blue-200',
          title: 'Problem Reported',
        };
      case 'LOCATION_VERIFIED':
        return {
          icon: ShieldCheck,
          bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          title: 'Geotag Verification Confirmed',
        };
      case 'NEARBY_MERGED':
        return {
          icon: Users,
          bg: 'bg-purple-100 text-purple-700 border-purple-200',
          title: 'Nearby Citizens Joined & Merged',
        };
      case 'CLAIMED_BY_CITIZEN':
        return {
          icon: Wrench,
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          title: 'Citizen Volunteered to Solve',
        };
      case 'AUTHORITY_ACKNOWLEDGED':
        return {
          icon: Building2,
          bg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
          title: 'Official Authority Update',
        };
      case 'PROOF_SUBMITTED':
        return {
          icon: ShieldCheck,
          bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          title: 'Proof of Resolution Submitted',
        };
      case 'RESOLVED':
        return {
          icon: Award,
          bg: 'bg-emerald-600 text-white border-emerald-600',
          title: 'Issue Resolved & Credit Points Awarded',
        };
      default:
        return {
          icon: Clock,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          title: 'Status Update',
        };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, idx) => {
          const config = getActionConfig(event.action);
          const Icon = config.icon;
          const isLast = idx === events.length - 1;

          return (
            <li key={event.id || idx}>
              <div className="relative pb-8">
                {/* Connecting vertical line */}
                {!isLast && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex items-start space-x-3.5">
                  {/* Action Icon */}
                  <div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border shadow-xs ${config.bg}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <p className="text-sm font-bold text-slate-900">
                        {config.title}
                      </p>
                      <time className="text-xs text-slate-400 font-mono">
                        {formatDate(event.created_at)}
                      </time>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span>Action by:</span>
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {event.actor_alias}
                      </span>
                    </div>

                    {event.notes && (
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
