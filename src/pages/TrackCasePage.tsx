import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Building2, 
  ArrowRight,
  Send,
  Camera,
  Layers,
  Activity,
  FileCheck2
} from 'lucide-react';
import { CivicCase } from '../types';
import { getIncidentOperationalSummary, getSeverityInfo } from '../utils/operationsFormatters';
import { getCivicImageUrl, resolveCivicImageKey } from '../utils/imageAssets';

interface TrackCasePageProps {
  cases: CivicCase[];
  onNavigateToCase: (caseId: string) => void;
  onNavigateToReport: () => void;
}

export const TrackCasePage: React.FC<TrackCasePageProps> = ({
  cases,
  onNavigateToCase,
  onNavigateToReport
}) => {
  const [searchId, setSearchId] = useState(cases.length > 0 ? cases[0].id : '');
  const [activeCase, setActiveCase] = useState<CivicCase | null>(
    cases.length > 0 ? cases[0] : null
  );
  const [rating, setRating] = useState<number>(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchId.trim().toUpperCase();
    const found = cases.find(c => c.id.toUpperCase() === query || c.id.includes(query));
    if (found) {
      setActiveCase(found);
      setRatingSubmitted(false);
    } else {
      setActiveCase(null);
    }
  };

  const handleRatingSubmit = () => {
    setRatingSubmitted(true);
  };

  const ops = activeCase ? getIncidentOperationalSummary(activeCase) : null;
  const severity = activeCase ? getSeverityInfo(activeCase.priority, activeCase.isEscalated, activeCase.finalGovernmentRisk) : null;

  return (
    <div className="min-h-full bg-[#F6F9FC] text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6 bg-smart-grid">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 uppercase">
            <ShieldCheck className="w-3.5 h-3.5" /> Citizen Public Tracking Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Track Your Civic Complaint
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Live database verification, Government risk assessment, department assignment, and field squad activity.
          </p>
        </div>

        {/* SEARCH BOX & ACTIVE CHIPS */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Complaint ID (e.g. CL-2026-000123)"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-semibold"
              />
              <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick Real Chips */}
          {cases.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-500 font-bold">Recent Complaints:</span>
              {cases.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSearchId(c.id);
                    setActiveCase(c);
                    setRatingSubmitted(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition-colors cursor-pointer ${
                    activeCase?.id === c.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {c.id}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CASE TRACKING CARD */}
        {activeCase && ops && severity ? (
          <div className="space-y-6">
            
            {/* Header Ticket Banner */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                      {activeCase.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      activeCase.finalGovernmentRisk === 'CRITICAL' ? 'bg-rose-600 text-white' :
                      activeCase.finalGovernmentRisk === 'HIGH' ? 'bg-amber-500 text-slate-950 font-bold' :
                      activeCase.finalGovernmentRisk === 'MEDIUM' ? 'bg-blue-600 text-white' :
                      activeCase.finalGovernmentRisk === 'LOW' ? 'bg-slate-600 text-white' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      Gov Risk: {activeCase.finalGovernmentRisk}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-2">{activeCase.title}</h2>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                  <span className="text-sm font-black text-blue-700 uppercase">{activeCase.status}</span>
                </div>
              </div>

              {/* Operations Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Problem Duration</span>
                  <span className="font-black text-slate-900 mt-0.5 block font-mono">{activeCase.problemDuration || 'Today'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Department</span>
                  <span className="font-bold text-blue-700 mt-0.5 block">{activeCase.assignedDepartment}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Officer / Squad</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{activeCase.assignedOfficerName || 'Pending Allocation'}</span>
                </div>
              </div>

              {/* Current Action / Next Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">What Action Is Being Taken:</span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {ops.currentAction}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">What Happens Next:</span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {ops.nextAction}
                  </p>
                </div>
              </div>
            </div>

            {/* Photo & Description */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              <h3 className="text-sm font-black text-slate-900">Incident Details & Evidence</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-64 h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={activeCase.imageUrl || getCivicImageUrl(resolveCivicImageKey(activeCase.category))}
                    alt={activeCase.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2 flex-1 text-xs text-slate-600 leading-relaxed">
                  <p className="font-medium">{activeCase.description}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="font-semibold text-slate-800">{activeCase.location.address}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Journey */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900">Official Municipal Activity Timeline</h3>
                <span className="text-xs font-mono font-bold text-blue-600">{ops.progressPercent}% Processed</span>
              </div>

              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(activeCase.timeline || []).map((event) => {
                  const isDone = event.status === 'completed';
                  const isCurrent = event.status === 'current';

                  return (
                    <div key={event.id} className="relative">
                      <div className={`absolute -left-5 top-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                        isDone ? 'bg-emerald-600 border-emerald-700' :
                        isCurrent ? 'bg-blue-600 border-blue-700 animate-pulse' :
                        'bg-slate-200 border-slate-300'
                      }`}>
                        {isDone && <CheckCircle2 className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </div>

                      <div className={`p-3.5 rounded-xl text-xs ${
                        isCurrent ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50 border border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900">{event.title}</h4>
                          <span className="text-[10px] font-mono font-bold text-blue-700">{event.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{event.description}</p>
                        {event.actor && (
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">Actor: {event.actor}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Satisfaction Rating if Resolved */}
            {(activeCase.status === 'RESOLVED' || activeCase.status === 'Resolved' || activeCase.status === 'CLOSED') && (
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 space-y-3 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-base font-black text-emerald-950">This complaint has been verified and resolved!</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  How satisfied are you with the municipal response time and quality of work?
                </p>
                {!ratingSubmitted ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleRatingSubmit}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Submit Citizen Feedback
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-emerald-700">
                    Thank you! Your rating has been recorded for the department performance index.
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-white border-2 border-dashed border-slate-300 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileCheck2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                {cases.length === 0 ? 'NO COMPLAINTS REGISTERED YET' : 'NO COMPLAINT FOUND'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {cases.length === 0 
                  ? 'There are currently no complaints in the municipal database. Click below to submit your first report.'
                  : `We could not find any complaint matching "${searchId}". Please verify your Complaint ID and try again.`}
              </p>
            </div>
            <button
              onClick={onNavigateToReport}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <span>+ FILE A NEW COMPLAINT</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
