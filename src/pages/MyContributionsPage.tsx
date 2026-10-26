import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useIssues } from '../context/IssueContext';
import { IssueCard } from '../components/IssueCard';
import { 
  User, 
  Coins, 
  Award, 
  ShieldCheck, 
  Lock, 
  MapPin, 
  CheckCircle2, 
  Flame, 
  Sparkles 
} from 'lucide-react';

export const MyContributionsPage: React.FC = () => {
  const { user } = useAuth();
  const { issues } = useIssues();
  const [activeTab, setActiveTab] = useState<'reported' | 'solved' | 'badges'>('reported');

  const myReported = issues.filter((i) => i.reporter_alias === user.alias);
  const mySolved = issues.filter((i) => i.solver_alias === user.alias && i.status === 'resolved');

  const allBadgesList = [
    {
      name: 'First Step',
      desc: 'Reported your first civic problem to the community.',
      icon: '🌱',
      earned: user.badges.includes('First Step'),
    },
    {
      name: 'Eagle Eye',
      desc: 'Reported issues with verified EXIF GPS coordinates within 100m.',
      icon: '👁️',
      earned: user.badges.includes('Eagle Eye'),
    },
    {
      name: 'Community Hero',
      desc: 'Volunteered and uploaded verified proof of resolution (<50m).',
      icon: '🛠️',
      earned: user.badges.includes('Community Hero'),
    },
    {
      name: 'Master Guardian',
      desc: 'Earned over 100 civic credit points through civic action.',
      icon: '👑',
      earned: user.points >= 100 || user.badges.includes('Master Guardian'),
    },
    {
      name: 'Eco Champion',
      desc: 'Helped clean community garbage and unsanitary dump sites.',
      icon: '🌿',
      earned: user.badges.includes('Eco Champion'),
    },
    {
      name: 'Pothole Patrol',
      desc: 'Reported road damage hazards to protect motorists.',
      icon: '🚧',
      earned: user.badges.includes('Pothole Patrol'),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 md:pb-12">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/30 border-2 border-white/20 flex items-center justify-center font-extrabold text-2xl text-white shadow-inner">
              {user.alias.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold backdrop-blur-md mb-1">
                <Lock className="w-3 h-3" />
                <span>100% Anonymous Profile</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {user.alias}
              </h1>
              <p className="text-xs text-blue-200 capitalize font-medium">
                Role: {user.role} &bull; Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Points & Stats */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl text-center">
              <span className="flex items-center justify-center gap-1.5 text-2xl font-extrabold text-amber-300">
                <Coins className="w-6 h-6 text-amber-400" />
                {user.points}
              </span>
              <span className="text-[11px] text-blue-200 uppercase tracking-wider font-semibold">
                Credit Points
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-2xl text-center">
              <span className="block text-2xl font-extrabold text-white">
                {user.badges.length}
              </span>
              <span className="text-[11px] text-blue-200 uppercase tracking-wider font-semibold">
                Badges Won
              </span>
            </div>
          </div>
        </div>

        {/* Anonymity note */}
        <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-blue-200/80 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Civic Guardian guarantees anonymity: Your name, email, phone number, and IP address are never exposed publicly or to authorities.
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-bold gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('reported')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'reported'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          My Reported Issues ({myReported.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('solved')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'solved'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Issues I Solved ({mySolved.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('badges')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'badges'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Badges & Honors ({user.badges.length})
        </button>
      </div>

      {/* Tab 1: Reported Issues */}
      {activeTab === 'reported' && (
        <div className="space-y-4">
          {myReported.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <p className="text-sm text-slate-500">You haven't submitted any civic issue reports yet.</p>
              <a
                href="/report"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Report an Issue Now
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myReported.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Solved Issues */}
      {activeTab === 'solved' && (
        <div className="space-y-4">
          {mySolved.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <p className="text-sm text-slate-500">
                You haven't resolved any community issues yet. Look for manageable community problems on the live map and click "I'll solve this"!
              </p>
              <a
                href="/feed"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Browse Issues to Solve
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySolved.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Badges */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {allBadgesList.map((badge) => (
            <div
              key={badge.name}
              className={`p-5 rounded-3xl border transition-all ${
                badge.earned
                  ? 'bg-white border-blue-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{badge.icon}</span>
                {badge.earned ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                    Locked
                  </span>
                )}
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{badge.name}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{badge.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
