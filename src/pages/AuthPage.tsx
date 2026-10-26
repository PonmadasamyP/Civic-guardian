import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { generateCitizenAlias } from '../lib/anonymity';
import { 
  ShieldAlert, 
  Lock, 
  User, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAs, user } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [alias, setAlias] = useState(generateCitizenAlias());
  const [password, setPassword] = useState('password123');

  const handleGenerateNewAlias = () => {
    setAlias(generateCitizenAlias());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs(alias, selectedRole);
    if (selectedRole === 'authority') {
      navigate('/authority');
    } else {
      navigate('/feed');
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    if (role === 'citizen') {
      loginAs(generateCitizenAlias(), 'citizen');
      navigate('/feed');
    } else if (role === 'authority') {
      loginAs('Civic Authority (Ward #04)', 'authority');
      navigate('/authority');
    } else {
      loginAs('Administrator #01', 'admin');
      navigate('/authority');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-8 text-center bg-gradient-to-b from-blue-900 to-indigo-950 text-white relative">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center font-bold shadow-lg shadow-blue-500/30 mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            Sign In to Civic Guardian
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            "Report the problem. Empower the community. Track the solution."
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-[11px] font-semibold backdrop-blur-md">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Guaranteed Citizen Anonymity</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('citizen');
                  setAlias(generateCitizenAlias());
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedRole === 'citizen'
                    ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-500'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                👤 Citizen
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('authority');
                  setAlias('Municipal Ward Authority');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedRole === 'authority'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 ring-2 ring-indigo-500'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                🏛️ Authority
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setAlias('Admin Guardian');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-slate-100 border-slate-300 text-slate-900 ring-2 ring-slate-400'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Public Alias
                </label>
                {selectedRole === 'citizen' && (
                  <button
                    type="button"
                    onClick={handleGenerateNewAlias}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    🎲 Regenerate
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 font-mono font-bold text-slate-800 bg-slate-50"
              />
              <p className="text-[11px] text-slate-400">
                This public alias is displayed on reports and the leaderboard.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Passcode / Demo Pin
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Continue to Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Viva Demo Shortcuts */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Instant Viva Evaluation Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('citizen')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors text-left"
              >
                👤 Quick Citizen Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('authority')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-700 transition-colors text-left"
              >
                🏛️ Quick Govt Officer Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
