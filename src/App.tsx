import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { IssueProvider } from './context/IssueContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { FeedPage } from './pages/FeedPage';
import { ReportPage } from './pages/ReportPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { MyContributionsPage } from './pages/MyContributionsPage';
import { AuthPage } from './pages/AuthPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <IssueProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/issues/:id" element={<IssueDetailPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/authority" element={<AuthorityDashboard />} />
                <Route path="/profile" element={<MyContributionsPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </IssueProvider>
    </AuthProvider>
  );
};

export default App;
