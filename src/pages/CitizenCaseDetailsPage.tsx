import React from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  UserCheck,
  Calendar,
  AlertTriangle,
  FileCheck2,
  Phone,
  Crosshair
} from 'lucide-react';
import { CivicCase, AppView } from '../types';
import { LayeredBackdrop } from '../components/LayeredBackdrop';
import { EvidencePanel } from '../components/EvidencePanel';
import { resolveCivicImageKey, getCivicImageUrl } from '../utils/imageAssets';
import { getIncidentOperationalSummary, getSeverityInfo } from '../utils/operationsFormatters';

interface CitizenCaseDetailsPageProps {
  caseItem: CivicCase;
  onNavigate: (view: AppView) => void;
  onOpenAIAnalysis?: () => void;
}

export const CitizenCaseDetailsPage: React.FC<CitizenCaseDetailsPageProps> = ({
  caseItem,
  onNavigate,
  onOpenAIAnalysis
}) => {
  const imageKey = resolveCivicImageKey(caseItem.imageKey || caseItem.category);
  const ops = getIncidentOperationalSummary(caseItem);
  const severity = getSeverityInfo(caseItem.priority, caseItem.isEscalated, caseItem.finalGovernmentRisk);

  const isResolved = caseItem.status === 'RESOLVED' || caseItem.status === 'Resolved' || caseItem.status === 'CLOSED';

  const formattedDate = new Date(caseItem.createdDate || caseItem.submittedAt || Date.now()).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <LayeredBackdrop imageKeyOrCategory={imageKey} customImageUrl={caseItem.imageUrl} className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* TOP BREADCRUMB & BACK BUTTON */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <button
            onClick={() => onNavigate('citizen-dashboard')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to My Complaints</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Complaint ID: {caseItem.id}
            </span>
            <button
              onClick={() => onNavigate('citizen-track')}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Track By ID</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3-COLUMN INVESTIGATION LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* COLUMN 1 (LEFT): CITIZEN & COMPLAINT DETAILS */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-wider">
                    COMPLAINT DETAILS
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">{caseItem.id}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {caseItem.status}
                </span>
              </div>

              {/* Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Government Risk:</span>
                  <span className={`px-2.5 py-0.5 rounded-md font-bold font-mono text-[11px] ${
                    caseItem.finalGovernmentRisk === 'CRITICAL' ? 'bg-rose-600 text-white' :
                    caseItem.finalGovernmentRisk === 'HIGH' ? 'bg-amber-500 text-slate-950' :
                    caseItem.finalGovernmentRisk === 'MEDIUM' ? 'bg-blue-600 text-white' :
                    caseItem.finalGovernmentRisk === 'LOW' ? 'bg-slate-600 text-white' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {caseItem.finalGovernmentRisk}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <span className="font-bold text-slate-800">{caseItem.category}</span>
                </div>

                {caseItem.subcategory && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Subcategory:</span>
                    <span className="font-medium text-slate-700">{caseItem.subcategory}</span>
                  </div>
                )}
              </div>

              {/* Problem Duration Callout */}
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Problem Duration Reported:</span>
                </div>
                <div className="font-black text-blue-800 text-sm font-mono">
                  {caseItem.problemDuration || 'Today'}
                </div>
                {caseItem.problemStartedDate && (
                  <div className="text-[11px] text-blue-700">
                    Started: {caseItem.problemStartedDate}
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <h4 className="text-xs font-bold text-slate-900">{caseItem.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {caseItem.description}
                </p>
              </div>

              {/* Location details */}
              <div className="pt-2.5 border-t border-slate-100 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
                  <div className="font-semibold text-slate-800 mt-0.5 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{caseItem.location.address}</span>
                  </div>
                </div>

                {caseItem.location.landmark && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Landmark</span>
                    <div className="text-slate-700 mt-0.5">{caseItem.location.landmark}</div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Ward / Zone</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{caseItem.location.ward}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Department</span>
                  <div className="font-bold text-blue-700 mt-0.5">{caseItem.assignedDepartment}</div>
                </div>

                {caseItem.assignedOfficerName && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Squad / Officer</span>
                    <div className="font-medium text-slate-800 mt-0.5">{caseItem.assignedOfficerName}</div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Submitted On</span>
                  <div className="text-slate-600 mt-0.5">{formattedDate}</div>
                </div>
              </div>

            </div>
          </div>

          {/* COLUMN 2 (CENTER): EVIDENCE & LIVE TIMELINE */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Action Summary Card */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <span className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-wider">
                CURRENT OPERATIONS STATUS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* Evidence Image */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Incident Photographic Evidence</span>
                <span className="text-[10px] font-mono text-slate-400">{caseItem.location.ward}</span>
              </div>
              <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                <img
                  src={caseItem.imageUrl || getCivicImageUrl(imageKey)}
                  alt={caseItem.title}
                  className="w-full h-full object-cover"
                />
                {caseItem.resolvedImageUrl && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-md">
                    Verified Resolution Photo Attached
                  </div>
                )}
              </div>
            </div>

            {/* Stage-by-Stage Timeline */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-widest">REAL-TIME WORKFLOW</span>
                  <h3 className="text-base font-black text-slate-900">Stage-by-Stage Progress History</h3>
                </div>
                <div className="text-xs font-mono font-bold text-blue-700">
                  {ops.progressPercent}% Completed
                </div>
              </div>

              {/* Timeline list */}
              <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(caseItem.timeline || []).map((event) => {
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
                        <p className="text-slate-600 mt-1 text-[11px] leading-relaxed font-normal">{event.description}</p>
                        {event.actor && (
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">Action by: {event.actor}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </LayeredBackdrop>
  );
};
