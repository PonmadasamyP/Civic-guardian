import React, { createContext, useContext, useState, useEffect } from 'react';
import { Issue, IssueCategory, IssueSeverity, IssueStatus, TimelineEvent } from '../types';
import { INITIAL_ISSUES } from '../lib/mockData';
import { calculatePriorityScore, findNearbyDuplicates } from '../lib/priority';
import { calculateHaversineDistance } from '../lib/geo';
import { useAuth } from './AuthContext';

interface ReportIssueInput {
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  image_url: string;
  latitude: number;
  longitude: number;
  address?: string;
  is_geotag_verified: boolean;
  verification_distance_meters?: number;
  exif_metadata?: any;
}

interface ResolveIssueInput {
  resolved_image_url: string;
  resolved_latitude: number;
  resolved_longitude: number;
  resolution_distance_meters: number;
  resolution_notes: string;
}

interface IssueContextType {
  issues: Issue[];
  loading: boolean;
  getIssueById: (id: string) => Issue | undefined;
  getTimeline: (issueId: string) => TimelineEvent[];
  reportIssue: (input: ReportIssueInput) => Promise<{ issue: Issue; isDuplicateMerged: boolean; mergedTargetId?: string }>;
  claimIssue: (issueId: string) => Promise<void>;
  resolveIssue: (issueId: string, input: ResolveIssueInput) => Promise<{ success: boolean; message: string }>;
  authorityUpdateStatus: (issueId: string, status: IssueStatus, remarks: string) => Promise<void>;
  upvoteIssue: (issueId: string) => Promise<void>;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export const IssueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, addPoints } = useAuth();
  const [issues, setIssues] = useState<Issue[]>(() => {
    const saved = localStorage.getItem('civic_guardian_issues');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved issues', e);
      }
    }
    return INITIAL_ISSUES;
  });

  const [timelines, setTimelines] = useState<Record<string, TimelineEvent[]>>(() => {
    const saved = localStorage.getItem('civic_guardian_timelines');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved timelines', e);
      }
    }
    // Default initial timeline events for mock data
    return {
      'issue-1': [
        {
          id: 'tl-1',
          issue_id: 'issue-1',
          action: 'REPORTED',
          actor_alias: 'Citizen #7420',
          notes: 'Initial issue reported with verified photo EXIF GPS (Match within 22.4m).',
          created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
        {
          id: 'tl-2',
          issue_id: 'issue-1',
          action: 'NEARBY_MERGED',
          actor_alias: 'Citizen #9432',
          notes: 'Duplicate report detected within 38m of same category. Merged into primary ticket (+1 Citizen Count). Priority score elevated.',
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: 'tl-3',
          issue_id: 'issue-1',
          action: 'NEARBY_MERGED',
          actor_alias: 'Citizen #1102',
          notes: 'Second nearby citizen confirmed this severe road crater. Priority score increased to 11.5 (High Priority).',
          created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
      ],
      'issue-2': [
        {
          id: 'tl-4',
          issue_id: 'issue-2',
          action: 'REPORTED',
          actor_alias: 'Citizen #1198',
          notes: 'Overflowing dump reported with verified location badge.',
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: 'tl-5',
          issue_id: 'issue-2',
          action: 'CLAIMED_BY_CITIZEN',
          actor_alias: 'Citizen #6310',
          notes: 'Community volunteer volunteered: "I will organize community cleanup with friends". Status moved to In Progress.',
          created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
        },
      ],
      'issue-4': [
        {
          id: 'tl-6',
          issue_id: 'issue-4',
          action: 'REPORTED',
          actor_alias: 'Citizen #8824',
          notes: 'Blocked drainage report submitted.',
          created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
        {
          id: 'tl-7',
          issue_id: 'issue-4',
          action: 'CLAIMED_BY_CITIZEN',
          actor_alias: 'Citizen #9012',
          notes: 'Citizen volunteered to clean drain.',
          created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        },
        {
          id: 'tl-8',
          issue_id: 'issue-4',
          action: 'PROOF_SUBMITTED',
          actor_alias: 'Citizen #9012',
          notes: 'Uploaded after photo with GPS match (2.8m away from problem).',
          created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
        {
          id: 'tl-9',
          issue_id: 'issue-4',
          action: 'RESOLVED',
          actor_alias: 'System Guardian',
          notes: 'Resolution verified! 50 credit points and Community Hero badge awarded to Citizen #9012.',
          created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        },
      ],
    };
  });

  useEffect(() => {
    localStorage.setItem('civic_guardian_issues', JSON.stringify(issues));
  }, [issues]);

  useEffect(() => {
    localStorage.setItem('civic_guardian_timelines', JSON.stringify(timelines));
  }, [timelines]);

  const getIssueById = (id: string): Issue | undefined => {
    return issues.find((i) => i.id === id);
  };

  const getTimeline = (issueId: string): TimelineEvent[] => {
    return timelines[issueId] || [];
  };

  const addTimelineEvent = (issueId: string, event: Omit<TimelineEvent, 'id' | 'issue_id' | 'created_at'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      issue_id: issueId,
      created_at: new Date().toISOString(),
    };

    setTimelines((prev) => ({
      ...prev,
      [issueId]: [...(prev[issueId] || []), newEvent],
    }));
  };

  /**
   * Reports an issue with automatic nearby duplicate detection within 100 meters
   */
  const reportIssue = async (
    input: ReportIssueInput
  ): Promise<{ issue: Issue; isDuplicateMerged: boolean; mergedTargetId?: string }> => {
    // 1. Check for nearby duplicates within 100m of the same category
    const nearbyDuplicates = findNearbyDuplicates(
      input.latitude,
      input.longitude,
      input.category,
      issues,
      100 // 100 meter radius requirement
    );

    if (nearbyDuplicates.length > 0) {
      // Auto-merge with the closest active duplicate issue!
      const target = nearbyDuplicates[0].issue;
      const dist = Math.round(nearbyDuplicates[0].distance);

      const updatedDuplicateCount = target.duplicate_count + 1;
      const { score, level } = calculatePriorityScore(
        updatedDuplicateCount,
        target.severity,
        target.created_at
      );

      const updatedUpvotedBy = Array.from(new Set([...(target.upvoted_by || []), user.alias]));

      const updatedIssue: Issue = {
        ...target,
        duplicate_count: updatedDuplicateCount,
        priority_score: score,
        priority_level: level,
        upvoted_by: updatedUpvotedBy,
        updated_at: new Date().toISOString(),
      };

      setIssues((prev) => prev.map((i) => (i.id === target.id ? updatedIssue : i)));

      // Record in timeline
      addTimelineEvent(target.id, {
        action: 'NEARBY_MERGED',
        actor_alias: user.alias,
        notes: `Nearby duplicate report detected within ${dist}m of same category ('${input.category}'). Merged into this issue. Citizens affected: ${updatedDuplicateCount}. Priority score boosted to ${score}.`,
      });

      // Award points for contributing to verified nearby issue
      addPoints(10, 'Eagle Eye');

      return {
        issue: updatedIssue,
        isDuplicateMerged: true,
        mergedTargetId: target.id,
      };
    }

    // 2. No duplicate found: Create new distinct issue
    const nowStr = new Date().toISOString();
    const { score, level } = calculatePriorityScore(1, input.severity, nowStr);

    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      title: input.title,
      description: input.description,
      category: input.category,
      severity: input.severity,
      image_url: input.image_url,
      latitude: input.latitude,
      longitude: input.longitude,
      address: input.address || 'Street Location',
      is_geotag_verified: input.is_geotag_verified,
      verification_distance_meters: input.verification_distance_meters,
      exif_metadata: input.exif_metadata,
      reporter_alias: user.alias,
      status: 'pending',
      priority_score: score,
      priority_level: level,
      duplicate_count: 1,
      upvoted_by: [user.alias],
      created_at: nowStr,
      updated_at: nowStr,
    };

    setIssues((prev) => [newIssue, ...prev]);

    // Initial timeline events
    addTimelineEvent(newIssue.id, {
      action: 'REPORTED',
      actor_alias: user.alias,
      notes: `Issue reported with category '${input.category}' and ${input.severity} severity.`,
    });

    if (input.is_geotag_verified) {
      addTimelineEvent(newIssue.id, {
        action: 'LOCATION_VERIFIED',
        actor_alias: 'Civic Geotag Engine',
        notes: `Photo GPS matches current location within ${Math.round(
          input.verification_distance_meters || 0
        )}m. Verified Location badge granted!`,
      });
      // Award points for verified report
      addPoints(15, 'Eagle Eye');
    } else {
      addPoints(5, 'First Step');
    }

    return {
      issue: newIssue,
      isDuplicateMerged: false,
    };
  };

  /**
   * Community Action: "I'll solve this"
   */
  const claimIssue = async (issueId: string) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              status: 'in_progress',
              solver_alias: user.alias,
              updated_at: new Date().toISOString(),
            }
          : i
      )
    );

    addTimelineEvent(issueId, {
      action: 'CLAIMED_BY_CITIZEN',
      actor_alias: user.alias,
      notes: `Citizen stepped forward: "I'll solve this community issue!". Status changed to In Progress.`,
    });
  };

  /**
   * Proof of Resolution: "After" photo must be within 50m of original problem spot
   */
  const resolveIssue = async (
    issueId: string,
    input: ResolveIssueInput
  ): Promise<{ success: boolean; message: string }> => {
    const target = issues.find((i) => i.id === issueId);
    if (!target) return { success: false, message: 'Issue not found' };

    // Distance check: Must be <= 50m
    if (input.resolution_distance_meters > 50) {
      return {
        success: false,
        message: `Resolution rejected: Photo was taken ${Math.round(
          input.resolution_distance_meters
        )}m away from original problem. Must be within 50m radius.`,
      };
    }

    const nowStr = new Date().toISOString();

    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              status: 'resolved',
              solver_alias: user.alias,
              resolved_image_url: input.resolved_image_url,
              resolved_latitude: input.resolved_latitude,
              resolved_longitude: input.resolved_longitude,
              resolution_distance_meters: input.resolution_distance_meters,
              resolution_notes: input.resolution_notes,
              resolved_at: nowStr,
              updated_at: nowStr,
            }
          : i
      )
    );

    addTimelineEvent(issueId, {
      action: 'PROOF_SUBMITTED',
      actor_alias: user.alias,
      notes: `Resolution proof photo submitted. Geotag verified (${Math.round(
        input.resolution_distance_meters
      )}m from original spot).`,
    });

    addTimelineEvent(issueId, {
      action: 'RESOLVED',
      actor_alias: 'Civic Guardian System',
      notes: `Civic issue verified and marked Resolved. +50 points awarded to solver ${user.alias}!`,
    });

    // Award solver 50 points and community hero badge
    addPoints(50, 'Community Hero');

    return {
      success: true,
      message: 'Resolution verified and accepted! You earned 50 points!',
    };
  };

  /**
   * Authority dashboard status update
   */
  const authorityUpdateStatus = async (
    issueId: string,
    status: IssueStatus,
    remarks: string
  ) => {
    const nowStr = new Date().toISOString();

    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              status,
              authority_remarks: remarks,
              updated_at: nowStr,
              resolved_at: status === 'resolved' ? nowStr : i.resolved_at,
            }
          : i
      )
    );

    addTimelineEvent(issueId, {
      action: status === 'resolved' ? 'RESOLVED' : 'AUTHORITY_ACKNOWLEDGED',
      actor_alias: user.alias,
      notes: `Official Authority Update (${status.toUpperCase()}): "${remarks}"`,
    });
  };

  /**
   * Upvote / Confirm an existing issue
   */
  const upvoteIssue = async (issueId: string) => {
    const target = issues.find((i) => i.id === issueId);
    if (!target) return;

    if (target.upvoted_by?.includes(user.alias)) {
      return; // Already confirmed
    }

    const updatedCount = target.duplicate_count + 1;
    const { score, level } = calculatePriorityScore(
      updatedCount,
      target.severity,
      target.created_at
    );

    const updatedUpvotedBy = [...(target.upvoted_by || []), user.alias];

    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              duplicate_count: updatedCount,
              priority_score: score,
              priority_level: level,
              upvoted_by: updatedUpvotedBy,
              updated_at: new Date().toISOString(),
            }
          : i
      )
    );

    addTimelineEvent(issueId, {
      action: 'NEARBY_MERGED',
      actor_alias: user.alias,
      notes: `Citizen affirmed and confirmed this issue. Citizens affected: ${updatedCount}. Priority score boosted to ${score}.`,
    });

    addPoints(5, 'Civic Voice');
  };

  return (
    <IssueContext.Provider
      value={{
        issues,
        loading: false,
        getIssueById,
        getTimeline,
        reportIssue,
        claimIssue,
        resolveIssue,
        authorityUpdateStatus,
        upvoteIssue,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
};

export function useIssues() {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
}
