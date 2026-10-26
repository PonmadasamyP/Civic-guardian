import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIssues } from '../context/IssueContext';
import { useAuth } from '../context/AuthContext';
import { ExifUploader, ExifUploadResult } from '../components/ExifUploader';
import { LeafletMap } from '../components/Map/LeafletMap';
import { IssueCategory, IssueSeverity } from '../types';
import { findNearbyDuplicates } from '../lib/priority';
import { reverseGeocode, formatCoordinates } from '../lib/geo';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Users, 
  Send, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  Flame, 
  HelpCircle 
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { issues, reportIssue } = useIssues();
  const { user } = useAuth();

  // Form State
  const [photoData, setPhotoData] = useState<ExifUploadResult | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('road damage');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{
    type: 'success' | 'merge' | 'error';
    message: string;
    issueId?: string;
  } | null>(null);

  // When photo is uploaded and verified
  const handlePhotoSuccess = async (result: ExifUploadResult) => {
    setPhotoData(result);

    // Auto-fetch human street address
    try {
      const detectedAddress = await reverseGeocode(result.latitude, result.longitude);
      setAddress(detectedAddress);
    } catch {
      setAddress(formatCoordinates(result.latitude, result.longitude));
    }
  };

  // Check for nearby duplicates in real-time when category or photo changes
  const nearbyDuplicates = photoData
    ? findNearbyDuplicates(photoData.latitude, photoData.longitude, category, issues, 100)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photoData) {
      alert('Photo with embedded GPS EXIF coordinates is mandatory.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      alert('Please fill out the issue title and description.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await reportIssue({
        title,
        description,
        category,
        severity,
        image_url: photoData.imageUrl,
        latitude: photoData.latitude,
        longitude: photoData.longitude,
        address: address || formatCoordinates(photoData.latitude, photoData.longitude),
        is_geotag_verified: photoData.isVerified,
        verification_distance_meters: photoData.distanceMeters,
        exif_metadata: photoData.exifDetails,
      });

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      if (result.isDuplicateMerged) {
        setFeedbackNotice({
          type: 'merge',
          message: `Your report was automatically merged with a nearby active problem (${result.issue.duplicate_count} citizens now confirmed). Priority boosted!`,
          issueId: result.issue.id,
        });
      } else {
        setFeedbackNotice({
          type: 'success',
          message: `Civic issue successfully reported! ${photoData.isVerified ? '+15 Credit Points awarded.' : '+5 Credit Points awarded.'}`,
          issueId: result.issue.id,
        });
      }

      setTimeout(() => {
        navigate(`/issues/${result.issue.id}`);
      }, 1500);
    } catch (err: any) {
      alert(err?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Anonymous Community Reporting
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Local Civic Problem
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Your report will be publicly published as{' '}
          <strong className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
            {user.alias}
          </strong>
          . Your personal identity is never shared or stored.
        </p>
      </div>

      {/* Success / Merge Banner */}
      {feedbackNotice && (
        <div
          className={`p-4 rounded-2xl border text-sm font-medium flex items-start gap-3 shadow-sm ${
            feedbackNotice.type === 'merge'
              ? 'bg-purple-50 text-purple-900 border-purple-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <div>
            <p className="font-bold">{feedbackNotice.message}</p>
            <p className="text-xs opacity-80 mt-1">Redirecting to issue tracker...</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Geotagged Photo Upload */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Upload Photo (Mandatory EXIF Geotag)
            </h3>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              exifr Library Verified
            </span>
          </div>

          <ExifUploader
            onSuccess={handlePhotoSuccess}
            requiredMaxDistance={100}
            title="Upload Photo with GPS EXIF metadata"
            subtitle="The photo must contain embedded camera GPS tags. Civic Guardian cross-verifies distance with your device within 100m."
          />
        </div>

        {/* Nearby Duplicates Alert (Requirement 4) */}
        {photoData && nearbyDuplicates.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-3xl p-5 text-purple-950 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-sm">
                Nearby Duplicate Detected ({nearbyDuplicates.length} found within 100m)
              </h4>
            </div>
            <p className="text-xs text-purple-900 leading-relaxed">
              We detected an existing <strong className="capitalize">{category}</strong> report
              just <strong>{Math.round(nearbyDuplicates[0].distance)}m</strong> away from your photo.
              Submitting your report will automatically merge with it, incrementing the{' '}
              <strong>"Reported by N citizens"</strong> counter and boosting its priority score!
            </p>
          </div>
        )}

        {/* Step 2: Issue Details */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              Category & Severity Classification
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Problem Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IssueCategory)}
                className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white capitalize font-semibold"
              >
                <option value="road damage">Road Damage (Potholes, cracks)</option>
                <option value="streetlight">Streetlight (Dark areas, broken lamps)</option>
                <option value="drainage">Drainage (Clogged drains, flooding)</option>
                <option value="garbage">Garbage (Overflowing bins, open dumps)</option>
                <option value="other">Other Civic Hazard</option>
              </select>
            </div>

            {/* Severity Weight */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Severity Level (Formula Weight)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as IssueSeverity[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                      severity === s
                        ? s === 'high'
                          ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-500'
                          : s === 'medium'
                          ? 'bg-amber-50 border-amber-300 text-amber-700 ring-2 ring-amber-500'
                          : 'bg-slate-100 border-slate-300 text-slate-800 ring-2 ring-slate-400'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s} ({s === 'high' ? 'Weight 3' : s === 'medium' ? 'Weight 2' : 'Weight 1'})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Issue Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Deep pothole crater near 4th cross junction"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Detailed Description
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the problem, hazard to vehicles/pedestrians, duration, and landmarks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Detected Street Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Reverse geocoded location..."
              className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
            />
          </div>
        </div>

        {/* Step 3: Map Preview with 100m Radius Circle */}
        {photoData && (
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Verified Issue Coordinates & 100m Radius
              </h3>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                {formatCoordinates(photoData.latitude, photoData.longitude)}
              </span>
            </div>

            <LeafletMap
              center={[photoData.latitude, photoData.longitude]}
              zoom={16}
              showRadiusCircle={{
                lat: photoData.latitude,
                lng: photoData.longitude,
                radiusMeters: 100, // 100m duplicate radius
                color: '#3b82f6',
              }}
              height="260px"
            />
            <p className="text-[11px] text-slate-500">
              Blue dashed circle illustrates the 100-meter duplicate detection perimeter.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!photoData || submitting}
          className={`w-full py-4 rounded-2xl font-bold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
            photoData && !submitting
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Anonymous Civic Report</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
