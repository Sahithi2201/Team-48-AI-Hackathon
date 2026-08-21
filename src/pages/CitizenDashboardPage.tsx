import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  ShieldCheck, 
  FileCheck2,
  Calendar,
  Layers,
  Sparkles,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { CivicCase, AppView, CaseStatus, RiskLevel } from '../types';
import { getCivicImageUrl, resolveCivicImageKey } from '../utils/imageAssets';
import { getIncidentOperationalSummary, getSeverityInfo } from '../utils/operationsFormatters';
import { getCurrentUser } from '../services/authService';

interface CitizenDashboardPageProps {
  cases: CivicCase[];
  onNavigate: (view: AppView) => void;
  onSelectCase: (caseId: string) => void;
  onOpenReport: () => void;
}

export const CitizenDashboardPage: React.FC<CitizenDashboardPageProps> = ({
  cases,
  onNavigate,
  onSelectCase,
  onOpenReport
}) => {
  const currentUser = getCurrentUser();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Dynamically calculate metrics from real database records
  const totalReports = cases.length;
  const inProgressCount = cases.filter(c => {
    const s = (c.status || '').toUpperCase();
    return s === 'ACTION_IN_PROGRESS' || s === 'IN_PROGRESS' || s === 'DEPARTMENT_ASSIGNED' || s === 'UNDER_REVIEW' || s === 'ACCEPTED';
  }).length;
  const resolvedCount = cases.filter(c => {
    const s = (c.status || '').toUpperCase();
    return s === 'RESOLVED' || s === 'CLOSED';
  }).length;
  const criticalCount = cases.filter(c => {
    return c.finalGovernmentRisk === 'CRITICAL' || c.finalGovernmentRisk === 'HIGH' || c.priority === 'P1';
  }).length;

  const filteredCases = cases.filter((c) => {
    const sTerm = searchTerm.toLowerCase();
    const matchesSearch = 
      (c.title || '').toLowerCase().includes(sTerm) || 
      (c.id || '').toLowerCase().includes(sTerm) ||
      (c.location.address || '').toLowerCase().includes(sTerm) ||
      (c.category || '').toLowerCase().includes(sTerm);
    
    let matchesStatus = true;
    if (filterStatus !== 'All') {
      matchesStatus = (c.status || '').toUpperCase() === filterStatus.toUpperCase();
    }
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-full bg-[#F6F9FC] text-[#0F172A] p-4 sm:p-6 lg:p-8 bg-smart-grid">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP WELCOME & REPORT CTA BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-md relative overflow-hidden">
          <div className="space-y-1.5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified Citizen Session: {currentUser.full_name} ({currentUser.citizen_id || currentUser.phone})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Welcome back, {currentUser.full_name.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Track your real-time municipal complaints, view Government risk classifications, and follow active field squad resolutions.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenReport}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ FILE A NEW COMPLAINT</span>
            </button>
            <button
              onClick={() => onNavigate('citizen-track')}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Track By ID</span>
            </button>
          </div>

          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 4 DYNAMIC SUMMARY CARDS (Calculated purely from real database) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>TOTAL COMPLAINTS</span>
              <FileCheck2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2 font-mono">
              {String(totalReports).padStart(2, '0')}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Stored in municipal database</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs">
            <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase tracking-wider">
              <span>IN PROGRESS</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-amber-600 mt-2 font-mono">
              {String(inProgressCount).padStart(2, '0')}
            </div>
            <div className="text-[11px] text-amber-700/80 mt-0.5">Active under review or squad work</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs">
            <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <span>RESOLVED</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-600 mt-2 font-mono">
              {String(resolvedCount).padStart(2, '0')}
            </div>
            <div className="text-[11px] text-emerald-700/80 mt-0.5">Verified on site & closed</div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs">
            <div className="flex items-center justify-between text-rose-700 text-xs font-bold uppercase tracking-wider">
              <span>CRITICAL / HIGH</span>
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-black text-rose-600 mt-2 font-mono">
              {String(criticalCount).padStart(2, '0')}
            </div>
            <div className="text-[11px] text-rose-700/80 mt-0.5">Elevated risk / emergency priority</div>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Complaint ID, title, locality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {['All', 'SUBMITTED', 'ACTION_IN_PROGRESS', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st === 'All' ? 'All Statuses' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* COMPLAINTS LIST / EMPTY STATE */}
        {filteredCases.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border-2 border-dashed border-slate-300 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileCheck2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                NO COMPLAINTS AVAILABLE
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Citizen complaints will automatically appear here when submitted. Click below to file your first complaint to the municipal database.
              </p>
            </div>
            <button
              onClick={onOpenReport}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>FILE A COMPLAINT NOW</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCases.map((caseItem) => {
              const ops = getIncidentOperationalSummary(caseItem);
              const formattedDate = new Date(caseItem.createdDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              const statusColor = 
                caseItem.status === 'RESOLVED' || caseItem.status === 'Resolved' || caseItem.status === 'CLOSED'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : caseItem.status === 'SUBMITTED'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : caseItem.status === 'UNDER_REVIEW' || caseItem.status === 'ACCEPTED'
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300';

              const riskBadgeColor = 
                caseItem.finalGovernmentRisk === 'CRITICAL'
                  ? 'bg-rose-600 text-white'
                  : caseItem.finalGovernmentRisk === 'HIGH'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : caseItem.finalGovernmentRisk === 'MEDIUM'
                  ? 'bg-blue-600 text-white'
                  : caseItem.finalGovernmentRisk === 'LOW'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-200 text-slate-700 border border-slate-300';

              return (
                <div
                  key={caseItem.id}
                  className="rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    
                    {/* Header: ID + Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-block">
                          {caseItem.id}
                        </span>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Submitted on {formattedDate}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColor}`}>
                          {caseItem.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${riskBadgeColor}`}>
                          Gov Risk: {caseItem.finalGovernmentRisk}
                        </span>
                      </div>
                    </div>

                    {/* Image & Title */}
                    <div className="flex gap-3.5">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img
                          src={caseItem.imageUrl || getCivicImageUrl(resolveCivicImageKey(caseItem.category))}
                          alt={caseItem.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1 flex-1">
                        <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                          {caseItem.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">
                          {caseItem.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{caseItem.location.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* Problem Duration Badge */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Problem Duration:</span>
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        {caseItem.problemDuration || 'Today'}
                      </span>
                    </div>

                    {/* Operations Status Tracker */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Current Action:</span>
                        <span className="text-slate-500 font-mono text-[11px]">{ops.progressPercent}%</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                        {ops.currentAction}
                      </p>
                    </div>

                  </div>

                  {/* Footer button */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Dept: <span className="font-bold text-slate-800">{caseItem.assignedDepartment || 'General Admin'}</span>
                    </span>
                    <button
                      onClick={() => onSelectCase(caseItem.id)}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>TRACK DETAILS</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
