import React, { useState, useMemo } from 'react';
import { useIssues } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import { LeafletMap } from '../components/Map/LeafletMap';
import { CategoryBadge, PriorityBadge, StatusBadge } from '../components/BadgePill';
import { Issue, IssueCategory, IssueStatus } from '../types';
import { formatCoordinates } from '../lib/geo';
import { 
  Building2, 
  Flame, 
  Layers, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Radio, 
  FileText, 
  AlertTriangle, 
  CheckSquare, 
  Eye, 
  ShieldAlert 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AuthorityDashboard: React.FC = () => {
  const { issues, authorityUpdateStatus } = useIssues();
  const { user, role, switchRole } = useAuth();

  // Filters & State
  const [filterPriority, setFilterPriority] = useState<string>('high'); // Default to high priority as requested
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchArea, setSearchArea] = useState<string>('');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Status update modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargetIssue, setModalTargetIssue] = useState<Issue | null>(null);
  const [newStatus, setNewStatus] = useState<IssueStatus>('in_progress');
  const [officialRemarks, setOfficialRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Metrics
  const totalIssues = issues.length;
  const highPriorityCount = issues.filter((i) => i.priority_level === 'high' && i.status !== 'resolved').length;
  const inProgressCount = issues.filter((i) => i.status === 'in_progress').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;

  // Filtered issues
  const displayedIssues = useMemo(() => {
    return issues.filter((i) => {
      if (filterPriority !== 'all' && i.priority_level !== filterPriority) return false;
      if (filterCategory !== 'all' && i.category !== filterCategory) return false;
      if (filterStatus !== 'all' && i.status !== filterStatus) return false;
      if (searchArea.trim()) {
        const q = searchArea.toLowerCase();
        const inAddr = (i.address || '').toLowerCase().includes(q);
        const inTitle = i.title.toLowerCase().includes(q);
        if (!inAddr && !inTitle) return false;
      }
      return true;
    });
  }, [issues, filterPriority, filterCategory, filterStatus, searchArea]);

  const handleOpenUpdateModal = (issue: Issue) => {
    setModalTargetIssue(issue);
    setNewStatus(issue.status);
    setOfficialRemarks(issue.authority_remarks || '');
    setModalOpen(true);
  };

  const handleSaveStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTargetIssue) return;

    setSubmitting(true);
    await authorityUpdateStatus(modalTargetIssue.id, newStatus, officialRemarks);
    setSubmitting(false);
    setModalOpen(false);
    setModalTargetIssue(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 md:pb-12">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-700" />
            <span>Government & Municipal Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Authority Command Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time urban problem monitoring, hotspot density detection, and official status dispatch.
          </p>
        </div>

        {/* Persona quick switch notice if user is citizen */}
        {role !== 'authority' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <span className="text-amber-900 font-medium">
              You are currently viewing as <strong>{user.alias}</strong> ({role}).
            </span>
            <button
              type="button"
              onClick={() => switchRole('authority')}
              className="px-3 py-1 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Switch to Authority Mode
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Civic Reports
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {totalIssues}
          </div>
          <p className="text-[11px] text-slate-500">Across all city wards</p>
        </div>

        <div className="bg-rose-50 p-5 rounded-3xl border border-rose-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            Critical / High Priority
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-700">
            {highPriorityCount}
          </div>
          <p className="text-[11px] text-rose-600">Requires urgent dispatch</p>
        </div>

        <div className="bg-blue-50 p-5 rounded-3xl border border-blue-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            In Progress
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">
            {inProgressCount}
          </div>
          <p className="text-[11px] text-blue-600">Volunteers & Work crews active</p>
        </div>

        <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {resolvedCount}
          </div>
          <p className="text-[11px] text-emerald-600">Geotag proof validated</p>
        </div>
      </div>

      {/* Map with Heatmap Hotspots Toggle */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              City Problem Density & Hotspot Map
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors">
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={(e) => setShowHeatmap(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-sm"
              />
              <span className="flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-rose-500" />
                Show Problem Hotspots Heatmap
              </span>
            </label>
          </div>
        </div>

        <LeafletMap
          center={[12.9716, 77.5946]}
          zoom={14}
          issues={displayedIssues}
          showHeatmapHotspots={showHeatmap}
          height="450px"
        />
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Red glowing halos indicate high-density civic hazard zones.</span>
          <span>Click on any pin to view issue summary.</span>
        </div>
      </div>

      {/* Filters and Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 space-y-3">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            Filter & Dispatch Civic Work Orders
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Area Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by Ward / Street / Area..."
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold text-rose-700 bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High Priority Only</option>
              <option value="medium">🟠 Medium Priority</option>
              <option value="low">🟢 Low Priority</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white capitalize"
            >
              <option value="all">All Categories</option>
              <option value="road damage">Road Damage</option>
              <option value="streetlight">Streetlight</option>
              <option value="drainage">Drainage</option>
              <option value="garbage">Garbage</option>
              <option value="other">Other</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Action</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Issues List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Category & Title</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Priority Score</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedIssues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No issues found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                displayedIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <CategoryBadge category={issue.category} size="sm" />
                        <h4 className="font-bold text-slate-900 line-clamp-1">{issue.title}</h4>
                        <span className="text-[11px] text-slate-500">
                          {issue.duplicate_count > 1
                            ? `👥 ${issue.duplicate_count} Citizens Affected`
                            : `By ${issue.reporter_alias}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-[200px] truncate">
                      <div className="flex items-center gap-1" title={issue.address || ''}>
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{issue.address || formatCoordinates(issue.latitude, issue.longitude)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge level={issue.priority_level} score={issue.priority_score} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenUpdateModal(issue)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        Update Status
                      </button>
                      <Link
                        to={`/issues/${issue.id}`}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors inline-block"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Status Update Modal */}
      {modalOpen && modalTargetIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-300" />
                <h3 className="font-bold text-sm sm:text-base">
                  Update Official Issue Status
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-indigo-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStatusUpdate} className="p-6 space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Selected Issue:</p>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">{modalTargetIssue.title}</h4>
                <p className="text-xs text-slate-500">{modalTargetIssue.address}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as IssueStatus)}
                  className="w-full p-3 text-sm rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="pending">Pending Official Inspection</option>
                  <option value="in_progress">In Progress (Work Crew Dispatched)</option>
                  <option value="resolved">Resolved (Repairs Finished)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Official Remarks & Contractor Instructions
                </label>
                <textarea
                  required
                  rows={3}
                  value={officialRemarks}
                  onChange={(e) => setOfficialRemarks(e.target.value)}
                  placeholder="e.g. Ward road contractor visited site. Asphalt patching complete. Inspected and approved."
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-md"
                >
                  {submitting ? 'Saving...' : 'Save & Notify Public'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
