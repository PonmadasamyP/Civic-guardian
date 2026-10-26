import React from 'react';
import { Link } from 'react-router-dom';
import { Issue } from '../types';
import { CategoryBadge, PriorityBadge, StatusBadge, VerifiedBadge } from './BadgePill';
import { MapPin, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCoordinates } from '../lib/geo';

interface IssueCardProps {
  issue: Issue;
  onSolveClick?: (issue: Issue) => void;
  showSolveAction?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onSolveClick,
  showSolveAction = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Image container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={issue.status === 'resolved' && issue.resolved_image_url ? issue.resolved_image_url : issue.image_url}
          alt={issue.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top badges overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-1 pointer-events-none">
          <CategoryBadge category={issue.category} size="sm" />
          <PriorityBadge level={issue.priority_level} score={issue.priority_score} />
        </div>

        {/* Bottom resolved or verified tag */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 pointer-events-none">
          <VerifiedBadge isVerified={issue.is_geotag_verified} distanceMeters={issue.verification_distance_meters} compact />
          {issue.status === 'resolved' && (
            <span className="bg-emerald-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
              <CheckCircle2 className="w-3 h-3" />
              Resolved
            </span>
          )}
        </div>
      </div>

      {/* Body content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Status & duplicate count */}
          <div className="flex items-center justify-between text-xs mb-2">
            <StatusBadge status={issue.status} />
            {issue.duplicate_count > 1 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                <Users className="w-3 h-3" />
                Reported by {issue.duplicate_count} citizens
              </span>
            ) : (
              <span className="text-slate-500 font-medium text-[11px]">
                By {issue.reporter_alias}
              </span>
            )}
          </div>

          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
            {issue.title}
          </h3>

          <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Footer meta */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 max-w-[65%] truncate" title={issue.address || ''}>
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {issue.address || formatCoordinates(issue.latitude, issue.longitude)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {showSolveAction && issue.status === 'pending' && onSolveClick && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onSolveClick(issue);
                }}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                I'll solve this
              </button>
            )}

            <Link
              to={`/issues/${issue.id}`}
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Details
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
