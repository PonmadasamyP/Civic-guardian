import React from 'react';
import { ShieldAlert, Heart, GraduationCap, MapPin, Database, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 pb-20 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-white font-extrabold text-lg tracking-tight">
                Civic Guardian
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              "Report the problem. Empower the community. Track the solution."
              A full-stack community civic problem reporting and resolution platform powered by Leaflet, exifr geotagging, and Supabase.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                <Lock className="w-3 h-3 text-emerald-400" />
                100% Citizen Anonymity
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                <MapPin className="w-3 h-3 text-blue-400" />
                EXIF GPS Verification
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                <Database className="w-3 h-3 text-purple-400" />
                Supabase & RLS
              </span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Platform Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-white transition-colors">Geotag Verification (&lt;100m)</li>
              <li className="hover:text-white transition-colors">Automated Priority Scoring</li>
              <li className="hover:text-white transition-colors">Nearby Duplicate Detection</li>
              <li className="hover:text-white transition-colors">Community Action & Resolution Proof (&lt;50m)</li>
              <li className="hover:text-white transition-colors">Credit Points & Leaderboard</li>
              <li className="hover:text-white transition-colors">Authority Hotspot Heatmap</li>
            </ul>
          </div>

          {/* College Viva Guide */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5 text-blue-400">
              <GraduationCap className="w-4 h-4" />
              College Viva Ready
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Built with clean modular architecture, mathematical priority calculation, and Row Level Security policies.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px]">
              <span className="text-slate-300 font-semibold block mb-0.5">Priority Formula:</span>
              <code className="text-blue-300 font-mono">(reports x 3) + sev_weight + (days x 0.5)</code>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Civic Guardian. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Academic Viva & Public Good
          </p>
        </div>
      </div>
    </footer>
  );
};
