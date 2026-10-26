import { Issue, IssueCategory, IssueSeverity, PriorityLevel } from '../types';
import { calculateHaversineDistance } from './geo';

/**
 * Priority formula requirement:
 * Priority Score = (reports within 100m radius of same category * 3) + severity weight (low:1, medium:2, high:3) + (days pending * 0.5)
 */

export function getSeverityWeight(severity: IssueSeverity): number {
  switch (severity) {
    case 'low':
      return 1;
    case 'medium':
      return 2;
    case 'high':
      return 3;
    default:
      return 1;
  }
}

export function getDaysPending(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffDays = Math.max(0, (now - created) / (1000 * 60 * 60 * 24));
  return Math.round(diffDays * 10) / 10;
}

export function calculatePriorityScore(
  duplicateCount: number,
  severity: IssueSeverity,
  createdAt: string
): { score: number; level: PriorityLevel } {
  const severityWeight = getSeverityWeight(severity);
  const daysPending = getDaysPending(createdAt);

  const rawScore = (duplicateCount * 3) + severityWeight + (daysPending * 0.5);
  const score = Math.round(rawScore * 10) / 10;

  let level: PriorityLevel = 'low';
  if (score >= 8.0) {
    level = 'high';
  } else if (score >= 4.0) {
    level = 'medium';
  }

  return { score, level };
}

/**
 * Detects nearby duplicate reports of the same category within 100 meters
 */
export function findNearbyDuplicates(
  targetLat: number,
  targetLng: number,
  category: IssueCategory,
  existingIssues: Issue[],
  radiusMeters: number = 100
): { issue: Issue; distance: number }[] {
  const duplicates: { issue: Issue; distance: number }[] = [];

  for (const issue of existingIssues) {
    // Only check active issues of the same category
    if (issue.status !== 'resolved' && issue.category === category) {
      const distance = calculateHaversineDistance(
        targetLat,
        targetLng,
        issue.latitude,
        issue.longitude
      );

      if (distance <= radiusMeters) {
        duplicates.push({ issue, distance });
      }
    }
  }

  // Sort by closest distance first
  return duplicates.sort((a, b) => a.distance - b.distance);
}

/**
 * Sorts issues based on the selected sorting option
 */
export function sortIssues(
  issues: Issue[],
  sortBy: 'priority' | 'newest' | 'distance' | 'urgency',
  userCoords?: { lat: number; lng: number }
): Issue[] {
  const list = [...issues];

  switch (sortBy) {
    case 'priority':
      return list.sort((a, b) => b.priority_score - a.priority_score);

    case 'newest':
      return list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

    case 'urgency':
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return list.sort((a, b) => {
        if (severityOrder[b.severity] !== severityOrder[a.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity];
        }
        return b.priority_score - a.priority_score;
      });

    case 'distance':
      if (!userCoords) return list;
      return list.sort((a, b) => {
        const distA = calculateHaversineDistance(userCoords.lat, userCoords.lng, a.latitude, a.longitude);
        const distB = calculateHaversineDistance(userCoords.lat, userCoords.lng, b.latitude, b.longitude);
        return distA - distB;
      });

    default:
      return list;
  }
}
