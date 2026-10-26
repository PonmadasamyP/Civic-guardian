import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  ShieldAlert, 
  MapPin, 
  PlusCircle, 
  Trophy, 
  Building2, 
  User, 
  Coins, 
  ChevronDown, 
  Shield, 
  Menu, 
  X,
  HelpCircle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, switchRole } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Tagline */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg tracking-tight flex items-center gap-1.5">
                  Civic Guardian
                </span>
                <span className="hidden sm:block text-[10px] text-slate-500 font-medium tracking-wide">
                  Report &bull; Empower &bull; Resolve
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link
                to="/feed"
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/feed')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-4 h-4 text-blue-600" />
                Map & Feed
              </Link>

              <Link
                to="/report"
                className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  isActive('/report')
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Report Issue
              </Link>

              <Link
                to="/leaderboard"
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/leaderboard')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                Leaderboard
              </Link>

              {/* Authority Dashboard */}
              <Link
                to="/authority"
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/authority')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                Govt Dashboard
              </Link>
            </nav>

            {/* Right Side: Points, Role Switcher & Anonymous Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Credit Points Badge */}
              <Link
                to="/profile"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors shadow-xs"
                title="Your Earned Credit Points"
              >
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>{user.points} pts</span>
              </Link>

              {/* Role Switcher (Crucial for Viva presentation to test all 3 personas) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors"
                >
                  <span className="capitalize">{role}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Viva Role Switcher
                      </p>
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {user.alias}
                      </p>
                    </div>

                    {(['citizen', 'authority', 'admin'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          switchRole(r);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          role === r ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span className="capitalize">
                          {r === 'citizen' ? '👤 Citizen (Anonymous)' : r === 'authority' ? '🏛️ Authority Officer' : '🛡️ Administrator'}
                        </span>
                        {role === r && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Anonymous Alias Avatar Link */}
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-1.5 p-1 pr-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                title="View My Contributions"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {user.alias.slice(0, 2).toUpperCase()}
                </div>
                <span className="truncate max-w-[100px]">{user.alias}</span>
              </Link>

              {/* Mobile hamburger button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-white border-b border-slate-200 shadow-lg">
            <Link
              to="/feed"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Map & Feed
            </Link>
            <Link
              to="/report"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50"
            >
              Report New Issue
            </Link>
            <Link
              to="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Citizen Leaderboard
            </Link>
            <Link
              to="/authority"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Government Dashboard
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              My Contributions & Badges ({user.alias})
            </Link>
          </div>
        )}
      </header>

      {/* Mobile-first Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 z-40 flex items-center justify-around shadow-lg">
        <Link
          to="/feed"
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${
            isActive('/feed') ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>Feed</span>
        </Link>

        <Link
          to="/report"
          className="flex flex-col items-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 border-4 border-white animate-pulse-subtle">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-blue-600 mt-0.5">Report</span>
        </Link>

        <Link
          to="/leaderboard"
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${
            isActive('/leaderboard') ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Rank</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center gap-0.5 text-[11px] font-semibold ${
            isActive('/profile') ? 'text-blue-600' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </div>
    </>
  );
};
