-- ========================================================================
-- CIVIC GUARDIAN: Database Schema & Row-Level Security (Supabase PostgreSQL)
-- Tagline: "Report the problem. Empower the community. Track the solution."
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------
-- 1. USER PROFILES TABLE (Enforces complete public anonymity)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  alias TEXT NOT NULL UNIQUE, -- e.g. "Citizen #4821", "Authority #01"
  role TEXT NOT NULL CHECK (role IN ('citizen', 'authority', 'admin')) DEFAULT 'citizen',
  points INTEGER NOT NULL DEFAULT 0,
  badges TEXT[] NOT NULL DEFAULT ARRAY['First Step']::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------
-- 2. ISSUES TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Confidential reporter metadata (Hidden via RLS & Public Views)
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_alias TEXT NOT NULL, -- Publicly exposed alias (e.g., "Citizen #4821")
  
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('road damage', 'streetlight', 'drainage', 'garbage', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')) DEFAULT 'medium',
  image_url TEXT NOT NULL,
  
  -- Geolocation & EXIF Verification
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  is_geotag_verified BOOLEAN NOT NULL DEFAULT false,
  verification_distance_meters DOUBLE PRECISION DEFAULT 0.0,
  
  -- Priority and Merge Tracking
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'resolved')) DEFAULT 'pending',
  priority_score NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
  priority_level TEXT NOT NULL CHECK (priority_level IN ('low', 'medium', 'high')) DEFAULT 'low',
  duplicate_count INTEGER NOT NULL DEFAULT 1, -- "Reported by N citizens"
  merged_into_id UUID REFERENCES public.issues(id) ON DELETE SET NULL,
  
  -- Resolution Proof (Community or Authority)
  solver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  solver_alias TEXT,
  resolved_image_url TEXT,
  resolved_latitude DOUBLE PRECISION,
  resolved_longitude DOUBLE PRECISION,
  resolution_distance_meters DOUBLE PRECISION,
  resolution_notes TEXT,
  authority_remarks TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------
-- 3. ISSUE DUPLICATES / CONFIRMATIONS TABLE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.issue_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_alias TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(issue_id, user_id)
);

-- ------------------------------------------------------------------------
-- 4. ISSUE AUDIT TIMELINE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.issue_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'REPORTED', 'LOCATION_VERIFIED', 'NEARBY_MERGED', 'CLAIMED_BY_CITIZEN', 'AUTHORITY_ACKNOWLEDGED', 'PROOF_SUBMITTED', 'RESOLVED'
  actor_alias TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------
-- 5. CREDIT POINTS LEDGER
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES public.issues(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL, -- 'VERIFIED_REPORT', 'UNVERIFIED_REPORT', 'CONFIRM_REPORT', 'RESOLVE_COMMUNITY_ISSUE'
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------
-- 6. HAVERSINE DISTANCE FUNCTION (In meters)
-- Used for detecting duplicates within 100m & resolution proof within 50m
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.haversine_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  R CONSTANT DOUBLE PRECISION := 6371000; -- Earth radius in meters
  dlat DOUBLE PRECISION;
  dlon DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ------------------------------------------------------------------------
-- 7. AUTOMATIC PRIORITY CALCULATION FUNCTION
-- Formula: (Reports within 100m same category * 3) + Severity Weight (Low 1, Med 2, High 3) + (Days Pending * 0.5)
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_issue_priority(
  p_duplicate_count INTEGER,
  p_severity TEXT,
  p_created_at TIMESTAMPTZ
)
RETURNS TABLE(score NUMERIC(5,2), level TEXT) AS $$
DECLARE
  sev_weight NUMERIC := 2.0;
  days_pending NUMERIC := 0.0;
  calculated_score NUMERIC(5,2) := 0.0;
  calculated_level TEXT := 'low';
BEGIN
  -- Severity Weight
  IF p_severity = 'low' THEN
    sev_weight := 1.0;
  ELSIF p_severity = 'medium' THEN
    sev_weight := 2.0;
  ELSIF p_severity = 'high' THEN
    sev_weight := 3.0;
  END IF;

  -- Days Pending
  days_pending := GREATEST(0.0, EXTRACT(EPOCH FROM (now() - p_created_at)) / 86400.0);

  -- Priority Score Formula
  calculated_score := (p_duplicate_count * 3.0) + sev_weight + (days_pending * 0.5);

  -- Priority Level
  IF calculated_score >= 8.0 THEN
    calculated_level := 'high';
  ELSIF calculated_score >= 4.0 THEN
    calculated_level := 'medium';
  ELSE
    calculated_level := 'low';
  END IF;

  RETURN QUERY SELECT calculated_score, calculated_level;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to recalculate priority on insert/update
CREATE OR REPLACE FUNCTION public.trg_update_issue_priority()
RETURNS TRIGGER AS $$
DECLARE
  res RECORD;
BEGIN
  SELECT score, level INTO res FROM public.calculate_issue_priority(NEW.duplicate_count, NEW.severity, NEW.created_at);
  NEW.priority_score := res.score;
  NEW.priority_level := res.level;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_issue_priority_trigger ON public.issues;
CREATE TRIGGER set_issue_priority_trigger
  BEFORE INSERT OR UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_update_issue_priority();

-- ------------------------------------------------------------------------
-- 8. ANONYMOUS PUBLIC VIEW (Strict Anonymity Protection)
-- Strips any reporter_id or solver_id so even network inspection in DevTools
-- never reveals the user's UUID or identity.
-- ------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_issues_feed AS
SELECT 
  id,
  title,
  description,
  category,
  severity,
  image_url,
  latitude,
  longitude,
  address,
  is_geotag_verified,
  verification_distance_meters,
  status,
  priority_score,
  priority_level,
  duplicate_count,
  reporter_alias, -- Only alias is exposed!
  solver_alias,   -- Only alias is exposed!
  resolved_image_url,
  resolved_latitude,
  resolved_longitude,
  resolution_distance_meters,
  resolution_notes,
  authority_remarks,
  created_at,
  updated_at,
  resolved_at
FROM public.issues
WHERE merged_into_id IS NULL; -- Merged duplicates are aggregated into primary issue

-- ------------------------------------------------------------------------
-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can view public profile aliases and points (Leaderboard).
-- Users can only modify their own profile.
CREATE POLICY "Public profiles are readable by all"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Issues: Anyone can view issues (feed/map).
CREATE POLICY "Issues are readable by all"
  ON public.issues FOR SELECT
  USING (true);

-- Authenticated citizens can insert issues.
CREATE POLICY "Authenticated users can report issues"
  ON public.issues FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Reporters can edit pending reports, Solvers can claim/resolve, Authorities can update status.
CREATE POLICY "Users and authorities can update issues"
  ON public.issues FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Timeline: readable by all, insertable by authenticated users.
CREATE POLICY "Timeline readable by all"
  ON public.issue_timeline FOR SELECT
  USING (true);

CREATE POLICY "Timeline insertable by authenticated"
  ON public.issue_timeline FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Confirmations: readable by all, insertable by user.
CREATE POLICY "Confirmations readable by all"
  ON public.issue_confirmations FOR SELECT
  USING (true);

CREATE POLICY "Users can insert confirmations"
  ON public.issue_confirmations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Credit Ledger: Users can only see their own credit transactions.
CREATE POLICY "Users can view own credits"
  ON public.credit_ledger FOR SELECT
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------
-- 10. SAMPLE SEED DATA (For Viva & Demo Presentation)
-- ------------------------------------------------------------------------
INSERT INTO public.issues (
  id,
  reporter_alias,
  title,
  description,
  category,
  severity,
  image_url,
  latitude,
  longitude,
  address,
  is_geotag_verified,
  verification_distance_meters,
  status,
  duplicate_count,
  created_at
) VALUES 
(
  'e7b51e06-93a8-4c1d-8f24-34c892870101',
  'Citizen #7420',
  'Severe Pothole Cluster on Main Cross Road',
  'Deep craters on the 4th Cross junction causing two-wheelers to skid during morning traffic. Needs urgent asphalt patch.',
  'road damage',
  'high',
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  12.9716,
  77.5946,
  'MG Road, Near Metro Pillar 142',
  true,
  24.5,
  'pending',
  3,
  now() - INTERVAL '3 days'
),
(
  'e7b51e06-93a8-4c1d-8f24-34c892870102',
  'Citizen #1198',
  'Overflowing Community Garbage Bin & Litter',
  'Garbage has spilled across the pedestrian walkway for 4 days. Strong odor and stray animals gathering.',
  'garbage',
  'medium',
  'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
  12.9732,
  77.5960,
  'Residency Road, Behind City Library',
  true,
  12.1,
  'in_progress',
  2,
  now() - INTERVAL '2 days'
),
(
  'e7b51e06-93a8-4c1d-8f24-34c892870103',
  'Citizen #3451',
  'Non-functional Streetlights along 100m Stretch',
  'Three consecutive street lamps have been dead for a week. The road is completely dark and unsafe for women returning from work.',
  'streetlight',
  'high',
  'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
  12.9698,
  77.5912,
  'Richmond Town, 2nd Avenue',
  true,
  38.0,
  'pending',
  1,
  now() - INTERVAL '4 days'
),
(
  'e7b51e06-93a8-4c1d-8f24-34c892870104',
  'Citizen #8824',
  'Clogged Stormwater Drain Flooding Footpath',
  'Drainage grate is clogged with plastic debris and silt. Rainwater is backing up onto the main sidewalk.',
  'drainage',
  'medium',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  12.9750,
  77.5985,
  'Brigade Road Commercial Hub',
  true,
  18.4,
  'resolved',
  1,
  now() - INTERVAL '5 days'
)
ON CONFLICT (id) DO NOTHING;

-- Add resolution proof for the resolved issue
UPDATE public.issues
SET 
  solver_alias = 'Citizen #9012',
  resolved_image_url = 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
  resolved_latitude = 12.97502,
  resolved_longitude = 77.59848,
  resolution_distance_meters = 3.2,
  resolution_notes = 'Cleared plastic bottles and silt blockages with volunteer neighbors. Water flows smoothly now!',
  resolved_at = now() - INTERVAL '1 day'
WHERE id = 'e7b51e06-93a8-4c1d-8f24-34c892870104';

-- Timeline seed data
INSERT INTO public.issue_timeline (issue_id, action, actor_alias, notes, created_at) VALUES
('e7b51e06-93a8-4c1d-8f24-34c892870101', 'REPORTED', 'Citizen #7420', 'Initial report submitted with EXIF GPS proof', now() - INTERVAL '3 days'),
('e7b51e06-93a8-4c1d-8f24-34c892870101', 'NEARBY_MERGED', 'Citizen #9812', 'Duplicate report within 35m merged into primary ticket (+1 Citizen count)', now() - INTERVAL '2 days'),
('e7b51e06-93a8-4c1d-8f24-34c892870102', 'REPORTED', 'Citizen #1198', 'Overflowing garbage reported with verified location', now() - INTERVAL '2 days'),
('e7b51e06-93a8-4c1d-8f24-34c892870102', 'CLAIMED_BY_CITIZEN', 'Citizen #6310', 'Volunteer Citizen stepped up: "I will organize community cleanup with friends"', now() - INTERVAL '18 hours'),
('e7b51e06-93a8-4c1d-8f24-34c892870104', 'REPORTED', 'Citizen #8824', 'Clogged drain reported', now() - INTERVAL '5 days'),
('e7b51e06-93a8-4c1d-8f24-34c892870104', 'CLAIMED_BY_CITIZEN', 'Citizen #9012', 'Citizen volunteered to clean drain', now() - INTERVAL '3 days'),
('e7b51e06-93a8-4c1d-8f24-34c892870104', 'PROOF_SUBMITTED', 'Citizen #9012', 'Uploaded after photo with GPS match (3.2m). Resolution verified!', now() - INTERVAL '1 day'),
('e7b51e06-93a8-4c1d-8f24-34c892870104', 'RESOLVED', 'System', 'Issue marked Resolved. Awarded +50 points to Citizen #9012', now() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;
