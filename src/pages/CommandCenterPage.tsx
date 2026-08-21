import React, { useState, useMemo } from 'react';
import { 
  CivicCase, 
  CityHotspot, 
  AIInsightItem, 
  CivicCategory, 
  PriorityLevel,
  RiskLevel,
  CaseStatus,
  OfficerWorkUpdate
} from '../types';
import { CaseDetailDrawer } from '../components/CaseDetailDrawer';
import { EscalateConfirmationModal } from '../components/EscalateConfirmationModal';
import { 
  CIVIC_DEPARTMENTS_CONFIG, 
  getAllOfficersList,
  confirmAndAssignOfficerInDb,
  governmentVerifyAndSolveInDb,
  subscribeToOfficerWorkUpdates,
  governmentApproveWorkUpdateInDb,
  governmentRejectWorkUpdateInDb
} from '../services/complaintsService';
import { getCurrentUser } from '../services/authService';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Search, 
  Filter, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  ShieldAlert, 
  Eye, 
  ChevronRight,
  Radio,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  Flame,
  LayoutGrid,
  ListFilter,
  MapPin,
  RefreshCw,
  Building2,
  Check,
  FileCheck2,
  UserCheck,
  User,
  Table as TableIcon,
  Phone,
  Calendar,
  AlertCircle,
  CheckCheck,
  Camera,
  RotateCcw
} from 'lucide-react';

interface CommandCenterPageProps {
  cases: CivicCase[];
  hotspots?: CityHotspot[];
  insights?: AIInsightItem[];
  onSelectCase: (caseItem: CivicCase) => void;
  onNavigateToCaseIntelligence?: (caseId: string) => void;
  onOpenAIAnalysis?: (caseItem: CivicCase) => void;
  onEscalateCase?: (caseId: string, reason?: string, notes?: string) => void;
  onResolveCase?: (caseId: string) => void;
}

export const CommandCenterPage: React.FC<CommandCenterPageProps> = ({
  cases,
  hotspots: initialHotspots,
  insights,
  onSelectCase,
  onNavigateToCaseIntelligence,
  onOpenAIAnalysis,
  onEscalateCase,
  onResolveCase
}) => {
  const currentUser = getCurrentUser();

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMetricFilter, setActiveMetricFilter] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedOfficerFilter, setSelectedOfficerFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Drawer and Modal State
  const [drawerCase, setDrawerCase] = useState<CivicCase | null>(null);
  const [escalateModalCase, setEscalateModalCase] = useState<CivicCase | null>(null);
  const [quickNotification, setQuickNotification] = useState<string | null>(null);
  const [officerUpdates, setOfficerUpdates] = useState<OfficerWorkUpdate[]>([]);
  const [rejectDialogUpdate, setRejectDialogUpdate] = useState<OfficerWorkUpdate | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Subscribe to real-time officer work updates
  React.useEffect(() => {
    const unsub = subscribeToOfficerWorkUpdates((updates) => {
      setOfficerUpdates(updates);
    });
    return () => unsub();
  }, []);

  // Trigger quick banner notification
  const triggerBanner = (msg: string) => {
    setQuickNotification(msg);
    setTimeout(() => setQuickNotification(null), 4000);
  };

  // Government Approval of Officer Work Update
  const handleApproveOfficerUpdate = async (update: OfficerWorkUpdate) => {
    try {
      const isCompleted = update.work_status === 'WORK_COMPLETED';
      await governmentApproveWorkUpdateInDb({
        updateId: update.update_id,
        complaintId: update.complaint_id,
        verifierName: currentUser.full_name || 'Government Admin',
        approvalNotes: isCompleted 
          ? 'Approved field repairs and verified on-site photographic proof. Ticket marked RESOLVED.'
          : 'Approved field progress update.',
        isFinalResolution: isCompleted
      });
      triggerBanner(
        isCompleted
          ? `Officer work approved for Case #${update.complaint_id}! Citizen status officially marked COMPLETED / RESOLVED.`
          : `Officer progress approved for Case #${update.complaint_id}.`
      );
    } catch (err) {
      console.error('Failed to approve officer update:', err);
      triggerBanner('Error approving officer work update.');
    }
  };

  // Government Rejection / Revision Request
  const handleConfirmRejectUpdate = async () => {
    if (!rejectDialogUpdate) return;
    try {
      await governmentRejectWorkUpdateInDb({
        updateId: rejectDialogUpdate.update_id,
        complaintId: rejectDialogUpdate.complaint_id,
        verifierName: currentUser.full_name || 'Government Admin',
        reason: rejectReason || 'More work / documentation required before verification.'
      });
      triggerBanner(`Revision requested for Case #${rejectDialogUpdate.complaint_id}. Returned to officer.`);
      setRejectDialogUpdate(null);
      setRejectReason('');
    } catch (err) {
      console.error('Failed to reject officer update:', err);
      triggerBanner('Error sending revision request.');
    }
  };

  // Keep drawer in sync with updated cases stream from Firestore
  React.useEffect(() => {
    if (drawerCase) {
      const updated = cases.find(c => c.id === drawerCase.id);
      if (updated) {
        setDrawerCase(updated);
      }
    }
  }, [cases]);

  // Handlers for Drawer & Modal
  const handleOpenDrawer = (c: CivicCase) => {
    setDrawerCase(c);
  };

  const handleCloseDrawer = () => {
    setDrawerCase(null);
  };

  const handleOpenEscalateModal = (c: CivicCase) => {
    setEscalateModalCase(c);
  };

  const handleConfirmEscalation = (caseId: string, reason: string, notes: string) => {
    if (onEscalateCase) {
      onEscalateCase(caseId, reason, notes);
    }
    triggerBanner(`Incident ${caseId} escalated. Priority updated.`);
  };

  const handleResolve = (caseId: string) => {
    if (onResolveCase) {
      onResolveCase(caseId);
    }
    triggerBanner(`Incident ${caseId} marked resolved.`);
  };

  // TOP SUMMARY REAL DATABASE METRICS
  const counts = useMemo(() => {
    const newComplaints = cases.filter(c => c.status === 'SUBMITTED').length;
    const underReview = cases.filter(c => c.status === 'UNDER_REVIEW').length;
    const unassigned = cases.filter(c => {
      const isResolved = c.status === 'SOLVED' || c.status === 'RESOLVED' || c.status === 'CLOSED' || c.status === 'REJECTED';
      if (isResolved) return false;
      return !c.assignedOfficerId || c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'ACCEPTED' || c.status === 'RISK_ASSESSED';
    }).length;
    const assignedToOfficers = cases.filter(c => 
      c.status === 'OFFICER_ASSIGNED' || 
      c.status === 'WAITING_FOR_OFFICER_ACCEPTANCE' || 
      c.status === 'WORK_ACCEPTED' ||
      c.status === 'DEPARTMENT_ASSIGNED'
    ).length;
    const inProgress = cases.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ACTION_IN_PROGRESS').length;
    const blockedDelayed = cases.filter(c => c.status === 'BLOCKED' || c.status === 'BLOCKED / DELAYED' || Boolean(c.isBlocked)).length;
    const awaitingVerification = cases.filter(c => c.status === 'AWAITING_VERIFICATION' || c.status === 'AWAITING GOVERNMENT VERIFICATION').length;
    const solved = cases.filter(c => c.status === 'SOLVED' || c.status === 'RESOLVED' || c.status === 'CLOSED').length;

    return {
      newComplaints,
      underReview,
      unassigned,
      assignedToOfficers,
      inProgress,
      blockedDelayed,
      awaitingVerification,
      solved,
      total: cases.length
    };
  }, [cases]);

  // FILTERED CASES STREAM
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        (c.id || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.citizenName || '').toLowerCase().includes(q) ||
        (c.location.address || '').toLowerCase().includes(q) ||
        (c.location.area || '').toLowerCase().includes(q) ||
        (c.location.colony || '').toLowerCase().includes(q) ||
        (c.location.ward || '').toLowerCase().includes(q) ||
        (c.assignedOfficerName || '').toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesDepartment = selectedDepartment === 'All' || c.assignedDepartment === selectedDepartment;
      const matchesOfficer = selectedOfficerFilter === 'All' || c.assignedOfficerName === selectedOfficerFilter;

      // Metric Filter
      let matchesMetric = true;
      if (activeMetricFilter === 'NEW') {
        matchesMetric = c.status === 'SUBMITTED';
      } else if (activeMetricFilter === 'UNDER_REVIEW') {
        matchesMetric = c.status === 'UNDER_REVIEW';
      } else if (activeMetricFilter === 'UNASSIGNED') {
        const isResolved = c.status === 'SOLVED' || c.status === 'RESOLVED' || c.status === 'CLOSED' || c.status === 'REJECTED';
        matchesMetric = !isResolved && (!c.assignedOfficerId || c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'ACCEPTED' || c.status === 'RISK_ASSESSED');
      } else if (activeMetricFilter === 'ASSIGNED') {
        matchesMetric = c.status === 'OFFICER_ASSIGNED' || c.status === 'WAITING_FOR_OFFICER_ACCEPTANCE' || c.status === 'WORK_ACCEPTED' || c.status === 'DEPARTMENT_ASSIGNED';
      } else if (activeMetricFilter === 'IN_PROGRESS') {
        matchesMetric = c.status === 'IN_PROGRESS' || c.status === 'ACTION_IN_PROGRESS';
      } else if (activeMetricFilter === 'BLOCKED') {
        matchesMetric = c.status === 'BLOCKED' || c.status === 'BLOCKED / DELAYED' || Boolean(c.isBlocked);
      } else if (activeMetricFilter === 'AWAITING_VERIFICATION') {
        matchesMetric = c.status === 'AWAITING_VERIFICATION' || c.status === 'AWAITING GOVERNMENT VERIFICATION';
      } else if (activeMetricFilter === 'SOLVED') {
        matchesMetric = c.status === 'SOLVED' || c.status === 'RESOLVED' || c.status === 'CLOSED';
      }

      return matchesSearch && matchesCategory && matchesDepartment && matchesOfficer && matchesMetric;
    });
  }, [cases, searchQuery, selectedCategory, selectedDepartment, selectedOfficerFilter, activeMetricFilter]);

  // UNASSIGNED / NEW COMPLAINTS QUEUE (PRIMARY FOCUS)
  const newPendingComplaints = useMemo(() => {
    return filteredCases.filter(c => {
      const isResolved = c.status === 'SOLVED' || c.status === 'RESOLVED' || c.status === 'CLOSED' || c.status === 'REJECTED';
      if (isResolved) return false;
      return !c.assignedOfficerId || c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW' || c.status === 'ACCEPTED' || c.status === 'RISK_ASSESSED';
    });
  }, [filteredCases]);

  // ACTIVE ASSIGNED OFFICER PIPELINE
  const assignedActiveComplaints = useMemo(() => {
    return filteredCases.filter(c => {
      const isResolved = c.status === 'SOLVED' || c.status === 'RESOLVED' || c.status === 'CLOSED' || c.status === 'REJECTED';
      return !isResolved && (c.assignedOfficerId || c.status === 'OFFICER_ASSIGNED' || c.status === 'WORK_ACCEPTED' || c.status === 'IN_PROGRESS' || c.status === 'BLOCKED' || c.status === 'BLOCKED / DELAYED' || c.status === 'AWAITING_VERIFICATION' || c.status === 'AWAITING GOVERNMENT VERIFICATION');
    });
  }, [filteredCases]);

  const allOfficers = useMemo(() => getAllOfficersList(), []);

  return (
    <div className="min-h-full bg-[#F8FAFC] text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6">
      
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* FLOATING BANNER NOTIFICATION */}
        {quickNotification && (
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{quickNotification}</span>
            </div>
            <button 
              onClick={() => setQuickNotification(null)}
              className="text-slate-400 hover:text-white text-xs ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. GOVERNMENT DASHBOARD HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-blue-700 uppercase">
                GOVERNMENT COMPLAINT ASSIGNMENT DASHBOARD
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Government Complaint Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
              Citizen complaints arrive automatically from the database for triage, risk evaluation, and departmental officer assignment.
            </p>
          </div>

          {/* Quick Actions & Live Sync */}
          <div className="flex items-center gap-2.5">
            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700 shadow-xs flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{cases.length} Total Complaints in DB</span>
            </div>
            <button
              onClick={() => triggerBanner('Synchronized with live Firestore complaints database.')}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Sync Live</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. TOP SUMMARY METRIC RIBBON (REAL DATABASE COUNTS)           */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          
          {/* NEW COMPLAINTS */}
          <button
            onClick={() => setActiveMetricFilter(activeMetricFilter === 'NEW' ? 'ALL' : 'NEW')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeMetricFilter === 'NEW' 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300' 
                : 'bg-white hover:bg-blue-50/50 border-slate-200/90 text-slate-800'
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider truncate flex items-center justify-between">
              <span>NEW COMPLAINTS</span>
            </div>
            <div className="text-2xl font-black mt-1">{counts.newComplaints}</div>
            <div className={`text-[10px] font-semibold mt-0.5 ${activeMetricFilter === 'NEW' ? 'text-blue-100' : 'text-slate-500'}`}>
              Fresh submissions
            </div>
          </button>

          {/* UNDER REVIEW */}
          <button
            onClick={() => setActiveMetricFilter(activeMetricFilter === 'UNDER_REVIEW' ? 'ALL' : 'UNDER_REVIEW')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeMetricFilter === 'UNDER_REVIEW' 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300' 
                : 'bg-white hover:bg-indigo-50/50 border-slate-200/90 text-slate-800'
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider truncate">
              UNDER REVIEW
            </div>
            <div className="text-2xl font-black mt-1">{counts.underReview}</div>
            <div className={`text-[10px] font-semibold mt-0.5 ${activeMetricFilter === 'UNDER_REVIEW' ? 'text-indigo-100' : 'text-slate-500'}`}>
              Clarifications pending
            </div>
          </button>

          {/* UNASSIGNED */}
          <button
            onClick={() => setActiveMetricFilter(activeMetricFilter === 'UNASSIGNED' ? 'ALL' : 'UNASSIGNED')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeMetricFilter === 'UNASSIGNED' 
                ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300' 
                : 'bg-white hover:bg-amber-50/50 border-slate-200/90 text-slate-800'
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider truncate flex items-center justify-between">
              <span>UNASSIGNED</span>
              {counts.unassigned > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
            </div>
            <div className="text-2xl font-black mt-1">{counts.unassigned}</div>
            <div className={`text-[10px] font-semibold mt-0.5 ${activeMetricFilter === 'UNASSIGNED' ? 'text-amber-100' : 'text-amber-700 font-bold'}`}>
              Requires Assignment
            </div>
          </button>

          {/* ASSIGNED TO OFFICERS */}
          <button
            onClick={() => setActiveMetricFilter(activeMetricFilter === 'ASSIGNED' ? 'ALL' : 'ASSIGNED')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeMetricFilter === 'ASSIGNED' 
                ? 'bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-300' 
                : 'bg-white hover:bg-sky-50/50 border-slate-200/90 text-slate-800'
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider truncate">
              ASSIGNED TO OFFICERS
            </div>
            <div className="text-2xl font-black mt-1">{counts.assignedToOfficers}</div>
            <div className={`text-[10px] font-semibold mt-0.5 ${activeMetricFilter === 'ASSIGNED' ? 'text-sky-100' : 'text-slate-500'}`}>
              Squads dispatched
            </div>
          </button>

          {/* IN PROGRESS */}
          <button
            onClick={() => setActiveMetricFilter(activeMetricFilter === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeMetricFilter === 'IN_PROGRESS' 
                ? 'bg-blue-700 text-white border-blue-700 shadow-md ring-2 ring-blue-300' 
                : 'bg-white hover:bg-blue-50/50 border-slate-200/90 text-slate-800'
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider truncate">
              IN PROGRESS
            </div>
            <div className="text-2xl font-black mt-1">{counts.inProgress}</div>
            <div className={`text-[10px] font-semibold mt-0.5 ${activeMetricFilter === 'IN_PROGRESS' ? 'text-blue-100' : 'text-slate-500'}`}>
              Repairs active
            </div>
          </button>

          {/* BLOCKED / DELAYED */}
          <button
            onClick={() => setActiveMetricFilter(activeMetricFilter === 'BLOCKED' ? 'ALL' : 'BLOCKED')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeMetricFilter === 'BLOCKED' 
                ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-300' 
                : 'bg-white hover:bg-rose-50/50 border-slate-200/90 text-slate-800'
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider truncate">
              BLOCKED / DELAYED
            </div>
            <div className="text-2xl font-black mt-1">{counts.blockedDelayed}</div>
            <div className={`text-[10px] font-semibold mt-0.5 ${activeMetricFilter === 'BLOCKED' ? 'text-rose-100' : 'text-rose-700 font-bold'}`}>
              Requires intervention
            </div>
          </button>

          {/* AWAITING VERIFICATION */}
          <button
            onClick={() => setActiveMetricFilter(activeMetricFilter === 'AWAITING_VERIFICATION' ? 'ALL' : 'AWAITING_VERIFICATION')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeMetricFilter === 'AWAITING_VERIFICATION' 
                ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-300' 
                : 'bg-white hover:bg-purple-50/50 border-slate-200/90 text-slate-800'
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider truncate flex items-center justify-between">
              <span>AWAITING VERIFICATION</span>
              {counts.awaitingVerification > 0 && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
            </div>
            <div className="text-2xl font-black mt-1">{counts.awaitingVerification}</div>
            <div className={`text-[10px] font-semibold mt-0.5 ${activeMetricFilter === 'AWAITING_VERIFICATION' ? 'text-purple-100' : 'text-purple-700 font-bold'}`}>
              Report submitted
            </div>
          </button>

          {/* SOLVED */}
          <button
            onClick={() => setActiveMetricFilter(activeMetricFilter === 'SOLVED' ? 'ALL' : 'SOLVED')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeMetricFilter === 'SOLVED' 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300' 
                : 'bg-white hover:bg-emerald-50/50 border-slate-200/90 text-slate-800'
            }`}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider truncate">
              SOLVED
            </div>
            <div className="text-2xl font-black mt-1">{counts.solved}</div>
            <div className={`text-[10px] font-semibold mt-0.5 ${activeMetricFilter === 'SOLVED' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              Completed & verified
            </div>
          </button>

        </div>

        {/* ============================================================ */}
        {/* 3. SEARCH & DEPARTMENT / OFFICER FILTER BAR                   */}
        {/* ============================================================ */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Citizen, Colony, Ward..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Departments</option>
              {CIVIC_DEPARTMENTS_CONFIG.map(d => (
                <option key={d.key} value={d.name}>{d.name}</option>
              ))}
            </select>

            {/* Officer Filter */}
            <select
              value={selectedOfficerFilter}
              onChange={(e) => setSelectedOfficerFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Officers ({allOfficers.length})</option>
              {allOfficers.map(o => (
                <option key={o.id} value={o.name}>{o.name} ({o.departmentName})</option>
              ))}
            </select>

            {/* Active Metric Badge Clearer */}
            {activeMetricFilter !== 'ALL' && (
              <button
                onClick={() => setActiveMetricFilter('ALL')}
                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-blue-800 flex items-center gap-1.5"
              >
                <span>Filter: {activeMetricFilter}</span>
                <RotateCcw className="w-3 h-3" />
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Table Matrix View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. MAIN SECTION: NEW CITIZEN COMPLAINTS / PENDING REVIEW     */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                NEW CITIZEN COMPLAINTS / PENDING REVIEW
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-200">
                {newPendingComplaints.length} Unassigned
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Click [REVIEW & ASSIGN] to open the Government assignment drawer.
            </p>
          </div>

          {/* Case List / Grid for New Complaints */}
          {newPendingComplaints.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {newPendingComplaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border-2 border-amber-200/80 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
                >
                  {/* Top Bar with ID & Risk */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
                        {c.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          c.finalGovernmentRisk === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          c.finalGovernmentRisk === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                          c.finalGovernmentRisk === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                          c.finalGovernmentRisk === 'LOW' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          Risk: {c.finalGovernmentRisk || 'NOT ASSESSED'}
                        </span>
                      </div>
                    </div>

                    {/* Complaint Title */}
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                      {c.title}
                    </h3>

                    {/* Category & Problem Duration */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-3">
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                        {c.category}
                      </span>
                      {c.problemDuration && (
                        <span className="bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200">
                          ⏱️ Duration: {c.problemDuration}
                        </span>
                      )}
                    </div>

                    {/* Citizen & Location info */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600 border border-slate-100">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.citizenName || 'Citizen'}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({c.citizenPhone || '+91 98765 00000'})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.location.colony || c.location.area || 'Ward Area'}, {c.location.city || 'Hyderabad'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                        <span>Submitted: {c.submittedAt ? new Date(c.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}</span>
                        <span className="font-bold text-amber-700">Status: {c.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Review & Assign Button */}
                  <button
                    onClick={() => handleOpenDrawer(c)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-98 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>REVIEW & ASSIGN</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-base text-slate-800">No Unassigned Complaints in Queue</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All citizen complaints have been triaged and assigned to departmental officers. Any new citizen submission will automatically appear here.
              </p>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 5. DEDICATED SECTION: OFFICER WORK UPDATES / PENDING APPROVAL */}
        {/* ============================================================ */}
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-blue-900 to-indigo-950 p-5 rounded-3xl text-white shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
                  OFFICER WORK UPDATES QUEUE
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                Field Officer Progress & Resolution Submissions
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Department officers submit field work reports and photo evidence. Government Admin verification is mandatory to approve and mark tickets COMPLETED / RESOLVED.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white font-mono text-xs font-bold border border-white/15">
                {officerUpdates.length} Total Updates
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-900 font-mono text-xs font-black">
                {officerUpdates.filter(u => u.government_review_status === 'PENDING_APPROVAL').length} Pending Review
              </span>
            </div>
          </div>

          {officerUpdates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {officerUpdates.map((upd) => {
                const isPending = upd.government_review_status === 'PENDING_APPROVAL';
                const isCompletedWork = upd.work_status === 'WORK_COMPLETED';

                return (
                  <div
                    key={upd.update_id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                      isPending
                        ? 'bg-white border-amber-300 shadow-md ring-1 ring-amber-200'
                        : upd.government_review_status === 'APPROVED'
                        ? 'bg-slate-50/80 border-emerald-200'
                        : 'bg-slate-50/80 border-rose-200'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                          Case #{upd.complaint_id}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isPending
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : upd.government_review_status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {upd.government_review_status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Officer Info */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                          <UserCheck className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <div className="font-black text-xs text-slate-900">{upd.officer_name}</div>
                          <div className="text-[11px] text-slate-500">{upd.department_name}</div>
                        </div>
                      </div>

                      {/* Work Description & Progress */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[11px] font-bold">
                          <span className="text-slate-600">Work Status:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            isCompletedWork ? 'bg-emerald-100 text-emerald-800 font-extrabold' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {upd.work_status} ({upd.progress_percentage}%)
                          </span>
                        </div>

                        <p className="text-slate-800 font-medium leading-relaxed">
                          "{upd.work_description}"
                        </p>

                        {upd.next_action && (
                          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                            <strong>Next:</strong> {upd.next_action}
                          </div>
                        )}

                        {upd.issues_encountered && (
                          <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                            <strong>Bottleneck:</strong> {upd.issues_encountered}
                          </div>
                        )}
                      </div>

                      {/* Proof Photo if provided */}
                      {upd.proof_image_url && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Camera className="w-3 h-3 text-blue-600" />
                            <span>Officer Work Proof Evidence:</span>
                          </span>
                          <div className="h-28 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                            <img
                              src={upd.proof_image_url}
                              alt="Work Proof"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute bottom-1.5 right-1.5 bg-slate-900/80 text-white text-[9px] font-mono px-2 py-0.5 rounded-md">
                              Site Verified
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
                        <span>Submitted: {new Date(upd.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>{new Date(upd.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Government Actions */}
                    {isPending ? (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleApproveOfficerUpdate(upd)}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isCompletedWork ? 'Approve & SOLVE' : 'Approve Progress'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRejectDialogUpdate(upd);
                            setRejectReason('');
                          }}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Request Revision</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2 px-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                        Reviewed by {upd.government_reviewed_by || 'Government Admin'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500 space-y-1">
              <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No Officer Work Updates Submitted Yet</p>
              <p>When field officers record progress in the Officer Workspace, submissions will appear here for Government approval.</p>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* 6. ACTIVE OFFICER ASSIGNMENTS & PIPELINE SECTION              */}
        {/* ============================================================ */}
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                OFFICER ASSIGNMENTS & FIELD PIPELINE
              </h2>
              <p className="text-xs text-slate-500">
                Track assigned officers, progress metrics, blocked issues, and verification readiness.
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-extrabold border border-blue-200">
              {assignedActiveComplaints.length} Assigned Cases Active
            </span>
          </div>

          {/* VIEW MODE: TABLE MATRIX */}
          {viewMode === 'table' ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">ID</th>
                      <th className="py-3.5 px-4">Complaint Title</th>
                      <th className="py-3.5 px-4">Citizen</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Risk</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Assigned Officer</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Progress</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCases.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                          {c.id}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                          {c.title}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          {c.citizenName || 'Citizen'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {c.location.colony || c.location.area || 'Ward Area'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                            {c.problemDuration || '1–3 Days'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            c.finalGovernmentRisk === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            c.finalGovernmentRisk === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                            c.finalGovernmentRisk === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {c.finalGovernmentRisk || 'NOT ASSESSED'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                          {c.assignedDepartment || 'General Municipal'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                          {c.assignedOfficerName ? (
                            <span className="flex items-center gap-1.5 text-blue-700">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{c.assignedOfficerName}</span>
                            </span>
                          ) : (
                            <span className="text-amber-600 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                            c.status === 'SOLVED' || c.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                            c.status === 'AWAITING GOVERNMENT VERIFICATION' || c.status === 'AWAITING_VERIFICATION' ? 'bg-purple-100 text-purple-800' :
                            c.status === 'BLOCKED' || c.status === 'BLOCKED / DELAYED' ? 'bg-rose-100 text-rose-800' :
                            c.status === 'OFFICER_ASSIGNED' || c.status === 'WORK_ACCEPTED' ? 'bg-sky-100 text-sky-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {c.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full"
                                style={{ width: `${c.progress ?? 0}%` }}
                              />
                            </div>
                            <span className="font-bold text-[10px] text-slate-600">{c.progress ?? 0}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenDrawer(c)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* VIEW MODE: CARDS */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedActiveComplaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
                        {c.id}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        c.status === 'AWAITING GOVERNMENT VERIFICATION' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        c.status === 'BLOCKED / DELAYED' || c.isBlocked ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                      {c.title}
                    </h3>

                    {/* Assigned Officer & Department Highlight */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Assigned Officer:</span>
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>{c.assignedOfficerName || 'Ravi Kumar'}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Department:</span>
                        <span className="font-medium text-slate-700 truncate max-w-[170px]">{c.assignedDepartment}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="pt-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
                          <span>Field Progress</span>
                          <span className="text-blue-700">{c.progress ?? 0}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              c.progress && c.progress >= 90 ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${c.progress ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOpenDrawer(c)}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage Ticket</span>
                    </button>
                    {c.status === 'AWAITING GOVERNMENT VERIFICATION' && (
                      <button
                        onClick={() => handleOpenDrawer(c)}
                        className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 whitespace-nowrap shadow-sm"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Verify & Solve</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* ============================================================ */}
      {/* 6. RIGHT-SIDE REVIEW & ASSIGN DRAWER (NO UNEXPECTED REDIRECTS) */}
      {/* ============================================================ */}
      <CaseDetailDrawer
        caseItem={drawerCase}
        isOpen={Boolean(drawerCase)}
        onClose={handleCloseDrawer}
        onOpenFullCase={(id) => onNavigateToCaseIntelligence?.(id)}
        onEscalate={(item) => handleOpenEscalateModal(item)}
        onResolve={(id) => handleResolve(id)}
      />

      {/* ESCALATION CONFIRMATION MODAL */}
      {escalateModalCase && (
        <EscalateConfirmationModal
          caseItem={escalateModalCase}
          isOpen={Boolean(escalateModalCase)}
          onClose={() => setEscalateModalCase(null)}
          onConfirm={(reason, notes) => {
            handleConfirmEscalation(escalateModalCase.id, reason, notes);
            setEscalateModalCase(null);
          }}
        />
      )}

      {/* OFFICER WORK UPDATE REVISION MODAL */}
      {rejectDialogUpdate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Request Officer Work Revision</h3>
                <p className="text-xs text-slate-500 font-mono">Case #{rejectDialogUpdate.complaint_id} • Officer {rejectDialogUpdate.officer_name}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Reason / Action Required from Officer:
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain what additional work, photographic proof, or corrective action is required before Government sign-off..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectDialogUpdate(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectUpdate}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-sm transition-all"
              >
                Send Revision to Officer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
