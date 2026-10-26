import React from 'react';
import { INITIAL_LEADERBOARD } from '../lib/mockData';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  Medal, 
  Coins, 
  Award, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  MapPin 
} from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const leaderboard = INITIAL_LEADERBOARD;

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 md:pb-12">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Community Hall of Fame</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Citizen Guardian Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Celebrating anonymous citizens who make our neighborhoods cleaner, safer, and better through verified civic action.
        </p>
      </div>

      {/* Credit Rules Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">+15 Credit Points</span>
            <span className="text-[11px] text-slate-500">For reporting issue with verified EXIF GPS</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">+5 - +10 Points</span>
            <span className="text-[11px] text-slate-500">For confirming nearby duplicate issues</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">+50 Credit Points</span>
            <span className="text-[11px] text-slate-500">For verified community resolution proof (&lt;50m)</span>
          </div>
        </div>
      </div>

      {/* Podium for Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
        {/* Rank 2 */}
        {top3[1] && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-3 order-2 md:order-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-xl font-extrabold text-slate-700">
              🥈
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              Rank #2
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">{top3[1].alias}</h3>
            <p className="text-xl font-black text-blue-600 font-mono">{top3[1].points} pts</p>
            <div className="flex flex-wrap justify-center gap-1">
              {top3[1].badges.map((b) => (
                <span key={b} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rank 1 (Tall Center) */}
        {top3[0] && (
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-8 border-2 border-amber-300 shadow-lg text-center space-y-3 order-1 md:order-2 transform md:-translate-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-400 border-2 border-amber-300 flex items-center justify-center text-3xl font-extrabold text-white shadow-md">
              👑
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-bold">
              🥇 Champion Guardian
            </span>
            <h3 className="font-extrabold text-slate-900 text-lg">{top3[0].alias}</h3>
            <p className="text-2xl font-black text-amber-600 font-mono">{top3[0].points} pts</p>
            <div className="flex flex-wrap justify-center gap-1">
              {top3[0].badges.map((b) => (
                <span key={b} className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rank 3 */}
        {top3[2] && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-3 order-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-400/60 flex items-center justify-center text-xl font-extrabold text-amber-800">
              🥉
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">
              Rank #3
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">{top3[2].alias}</h3>
            <p className="text-xl font-black text-blue-600 font-mono">{top3[2].points} pts</p>
            <div className="flex flex-wrap justify-center gap-1">
              {top3[2].badges.map((b) => (
                <span key={b} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table for Remaining Ranks */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            All Verified Anonymous Contributors
          </h3>
          <span className="text-xs text-slate-400 font-medium">Updated live</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Rank</th>
                <th className="px-6 py-3">Anonymous Alias</th>
                <th className="px-6 py-3">Problems Solved</th>
                <th className="px-6 py-3">Issues Reported</th>
                <th className="px-6 py-3 text-right">Credit Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaderboard.map((item) => (
                <tr
                  key={item.alias}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    item.alias === user.alias ? 'bg-blue-50/50 font-bold' : ''
                  }`}
                >
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">
                    #{item.rank}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {item.alias.slice(0, 2)}
                      </div>
                      <span className="font-bold text-slate-900">{item.alias}</span>
                      {item.alias === user.alias && (
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-semibold">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-emerald-600">
                    {item.solved_count} solved
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.reported_count} reported
                  </td>
                  <td className="px-6 py-4 text-right font-black text-blue-600 font-mono">
                    {item.points} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
