import React, { useState, useEffect, useMemo } from 'react';
import { 
  HardHat, 
  LogOut, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  CheckCircle,
  FileText, 
  Send, 
  Image as ImageIcon, 
  Calendar, 
  Building2, 
  Phone, 
  User, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Eye,
  Camera,
  Upload,
  AlertCircle
} from 'lucide-react';
import { 
  AppView, 
  CivicCase, 
  DepartmentOfficer, 
  OfficerWorkUpdate 
} from '../types';
import { 
  subscribeToComplaints, 
  submitOfficerWorkUpdateInDb, 
  OfficerWorkUpdateInput,
  confirmAndAssignOfficerInDb,
  subscribeToOfficerWorkUpdates
} from '../services/complaintsService';
import { getActiveOfficer, clearActiveOfficer } from '../services/authService';

interface OfficerWorkspacePageProps {
  onNavigate: (view: AppView) => void;
  activeOfficer?: DepartmentOfficer | null;
}

export const OfficerWorkspacePage: React.FC<OfficerWorkspacePageProps> = ({
  onNavigate,
  activeOfficer: propOfficer
}) => {
  const [officer, setOfficer] = useState<DepartmentOfficer | null>(() => {
    return propOfficer || getActiveOfficer();
  });

  const [allCases, setAllCases] = useState<CivicCase[]>([]);
  const [allWorkUpdates, setAllWorkUpdates] = useState<OfficerWorkUpdate[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'WAITING_VERIFY' | 'SOLVED'>('ALL');

  // Form State
  const [workStatus, setWorkStatus] = useState<'IN_PROGRESS' | 'BLOCKED' | 'WORK_COMPLETED'>('IN_PROGRESS');
  const [progressPercentage, setProgressPercentage] = useState<number>(50);
  const [workDescription, setWorkDescription] = useState<string>('');
  const [nextAction, setNextAction] = useState<string>('');
  const [issuesEncountered, setIssuesEncountered] = useState<string>('');
  const [estimatedCompletion, setEstimatedCompletion] = useState<string>('24 Hours');
  const [materialsUsed, setMaterialsUsed] = useState<string>('');
  const [proofImageUrl, setProofImageUrl] = useState<string>('');
  
  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState<string | null>(null);
  const [submissionErrorMsg, setSubmissionErrorMsg] = useState<string | null>(null);

  // Subscribe to complaints & work updates
  useEffect(() => {
    const unsubCases = subscribeToComplaints((cases) => {
      setAllCases(cases);
    });

    const unsubUpdates = subscribeToOfficerWorkUpdates((updates) => {
      setAllWorkUpdates(updates);
    });

    return () => {
      unsubCases();
      unsubUpdates();
    };
  }, []);

  // Filter complaints assigned ONLY to this officer
  const assignedCases = useMemo(() => {
    if (!officer) return [];
    return allCases.filter(c => {
      const matchId = c.assignedOfficerId === officer.id;
      const matchName = c.assignedOfficerName && c.assignedOfficerName.toLowerCase() === officer.name.toLowerCase();
      return matchId || matchName;
    });
  }, [allCases, officer]);

  // Filtered by sub-tab
  const filteredAssignedCases = useMemo(() => {
    return assignedCases.filter(c => {
      if (statusFilter === 'PENDING') {
        return c.status === 'IN_PROGRESS' || c.status === 'OFFICER ASSIGNED' || c.status === 'BLOCKED / DELAYED';
      }
      if (statusFilter === 'WAITING_VERIFY') {
        return c.status === 'AWAITING GOVERNMENT VERIFICATION' || c.status === 'AWAITING_VERIFICATION';
      }
      if (statusFilter === 'SOLVED') {
        return c.status === 'SOLVED';
      }
      return true;
    });
  }, [assignedCases, statusFilter]);

  // Set initial selected case
  useEffect(() => {
    if (assignedCases.length > 0) {
      if (!selectedCaseId || !assignedCases.find(c => c.id === selectedCaseId)) {
        setSelectedCaseId(assignedCases[0].id);
      }
    } else {
      setSelectedCaseId(null);
    }
  }, [assignedCases, selectedCaseId]);

  // Currently active selected case
  const activeCase = useMemo(() => {
    return assignedCases.find(c => c.id === selectedCaseId) || null;
  }, [assignedCases, selectedCaseId]);

  // Updates for active case
  const caseUpdates = useMemo(() => {
    if (!activeCase) return [];
    return allWorkUpdates.filter(u => u.complaint_id === activeCase.id);
  }, [allWorkUpdates, activeCase]);

  // Pre-fill form when selecting a case
  useEffect(() => {
    if (activeCase) {
      setProgressPercentage(activeCase.progress || 50);
      setWorkDescription(activeCase.officerUpdateNote || activeCase.currentAction || 'Squad arrived on location. Initial site assessment completed.');
      setNextAction(activeCase.nextAction || 'Deploying repair equipment and leveling terrain.');
      setIssuesEncountered(activeCase.blockedReason || '');
      setEstimatedCompletion(activeCase.expectedCompletionDate || 'Tomorrow 5:00 PM');
      setMaterialsUsed('');
      setProofImageUrl(activeCase.resolvedImageUrl || '');

      if (activeCase.status === 'BLOCKED / DELAYED') {
        setWorkStatus('BLOCKED');
      } else if (activeCase.status === 'AWAITING GOVERNMENT VERIFICATION' || activeCase.status === 'AWAITING_VERIFICATION') {
        setWorkStatus('WORK_COMPLETED');
      } else {
        setWorkStatus('IN_PROGRESS');
      }

      setSubmissionSuccessMsg(null);
      setSubmissionErrorMsg(null);
    }
  }, [activeCase?.id]);

  const handleLogout = () => {
    clearActiveOfficer();
    onNavigate('officer-login');
  };

  // Helper to assign a sample complaint if officer has none
  const handleAssignSampleComplaint = async () => {
    if (!officer) return;
    const unassigned = allCases.find(c => !c.assignedOfficerId || c.status === 'NEW COMPLAINT' || c.status === 'UNDER REVIEW');
    const caseToAssign = unassigned || allCases[0];
    if (caseToAssign) {
      await confirmAndAssignOfficerInDb({
        complaintId: caseToAssign.id,
        riskLevel: caseToAssign.finalGovernmentRisk || 'HIGH',
        riskReason: 'Assigned directly for field inspection',
        departmentKey: officer.departmentKey,
        departmentName: officer.departmentName,
        officerId: officer.id,
        officerName: officer.name,
        assignedBy: 'Government Admin (Direct Assignment)'
      });
      setSelectedCaseId(caseToAssign.id);
    }
  };

  // Submit Work Update
  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !officer) return;

    if (!workDescription.trim()) {
      setSubmissionErrorMsg('Please describe the work completed or current actions.');
      return;
    }

    setIsSubmitting(true);
    setSubmissionErrorMsg(null);
    setSubmissionSuccessMsg(null);

    try {
      const input: OfficerWorkUpdateInput = {
        complaintId: activeCase.id,
        officerId: officer.id,
        officerName: officer.name,
        departmentName: officer.departmentName,
        progressPercentage: workStatus === 'WORK_COMPLETED' ? 95 : progressPercentage,
        workStatus: workStatus,
        workDescription: workDescription.trim(),
        nextAction: nextAction.trim() || 'Awaiting municipal verification',
        issuesEncountered: workStatus === 'BLOCKED' ? issuesEncountered.trim() : '',
        estimatedCompletion: estimatedCompletion.trim(),
        materialsUsed: materialsUsed.trim(),
        proofImageUrl: proofImageUrl.trim()
      };

      await submitOfficerWorkUpdateInDb(input);

      setIsSubmitting(false);
      setSubmissionSuccessMsg(
        workStatus === 'WORK_COMPLETED'
          ? 'Work update submitted successfully! Sent to Government Admin for final verification & citizen resolution.'
          : 'Work progress updated successfully and synced with Municipal registry.'
      );
    } catch (err: any) {
      console.error('Error submitting officer update:', err);
      setIsSubmitting(false);
      setSubmissionErrorMsg('Failed to submit work update. Please check network connection.');
    }
  };

  if (!officer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Officer Session Not Found</h2>
          <p className="text-xs text-slate-600">
            Please log in with your authorized department officer badge to access your private field workspace.
          </p>
          <button
            onClick={() => onNavigate('officer-login')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            Go to Officer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-[#0F172A] flex flex-col justify-between select-none">
      
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          {/* Left: Officer Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-inner">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-tight">{officer.name}</span>
                <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/20">
                  {officer.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {officer.designation || 'Field Officer'} • <span className="text-cyan-300">{officer.departmentName}</span>
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Assigned Tasks: <strong>{assignedCases.length}</strong></span>
            </div>

            <button
              onClick={() => onNavigate('officer-login')}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-all font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              title="Switch Officer"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Switch Officer</span>
            </button>

            <button
              onClick={handleLogout}
              className="text-xs text-red-300 hover:text-white bg-red-950/40 hover:bg-red-600 px-3 py-2 rounded-xl transition-all font-semibold flex items-center gap-1.5 border border-red-800/40 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workplace Body */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        
        {/* Top Info Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Officer Work Update Workspace</span>
              <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                Restricted Field Mode
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an assigned complaint to record work progress, upload proof photos, and submit reports for Government verification.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('landing')}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              Public Landing
            </button>
            <button
              onClick={() => onNavigate('gov-login')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl border border-blue-200 transition-all cursor-pointer"
            >
              Government Admin Portal
            </button>
          </div>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Assigned Complaints List (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                  Assigned Complaints
                </h2>
                <span className="text-[11px] text-slate-500">
                  {assignedCases.length} tasks assigned to {officer.name}
                </span>
              </div>

              {assignedCases.length === 0 && (
                <button
                  type="button"
                  onClick={handleAssignSampleComplaint}
                  className="text-[11px] font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 transition-all"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Assign Test Case</span>
                </button>
              )}
            </div>

            {/* Sub-Tabs / Filters */}
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-extrabold text-slate-600">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`py-1.5 rounded-lg transition-all ${statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
              >
                All ({assignedCases.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PENDING')}
                className={`py-1.5 rounded-lg transition-all ${statusFilter === 'PENDING' ? 'bg-white text-blue-700 shadow-2xs' : 'hover:text-slate-900'}`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('WAITING_VERIFY')}
                className={`py-1.5 rounded-lg transition-all ${statusFilter === 'WAITING_VERIFY' ? 'bg-white text-amber-700 shadow-2xs' : 'hover:text-slate-900'}`}
              >
                Review
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('SOLVED')}
                className={`py-1.5 rounded-lg transition-all ${statusFilter === 'SOLVED' ? 'bg-white text-emerald-700 shadow-2xs' : 'hover:text-slate-900'}`}
              >
                Solved
              </button>
            </div>

            {/* List of Cases */}
            {filteredAssignedCases.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-slate-700">No complaints matching filter</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {assignedCases.length === 0 
                      ? "You currently have no tasks assigned by Government Admin." 
                      : "No complaints in this status category."}
                  </p>
                </div>
                {assignedCases.length === 0 && (
                  <button
                    type="button"
                    onClick={handleAssignSampleComplaint}
                    className="text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-xl transition-all shadow-xs"
                  >
                    Assign Demo Complaint to Me
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                {filteredAssignedCases.map((c) => {
                  const isSelected = c.id === selectedCaseId;
                  
                  let statusBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (c.status === 'SOLVED') statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  else if (c.status === 'BLOCKED / DELAYED') statusBadgeClass = 'bg-red-50 text-red-700 border-red-200';
                  else if (c.status === 'AWAITING GOVERNMENT VERIFICATION' || c.status === 'AWAITING_VERIFICATION') {
                    statusBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  }

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2 ${
                        isSelected 
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-300 shadow-sm' 
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-slate-900">{c.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusBadgeClass}`}>
                          {c.status === 'AWAITING GOVERNMENT VERIFICATION' ? 'Gov Review' : c.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{c.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.category}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[120px]">{c.location?.colony || c.location?.ward || 'City Zone'}</span>
                        </span>
                        <span className="font-bold text-blue-700">{c.progress || 0}% Progress</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Right Column: Work Update Form & Case Brief (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeCase ? (
              <>
                {/* 1. Complaint Summary Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  
                  {/* Top Bar: Case ID + Citizen Status info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          {activeCase.id}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {activeCase.category}
                        </span>
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                        {activeCase.title}
                      </h2>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Citizen Tracking Status</span>
                      <div className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-lg mt-0.5">
                        {activeCase.status === 'SOLVED' ? '✅ Resolved' : activeCase.status === 'AWAITING GOVERNMENT VERIFICATION' ? '⏳ Under Review (Gov Verification)' : '🔄 Processing'}
                      </div>
                    </div>
                  </div>

                  {/* 3-Column Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Citizen Contact</span>
                      <p className="font-bold text-slate-800 mt-0.5">{activeCase.citizenName || 'Rahul Sharma'}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{activeCase.citizenPhone || '+91 98230 44120'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Incident Location</span>
                      <p className="font-bold text-slate-800 mt-0.5">{activeCase.location?.colony || 'Sector 4'}</p>
                      <p className="text-[11px] text-slate-500">{activeCase.location?.address || 'Main Road Junction'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Government SLA & Risk</span>
                      <p className="font-bold text-slate-800 mt-0.5">
                        Risk: <span className="text-red-700 font-extrabold">{activeCase.riskLevel || 'High'}</span>
                      </p>
                      <p className="text-[11px] text-blue-700 font-bold">
                        Target: {activeCase.expectedCompletionDate || 'Within 48h'}
                      </p>
                    </div>
                  </div>

                  {/* Description & Citizen Image */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                    <div className="sm:col-span-3 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Citizen Incident Report</span>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal bg-white p-3 rounded-xl border border-slate-200">
                        {activeCase.description || 'Citizen reported civic issue requiring immediate municipal attention.'}
                      </p>
                    </div>

                    <div className="sm:col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Citizen Photo</span>
                      <div className="h-20 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                        <img
                          src={activeCase.imageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=400&q=80'}
                          alt="Citizen evidence"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. Form-Based Work Update Interface */}
                <form onSubmit={handleSubmitUpdate} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">Officer Work Update Form</h3>
                        <p className="text-[11px] text-slate-500">Record field actions, progress %, and upload proof of work.</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      Case #{activeCase.id}
                    </span>
                  </div>

                  {/* Work Status Selection (3 Option Pills) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>1. Current Field Work Status</span>
                      <span className="text-[10px] text-slate-400 font-normal">Select status to reflect current progress</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      
                      {/* In Progress */}
                      <button
                        type="button"
                        onClick={() => {
                          setWorkStatus('IN_PROGRESS');
                          if (progressPercentage >= 100) setProgressPercentage(75);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          workStatus === 'IN_PROGRESS'
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300 shadow-xs text-blue-900'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          workStatus === 'IN_PROGRESS' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs">In Progress</div>
                          <div className="text-[10px] text-slate-500">Squad actively working</div>
                        </div>
                      </button>

                      {/* Blocked / Delayed */}
                      <button
                        type="button"
                        onClick={() => setWorkStatus('BLOCKED')}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          workStatus === 'BLOCKED'
                            ? 'bg-red-50 border-red-500 ring-2 ring-red-300 shadow-xs text-red-900'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          workStatus === 'BLOCKED' ? 'bg-red-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                        }`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs">Blocked / Delayed</div>
                          <div className="text-[10px] text-slate-500">Resource / weather hurdle</div>
                        </div>
                      </button>

                      {/* Work Completed */}
                      <button
                        type="button"
                        onClick={() => {
                          setWorkStatus('WORK_COMPLETED');
                          setProgressPercentage(100);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          workStatus === 'WORK_COMPLETED'
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 shadow-xs text-emerald-900'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          workStatus === 'WORK_COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 border border-slate-200'
                        }`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs">Work Completed</div>
                          <div className="text-[10px] text-slate-500">Ready for Gov Approval</div>
                        </div>
                      </button>

                    </div>
                  </div>

                  {/* Progress Slider */}
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-slate-800">
                        2. Progress Percentage: <span className="font-mono text-blue-700 font-extrabold text-sm">{progressPercentage}%</span>
                      </label>
                      <span className="text-[11px] font-bold text-slate-500">
                        {progressPercentage === 100 ? '100% (Repairs Concluded)' : `${progressPercentage}% Completed`}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={progressPercentage}
                      onChange={(e) => setProgressPercentage(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>0% (Dispatched)</span>
                      <span>25%</span>
                      <span>50% (On-Site)</span>
                      <span>75%</span>
                      <span>100% (Finished)</span>
                    </div>
                  </div>

                  {/* Work Description & Next Steps (Textareas) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>3. Work Done / Current Action <span className="text-red-500">*</span></span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={workDescription}
                        onChange={(e) => setWorkDescription(e.target.value)}
                        placeholder="Detail the actions taken by your squad on site..."
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        4. Next Action Planned
                      </label>
                      <textarea
                        rows={3}
                        value={nextAction}
                        onChange={(e) => setNextAction(e.target.value)}
                        placeholder="What is the next scheduled step or verification?"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                  </div>

                  {/* If Blocked: Bottleneck Reason Input */}
                  {workStatus === 'BLOCKED' && (
                    <div className="space-y-1.5 bg-red-50 p-4 rounded-2xl border border-red-200 animate-in fade-in duration-200">
                      <label className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Bottleneck / Delay Reason</span>
                      </label>
                      <input
                        type="text"
                        value={issuesEncountered}
                        onChange={(e) => setIssuesEncountered(e.target.value)}
                        placeholder="Specify delay reason (e.g., Heavy rain, waiting for pipeline parts, traffic permission)..."
                        className="w-full p-2.5 bg-white border border-red-300 rounded-xl text-xs text-red-900 placeholder-red-400 focus:ring-2 focus:ring-red-600 focus:outline-hidden font-medium"
                      />
                    </div>
                  )}

                  {/* Materials Used & Estimated Completion */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        5. Equipment & Materials Used
                      </label>
                      <input
                        type="text"
                        value={materialsUsed}
                        onChange={(e) => setMaterialsUsed(e.target.value)}
                        placeholder="e.g. 2 tons asphalt, excavator #3, replacement valve"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        6. Estimated Completion Time
                      </label>
                      <input
                        type="text"
                        value={estimatedCompletion}
                        onChange={(e) => setEstimatedCompletion(e.target.value)}
                        placeholder="e.g. Tomorrow 4:00 PM, 24 Hours"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Proof Photo Upload / URL */}
                  <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-blue-600" />
                        <span>7. Work Proof / After Photo URL</span>
                      </label>
                      <span className="text-[11px] text-slate-400">Required for official resolution verification</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={proofImageUrl}
                        onChange={(e) => setProofImageUrl(e.target.value)}
                        placeholder="Paste repair photo image URL or select a sample photo..."
                        className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-hidden font-mono"
                      />
                    </div>

                    {/* Quick Preset Photo Selector for Fast Demo */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold text-slate-400">Preset Demo Proofs:</span>
                      <button
                        type="button"
                        onClick={() => setProofImageUrl('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80')}
                        className="text-[10px] font-bold text-blue-700 bg-white hover:bg-blue-50 px-2 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer"
                      >
                        Repaired Road
                      </button>
                      <button
                        type="button"
                        onClick={() => setProofImageUrl('https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80')}
                        className="text-[10px] font-bold text-blue-700 bg-white hover:bg-blue-50 px-2 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer"
                      >
                        Cleaned Street
                      </button>
                      <button
                        type="button"
                        onClick={() => setProofImageUrl('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80')}
                        className="text-[10px] font-bold text-blue-700 bg-white hover:bg-blue-50 px-2 py-1 rounded-lg border border-slate-200 transition-all cursor-pointer"
                      >
                        Repaired Pipeline
                      </button>
                    </div>

                    {proofImageUrl && (
                      <div className="mt-2 h-28 w-44 rounded-xl overflow-hidden border border-slate-300 relative">
                        <img 
                          src={proofImageUrl} 
                          alt="Proof preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                          Proof Ready
                        </span>
                      </div>
                    )}
                  </div>

                  {/* MANDATORY GOVERNMENT APPROVAL WORKFLOW BANNER */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-black text-amber-900">
                      <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>OFFICIAL GOVERNMENT VERIFICATION RULE</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800">
                      The officer alone <strong>cannot</strong> close the citizen complaint. Submitting this form sends your work update and proof to the <strong>Government Admin Command Center</strong>. The citizen tracking status will only change to <strong>COMPLETED / RESOLVED</strong> after official Government review and approval.
                    </p>
                  </div>

                  {/* Feedback Messages */}
                  {submissionErrorMsg && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-200">
                      {submissionErrorMsg}
                    </div>
                  )}

                  {submissionSuccessMsg && (
                    <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{submissionSuccessMsg}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-blue-700 text-white font-extrabold text-xs tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting Update to Government System...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>SUBMIT WORK UPDATE FOR GOVERNMENT REVIEW</span>
                      </>
                    )}
                  </button>

                </form>

                {/* 3. History of Submitted Updates for this Case */}
                {caseUpdates.length > 0 && (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Previous Work Updates for Case #{activeCase.id}</span>
                    </h3>

                    <div className="space-y-3">
                      {caseUpdates.map((upd) => (
                        <div key={upd.update_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{upd.work_description}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              upd.government_review_status === 'APPROVED' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : upd.government_review_status === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              Gov Status: {upd.government_review_status}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 flex items-center justify-between font-mono">
                            <span>Progress: {upd.progress_percentage}% • {upd.work_status}</span>
                            <span>{new Date(upd.submitted_at).toLocaleString()}</span>
                          </div>

                          {upd.government_feedback && (
                            <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                              <strong>Government Feedback:</strong> {upd.government_feedback}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center space-y-4">
                <HardHat className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-800">No Assigned Complaint Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Please select an assigned complaint from the left panel to load the work update form.
                </p>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-200 mt-8">
        CivicMind Officer Field Interface • Connected to Municipal Central Registry
      </footer>

    </div>
  );
};
