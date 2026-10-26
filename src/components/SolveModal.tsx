import React, { useState } from 'react';
import { useIssues } from '../context/IssueContext';
import { ExifUploader, ExifUploadResult } from './ExifUploader';
import { Issue } from '../types';
import confetti from 'canvas-confetti';
import { CheckCircle2, X, ShieldCheck, Award, AlertCircle } from 'lucide-react';

interface SolveModalProps {
  issue: Issue;
  onClose: () => void;
}

export const SolveModal: React.FC<SolveModalProps> = ({ issue, onClose }) => {
  const { resolveIssue } = useIssues();
  const [proofPhoto, setProofPhoto] = useState<ExifUploadResult | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoSuccess = (result: ExifUploadResult) => {
    setProofPhoto(result);
    setError(null);
  };

  const handleSubmitResolution = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofPhoto) {
      setError('Please upload a geotagged "after" photo as proof of resolution.');
      return;
    }

    if (proofPhoto.distanceMeters !== undefined && proofPhoto.distanceMeters > 50) {
      setError(
        `Resolution rejected: Proof photo was taken ${Math.round(
          proofPhoto.distanceMeters
        )}m away from the original issue spot. Maximum allowable radius is 50 meters.`
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await resolveIssue(issue.id, {
        resolved_image_url: proofPhoto.imageUrl,
        resolved_latitude: proofPhoto.latitude,
        resolved_longitude: proofPhoto.longitude,
        resolution_distance_meters: proofPhoto.distanceMeters || 12.0,
        resolution_notes: notes || 'Civic problem successfully resolved by community citizen.',
      });

      if (!res.success) {
        setError(res.message);
        setLoading(false);
        return;
      }

      // Celebrate with confetti!
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit resolution proof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Submit Proof of Resolution
              </h3>
              <p className="text-xs text-slate-500">
                Earn <strong className="text-emerald-700">+50 points</strong> for verified community action
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitResolution} className="p-6 space-y-5">
          {/* Geotag rule alert */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Mandatory 50m Rule:</strong> The "after" photo must contain EXIF GPS metadata taken within <strong>50 meters</strong> of the original reported location.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* EXIF Uploader */}
          <ExifUploader
            onSuccess={handlePhotoSuccess}
            requiredMaxDistance={50}
            originalIssueCoords={{ lat: issue.latitude, lng: issue.longitude }}
            title="Upload 'After' Photo"
            subtitle="Take a photo showing the resolved site. Distance to original issue will be verified automatically."
          />

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Resolution Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Gathered 3 neighbors, cleared the silt blockage and bagged the debris..."
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!proofPhoto || loading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 ${
                proofPhoto && !loading
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Mark Resolved (+50 pts)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
