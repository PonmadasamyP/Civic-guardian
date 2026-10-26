import React, { useState, useMemo } from 'react';
import { useIssues } from '../context/IssueContext';
import { LeafletMap } from '../components/Map/LeafletMap';
import { IssueCard } from '../components/IssueCard';
import { Issue, IssueCategory, IssueStatus, PriorityLevel } from '../types';
import { sortIssues } from '../lib/priority';
import { 
  Filter, 
  MapPin, 
  List, 
  Layers, 
  Search, 
  SlidersHorizontal, 
  Flame, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export const FeedPage: React.FC = () => {
  const { issues, claimIssue } = useIssues();

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'priority' | 'newest' | 'urgency'>('priority');
  const [selectedIssueId, setSelectedIssueId] = useState<string | undefined>(undefined);
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  // Filter & sort logic
  const filteredIssues = useMemo(() => {
    let result = issues.filter((issue) => {
      // Category filter
      if (selectedCategory !== 'all' && issue.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && issue.status !== selectedStatus) {
        return false;
      }
      // Priority filter
      if (selectedPriority !== 'all' && issue.priority_level !== selectedPriority) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(q);
        const matchesDesc = issue.description.toLowerCase().includes(q);
        const matchesAddress = (issue.address || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAddress) return false;
      }
      return true;
    });

    return sortIssues(result, sortBy);
  }, [issues, selectedCategory, selectedStatus, selectedPriority, searchQuery, sortBy]);

  // Center coordinates based on selected issue or first issue
  const activeIssue = issues.find((i) => i.id === selectedIssueId);
  const mapCenter: [number, number] = activeIssue
    ? [activeIssue.latitude, activeIssue.longitude]
    : [12.9716, 77.5946];

  const categories: { label: string; value: string }[] = [
    { label: 'All Categories', value: 'all' },
    { label: 'Road Damage', value: 'road damage' },
    { label: 'Streetlight', value: 'streetlight' },
    { label: 'Drainage', value: 'drainage' },
    { label: 'Garbage', value: 'garbage' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-12">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Live Civic Problem Feed
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time map and feed of community issues sorted by verified priority score.
          </p>
        </div>

        {/* Mobile Map / List Toggle */}
        <div className="flex md:hidden items-center justify-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setMobileView('map')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileView === 'map'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Interactive Map
          </button>
          <button
            type="button"
            onClick={() => setMobileView('list')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileView === 'list'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List Feed ({filteredIssues.length})
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, street, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Action</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-blue-700"
          >
            <option value="priority">Sort by: Priority Score (High first)</option>
            <option value="urgency">Sort by: Severity (High/Med/Low)</option>
            <option value="newest">Sort by: Newest Reported</option>
          </select>
        </div>

        {/* Priority quick filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Priority:</span>
          {['all', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPriority(p)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors capitalize ${
                selectedPriority === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            Showing <strong className="text-slate-800">{filteredIssues.length}</strong> problems
          </span>
        </div>
      </div>

      {/* Main Split Layout: Map on top/left, Feed Cards on bottom/right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Panel (Always visible on desktop, toggled on mobile) */}
        <div
          className={`lg:col-span-7 sticky top-20 ${
            mobileView === 'list' ? 'hidden md:block' : 'block'
          }`}
        >
          <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                OpenStreetMap City View
              </span>
              <span className="text-[11px] text-slate-400">
                Pulsing pins denote High Priority hazards
              </span>
            </div>

            <LeafletMap
              center={mapCenter}
              zoom={14}
              issues={filteredIssues}
              selectedIssueId={selectedIssueId}
              onSelectIssue={(issue) => {
                setSelectedIssueId(issue.id);
              }}
              height="480px"
            />
          </div>
        </div>

        {/* Cards List Panel */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            mobileView === 'map' ? 'hidden md:block' : 'block'
          }`}
        >
          {filteredIssues.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">No civic problems match filters</h3>
              <p className="text-xs text-slate-500">
                Try resetting your filters or search terms.
              </p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssueId(issue.id)}
                className={`cursor-pointer transition-transform ${
                  selectedIssueId === issue.id ? 'ring-2 ring-blue-500 rounded-2xl' : ''
                }`}
              >
                <IssueCard
                  issue={issue}
                  showSolveAction={true}
                  onSolveClick={(i) => claimIssue(i.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
