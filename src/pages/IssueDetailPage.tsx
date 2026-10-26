import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useIssues } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import { CategoryBadge, PriorityBadge, StatusBadge, VerifiedBadge } from '../components/BadgePill';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { StatusTimeline } from '../components/StatusTimeline';
import { LeafletMap } from '../components/Map/LeafletMap';
import { SolveModal } from '../components/SolveModal';
import { getSeverityWeight, getDaysPending } from '../lib/priority';
import { formatCoordinates } from '../lib/geo';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  Building2, 
  Calculator, 
  Flame, 
  Share2, 
  ThumbsUp, 
  ShieldCheck 
} from 'lucide-react';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getIssueById, getTimeline, claimIssue, upvoteIssue, authorityUpdateStatus } = useIssues();
  const { user, role } = useAuth();

  const [solveModalOpen, setSolveModalOpen] = useState(false);
  const [authorityRemarks, setAuthorityRemarks] = useState('');
  const [authorityStatus, setAuthorityStatus] = useState<'pending' | 'in_progress' | 'resolved'>('in_progress');
  const [authoritySubmitting, setAuthoritySubmitting] = useState(false);

  const issue = getIssueById(id || '');
  const timeline = getTimeline(id || '');

  if (!issue) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Issue Not Found</h2>
        <p className="text-sm text-slate-500">The requested problem report does not exist or has been removed.</p>
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>
      </div>
    );
  }

  // Priority formula breakdown for viva presentation
  const sevWeight = getSeverityWeight(issue.severity);
  const daysPending = getDaysPending(issue.created_at);
  const duplicateMultiplier = issue.duplicate_count * 3;
  const timeMultiplier = Math.round(daysPending * 0.5 * 10) / 10;

  const handleClaim = async () => {
    await claimIssue(issue.id);
  };

  const handleUpvote = async () => {
    await upvoteIssue(issue.id);
  };

  const handleAuthoritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorityRemarks.trim()) return;

    setAuthoritySubmitting(true);
    await authorityUpdateStatus(issue.id, authorityStatus, authorityRemarks);
    setAuthorityRemarks('');
    setAuthoritySubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 md:pb-12">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <StatusBadge status={issue.status} />
          <PriorityBadge level={issue.priority_level} score={issue.priority_score} />
        </div>
      </div>

      {/* Main Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={issue.category} />
          <VerifiedBadge
            isVerified={issue.is_geotag_verified}
            distanceMeters={issue.verification_distance_meters}
          />
          {issue.duplicate_count > 1 && (
            <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 border border-purple-200 text-xs px-2.5 py-1 rounded-full">
              <Users className="w-3.5 h-3.5" />
              Reported by {issue.duplicate_count} Citizens
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {issue.title}
        </h1>

        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {issue.address || formatCoordinates(issue.latitude, issue.longitude)}
          </span>
          <span>&bull;</span>
          <span>
            Reported by <strong className="text-slate-800">{issue.reporter_alias}</strong>
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {new Date(issue.created_at).toLocaleDateString()} ({daysPending} days ago)
          </span>
        </div>
      </div>

      {/* Visual media: Before / After Slider if resolved, or Photo viewer */}
      {issue.status === 'resolved' && issue.resolved_image_url ? (
        <BeforeAfterSlider
          beforeImage={issue.image_url}
          afterImage={issue.resolved_image_url}
          distanceMeters={issue.resolution_distance_meters}
          solverAlias={issue.solver_alias}
          notes={issue.resolution_notes}
        />
      ) : (
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
          <img
            src={issue.image_url}
            alt={issue.title}
            className="w-full max-h-[460px] object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-black/70 backdrop-blur-md text-white font-bold text-xs rounded-lg shadow-sm">
              Original Issue Report Photo
            </span>
          </div>
          {issue.exif_metadata?.camera && (
            <div className="absolute bottom-4 right-4">
              <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-slate-200 text-[11px] rounded-md font-mono">
                📷 {issue.exif_metadata.camera}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Description & Action Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Issue Description
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {issue.description}
            </p>

            {/* Authority Remarks if present */}
            {issue.authority_remarks && (
              <div className="mt-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                  <Building2 className="w-4 h-4" />
                  <span>Official Municipal Authority Remarks</span>
                </div>
                <p className="text-xs text-indigo-900 italic">
                  "{issue.authority_remarks}"
                </p>
              </div>
            )}
          </div>

          {/* Audit Timeline */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Issue Resolution Timeline & Audit
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                {timeline.length} milestone events
              </span>
            </div>
            <StatusTimeline events={timeline} />
          </div>
        </div>

        {/* Right 1 Col: Priority Score Breakdown + Community Action + Map */}
        <div className="space-y-6">
          {/* Priority Score Mathematical Formula (Viva Presentation Card) */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-400" />
                Viva Priority Score Breakdown
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
                ★ {issue.priority_score}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono space-y-2">
              <div className="text-[11px] text-slate-400">Mathematical Formula:</div>
              <div className="text-blue-300 text-[11px] font-bold">
                (Nearby Reports x 3) + Severity + (Days x 0.5)
              </div>
              <div className="pt-2 border-t border-white/10 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reports Multiplier ({issue.duplicate_count} x 3):</span>
                  <span className="text-white font-bold">+{duplicateMultiplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Severity Weight ({issue.severity}):</span>
                  <span className="text-white font-bold">+{sevWeight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Age Factor ({daysPending}d x 0.5):</span>
                  <span className="text-white font-bold">+{timeMultiplier}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/10 font-bold text-amber-300">
                  <span>Computed Priority:</span>
                  <span>{issue.priority_score} ({issue.priority_level.toUpperCase()})</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-normal">
              High priority issues ($\ge 8.0$) are highlighted with red pulse markers and surfaced directly to municipal engineers.
            </p>
          </div>

          {/* Community Action Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-500" />
              Community Citizen Action
            </h3>

            {issue.status === 'pending' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Can you or your neighbors fix or clean this issue? Volunteer to take responsibility!
                </p>
                <button
                  type="button"
                  onClick={handleClaim}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Wrench className="w-4 h-4" />
                  <span>I'll solve this (+50 pts)</span>
                </button>
              </div>
            )}

            {issue.status === 'in_progress' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
                  Currently claimed by <strong className="font-semibold">{issue.solver_alias || 'Volunteer'}</strong>.
                </div>
                <button
                  type="button"
                  onClick={() => setSolveModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Upload Resolution Proof (&lt;50m)</span>
                </button>
              </div>
            )}

            {issue.status === 'resolved' && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Issue resolved and verified! Credit points awarded.</span>
              </div>
            )}

            {/* Upvote / Confirm Button */}
            <button
              type="button"
              onClick={handleUpvote}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <ThumbsUp className="w-4 h-4 text-blue-600" />
              <span>Confirm this Issue (+5 pts)</span>
            </button>
          </div>

          {/* Government Authority Controls (If role is authority) */}
          {role === 'authority' && (
            <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-700" />
                <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider">
                  Authority Officer Controls
                </h3>
              </div>

              <form onSubmit={handleAuthoritySubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 uppercase tracking-wider mb-1">
                    Update Status
                  </label>
                  <select
                    value={authorityStatus}
                    onChange={(e) => setAuthorityStatus(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl border border-indigo-200 bg-white font-semibold text-indigo-900"
                  >
                    <option value="pending">Pending Official Inspection</option>
                    <option value="in_progress">Dispatched Repair Team</option>
                    <option value="resolved">Mark Officially Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-indigo-950 uppercase tracking-wider mb-1">
                    Official Remarks / Work Order
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={authorityRemarks}
                    onChange={(e) => setAuthorityRemarks(e.target.value)}
                    placeholder="e.g. Ward 4 road asphalt contractor notified. Repair scheduled..."
                    className="w-full p-2.5 text-xs rounded-xl border border-indigo-200 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authoritySubmitting}
                  className="w-full py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-md transition-colors"
                >
                  {authoritySubmitting ? 'Updating...' : 'Publish Official Update'}
                </button>
              </form>
            </div>
          )}

          {/* Location Map with 100m radius */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Location & Duplicate Boundary
            </h3>
            <LeafletMap
              center={[issue.latitude, issue.longitude]}
              zoom={16}
              issues={[issue]}
              showRadiusCircle={{
                lat: issue.latitude,
                lng: issue.longitude,
                radiusMeters: 100,
                color: '#3b82f6',
              }}
              height="200px"
            />
          </div>
        </div>
      </div>

      {/* Resolution Proof Modal */}
      {solveModalOpen && (
        <SolveModal issue={issue} onClose={() => setSolveModalOpen(false)} />
      )}
    </div>
  );
};
