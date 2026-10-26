import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { generateCitizenAlias, generateAuthorityAlias } from '../lib/anonymity';

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  switchRole: (newRole: UserRole) => void;
  loginAs: (alias: string, role: UserRole) => void;
  addPoints: (points: number, newBadge?: string) => void;
  logout: () => void;
}

const DEFAULT_CITIZEN: UserProfile = {
  id: 'usr-default-citizen-1',
  alias: 'Citizen #4821',
  role: 'citizen',
  points: 45,
  badges: ['First Step', 'Eagle Eye'],
  created_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('civic_guardian_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return DEFAULT_CITIZEN;
  });

  useEffect(() => {
    localStorage.setItem('civic_guardian_user', JSON.stringify(user));
  }, [user]);

  const switchRole = (newRole: UserRole) => {
    let newAlias = user.alias;
    let initialBadges = user.badges;

    if (newRole === 'citizen') {
      if (!user.alias.startsWith('Citizen #')) {
        newAlias = generateCitizenAlias();
      }
    } else if (newRole === 'authority') {
      newAlias = 'Authority (Municipal Ward #04)';
      initialBadges = ['Verified Official', 'City Engineer'];
    } else if (newRole === 'admin') {
      newAlias = 'Platform Administrator';
      initialBadges = ['System Admin', 'Civic Overseer'];
    }

    setUser((prev) => ({
      ...prev,
      role: newRole,
      alias: newAlias,
      badges: initialBadges,
    }));
  };

  const loginAs = (alias: string, role: UserRole) => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      alias,
      role,
      points: role === 'citizen' ? 30 : 100,
      badges: role === 'citizen' ? ['First Step'] : ['Official Lead'],
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
  };

  const addPoints = (points: number, newBadge?: string) => {
    setUser((prev) => {
      const updatedBadges = [...prev.badges];
      if (newBadge && !updatedBadges.includes(newBadge)) {
        updatedBadges.push(newBadge);
      }
      return {
        ...prev,
        points: prev.points + points,
        badges: updatedBadges,
      };
    });
  };

  const logout = () => {
    const reset = {
      id: `usr-${Date.now()}`,
      alias: generateCitizenAlias(),
      role: 'citizen' as UserRole,
      points: 0,
      badges: ['First Step'],
      created_at: new Date().toISOString(),
    };
    setUser(reset);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        switchRole,
        loginAs,
        addPoints,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
