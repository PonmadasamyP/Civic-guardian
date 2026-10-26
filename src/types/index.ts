export type UserRole = 'citizen' | 'authority' | 'admin';

export type IssueCategory = 
  | 'road damage' 
  | 'streetlight' 
  | 'drainage' 
  | 'garbage' 
  | 'other';

export type IssueSeverity = 'low' | 'medium' | 'high';

export type IssueStatus = 'pending' | 'in_progress' | 'resolved';

export type PriorityLevel = 'low' | 'medium' | 'high';

export interface UserProfile {
  id: string;
  alias: string; // e.g. "Citizen #4821" or "Authority Ward #12"
  role: UserRole;
  points: number;
  badges: string[];
  created_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  image_url: string;
  latitude: number;
  longitude: number;
  address?: string;
  
  // Geotag Verification
  is_geotag_verified: boolean;
  verification_distance_meters?: number;
  exif_metadata?: {
    camera?: string;
    timestamp?: string;
    raw_lat?: number;
    raw_lon?: number;
  };
  
  // Anonymity
  reporter_alias: string; // Never exposes real name/email
  
  // Priority & Duplicate System
  status: IssueStatus;
  priority_score: number;
  priority_level: PriorityLevel;
  duplicate_count: number; // "Reported by N citizens"
  merged_into_id?: string;
  upvoted_by?: string[]; // list of user aliases who confirmed this issue
  
  // Community Resolution & Proof
  solver_alias?: string;
  resolved_image_url?: string;
  resolved_latitude?: number;
  resolved_longitude?: number;
  resolution_distance_meters?: number; // Must be <= 50m
  resolution_notes?: string;
  authority_remarks?: string;
  
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface TimelineEvent {
  id: string;
  issue_id: string;
  action: 
    | 'REPORTED' 
    | 'LOCATION_VERIFIED' 
    | 'NEARBY_MERGED' 
    | 'CLAIMED_BY_CITIZEN' 
    | 'AUTHORITY_ACKNOWLEDGED' 
    | 'PROOF_SUBMITTED' 
    | 'RESOLVED';
  actor_alias: string;
  notes?: string;
  created_at: string;
}

export interface LeaderboardUser {
  rank: number;
  alias: string;
  points: number;
  badges: string[];
  solved_count: number;
  reported_count: number;
}
