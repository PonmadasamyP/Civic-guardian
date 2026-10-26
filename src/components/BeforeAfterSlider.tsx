import React, { useState } from 'react';
import { Columns, SplitSquareVertical, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  distanceMeters?: number;
  solverAlias?: string;
  notes?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  distanceMeters,
  solverAlias,
  notes,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Resolution Verification Proof
              {distanceMeters !== undefined && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  GPS Match ({Math.round(distanceMeters)}m / 50m limit)
                </span>
              )}
            </h4>
            {solverAlias && (
              <p className="text-xs text-slate-500">
                Solved by <span className="font-semibold text-slate-700">{solverAlias}</span>
              </p>
            )}
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'slider'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            Slider
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'side-by-side'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Side-by-Side
          </button>
        </div>
      </div>

      {/* Visual viewer */}
      {viewMode === 'slider' ? (
        <div className="relative w-full h-[320px] sm:h-[400px] select-none overflow-hidden bg-slate-900">
          {/* AFTER Image (Full background) */}
          <img
            src={afterImage}
            alt="After resolution proof"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* BEFORE Image (Clipped overlay) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={beforeImage}
              alt="Before report"
              className="absolute inset-0 w-full h-full object-cover max-w-none"
              style={{
                width: '100vw',
                maxWidth: '800px', // matches parent container max bounds
              }}
            />
          </div>

          {/* Draggable Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize z-20"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-blue-600 flex items-center justify-center text-blue-600 text-xs font-bold">
              ↔
            </div>
          </div>

          {/* Native Slider Input (Transparent Overlay for Smooth Dragging) */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />

          {/* Overlay Badges */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-md bg-rose-600/90 backdrop-blur-sm text-white font-bold text-xs uppercase tracking-wider shadow">
              Before
            </span>
          </div>
          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-md bg-emerald-600/90 backdrop-blur-sm text-white font-bold text-xs uppercase tracking-wider shadow">
              After (Resolved)
            </span>
          </div>

          <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none z-10">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium">
              Drag slider left or right to compare
            </span>
          </div>
        </div>
      ) : (
        /* Side by Side Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="relative group">
            <img
              src={beforeImage}
              alt="Before report"
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-md bg-rose-600/90 text-white font-bold text-xs uppercase tracking-wider shadow">
                Before Problem
              </span>
            </div>
          </div>
          <div className="relative group">
            <img
              src={afterImage}
              alt="After resolution proof"
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-md bg-emerald-600/90 text-white font-bold text-xs uppercase tracking-wider shadow">
                After Resolved
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Solver remarks */}
      {notes && (
        <div className="p-4 bg-emerald-50/50 border-t border-emerald-100">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            Solver's Community Notes:
          </p>
          <p className="text-sm text-slate-700 italic">"{notes}"</p>
        </div>
      )}
    </div>
  );
};
