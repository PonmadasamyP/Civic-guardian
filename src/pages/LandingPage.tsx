import React from 'react';
import { Link } from 'react-router-dom';
import { useIssues } from '../context/IssueContext';
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  ArrowRight, 
  Camera, 
  Flame, 
  Award, 
  CheckCircle2, 
  Building2, 
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { issues } = useIssues();

  const totalReported = issues.length;
  const totalResolved = issues.filter((i) => i.status === 'resolved').length;
  const highPriorityCount = issues.filter((i) => i.priority_level === 'high' && i.status !== 'resolved').length;
  const verifiedCount = issues.filter((i) => i.is_geotag_verified).length;

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 rounded-b-[2.5rem] shadow-xl">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Community Civic Problem Reporting & Resolution Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Report the problem.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Empower the community.
            </span>{' '}
            Track the solution.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Civic Guardian connects anonymous citizens and local authorities to rapidly detect, prioritize, and resolve civic hazards with cryptographic EXIF GPS verification and community action.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/report"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 group"
            >
              <Camera className="w-4 h-4" />
              <span>Report a Civic Problem</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/feed"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-sm border border-slate-700 backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Explore Live Map</span>
            </Link>

            <Link
              to="/authority"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 font-bold text-sm border border-indigo-700/50 backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Authority Portal</span>
            </Link>
          </div>

          {/* Live KPI Counters */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-white">
                {totalReported}
              </span>
              <span className="text-xs text-slate-400 font-medium">Issues Logged</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {totalResolved}
              </span>
              <span className="text-xs text-slate-400 font-medium">Community Solved</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-rose-400">
                {highPriorityCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">High Priority</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-cyan-400">
                {verifiedCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">Verified Geotags</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How Civic Guardian Solves Community Problems
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Engineered to overcome delayed municipal action, duplicate complaints, and false reporting with intelligent verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                1. Geotag EXIF Verification
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Photos are parsed with the <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">exifr</code> library. The system extracts camera GPS metadata and cross-references it with live browser location within a 100m radius, eliminating fake or downloaded images.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-blue-600 flex items-center gap-1">
              <span>Mandatory GPS Validation</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                2. Algorithmic Priority & Merging
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Duplicate reports within 100 meters are automatically merged with a "Reported by N citizens" count. Priority scores dynamically scale using:
                <br />
                <span className="font-mono text-[11px] bg-slate-100 p-1 rounded inline-block mt-1 text-slate-800">
                  (Nearby Reports x 3) + Severity + (Days Pending x 0.5)
                </span>
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-rose-600 flex items-center gap-1">
              <span>Automated Cluster Scoring</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                3. Community Action & Proof (&lt;50m)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Small problems don't need to wait for government tenders. Responsible citizens volunteer ("I'll solve this"), upload an "after" photo taken within 50m of the issue spot, and earn 50 civic credit points!
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>Gamified Civic Resolutions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Anonymity Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Lock className="w-3.5 h-3.5" />
              <span>Cryptographic Anonymity Guarantee</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Report Safely Without Fear of Retaliation
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Whistleblowers and active citizens are fully protected. Civic Guardian only exposes random aliases such as <span className="text-cyan-300 font-mono font-bold">"Citizen #4821"</span>. With Supabase Row-Level Security (RLS), real identities, phone numbers, and emails are strictly sequestered from public views and government officials.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
