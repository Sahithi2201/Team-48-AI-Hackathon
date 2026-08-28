import { CivicCase, PriorityLevel, CaseStatus, RiskLevel } from '../types';

export interface SeverityInfo {
  level: RiskLevel | 'INFO';
  label: string;
  code: PriorityLevel;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  cardBorderHover: string;
  pillClass: string;
  bannerBg: string;
}

export interface LifecycleStage {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
  actor?: string;
  description?: string;
}

export interface IncidentOperationalSummary {
  severity: SeverityInfo;
  plainStatus: string;
  progressPercent: number;
  currentStageName: string;
  currentAction: string;
  nextAction: string;
  slaFormatted: string;
  slaIsUrgent: boolean;
  lifecycleStages: LifecycleStage[];
  aiSummaryBrief: string;
  aiClassificationReason: string;
}

/**
 * Returns human-readable risk and severity details
 */
export function getSeverityInfo(
  priorityOrRisk?: PriorityLevel | RiskLevel | string, 
  isEscalated?: boolean,
  governmentRisk?: RiskLevel
): SeverityInfo {
  if (isEscalated) {
    return {
      level: 'CRITICAL',
      label: 'CRITICAL',
      code: 'P1',
      badgeBg: 'bg-rose-600',
      badgeText: 'text-white',
      badgeBorder: 'border-rose-700',
      dotColor: 'bg-rose-500',
      cardBorderHover: 'hover:border-rose-500',
      pillClass: 'bg-rose-100 text-rose-800 border-rose-200',
      bannerBg: 'bg-gradient-to-r from-rose-600 to-red-700 text-white'
    };
  }

  const effectiveRisk = governmentRisk || priorityOrRisk;

  if (effectiveRisk === 'CRITICAL' || effectiveRisk === 'P1') {
    return {
      level: 'CRITICAL',
      label: 'CRITICAL',
      code: 'P1',
      badgeBg: 'bg-rose-600',
      badgeText: 'text-white',
      badgeBorder: 'border-rose-700',
      dotColor: 'bg-rose-500',
      cardBorderHover: 'hover:border-rose-400',
      pillClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      bannerBg: 'bg-rose-600 text-white'
    };
  }

  if (effectiveRisk === 'HIGH' || effectiveRisk === 'P2') {
    return {
      level: 'HIGH',
      label: 'HIGH',
      code: 'P2',
      badgeBg: 'bg-amber-500',
      badgeText: 'text-slate-950',
      badgeBorder: 'border-amber-600',
      dotColor: 'bg-amber-500',
      cardBorderHover: 'hover:border-amber-400',
      pillClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      bannerBg: 'bg-amber-500 text-slate-950'
    };
  }

  if (effectiveRisk === 'MEDIUM' || effectiveRisk === 'P3') {
    return {
      level: 'MEDIUM',
      label: 'MEDIUM',
      code: 'P3',
      badgeBg: 'bg-blue-600',
      badgeText: 'text-white',
      badgeBorder: 'border-blue-700',
      dotColor: 'bg-blue-500',
      cardBorderHover: 'hover:border-blue-400',
      pillClass: 'bg-blue-100 text-blue-800 border-blue-200 font-bold',
      bannerBg: 'bg-blue-600 text-white'
    };
  }

  if (effectiveRisk === 'LOW' || effectiveRisk === 'P4') {
    return {
      level: 'LOW',
      label: 'LOW',
      code: 'P4',
      badgeBg: 'bg-slate-600',
      badgeText: 'text-white',
      badgeBorder: 'border-slate-700',
      dotColor: 'bg-slate-400',
      cardBorderHover: 'hover:border-slate-400',
      pillClass: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
      bannerBg: 'bg-slate-700 text-white'
    };
  }

  // Not yet assessed default
  return {
    level: 'NOT YET ASSESSED',
    label: 'NOT YET ASSESSED',
    code: 'P3',
    badgeBg: 'bg-slate-400',
    badgeText: 'text-white',
    badgeBorder: 'border-slate-500',
    dotColor: 'bg-slate-400',
    cardBorderHover: 'hover:border-slate-400',
    pillClass: 'bg-slate-100 text-slate-700 border-slate-300 font-medium',
    bannerBg: 'bg-slate-600 text-white'
  };
}

/**
 * Derives clear operations progress and human-readable next actions
 */
export function getIncidentOperationalSummary(caseItem: CivicCase): IncidentOperationalSummary {
  const severity = getSeverityInfo(caseItem.priority, caseItem.isEscalated, caseItem.finalGovernmentRisk);

  let plainStatus = 'Submitted';
  let progressPercent = typeof caseItem.progress === 'number' && caseItem.progress > 0 ? caseItem.progress : 5;
  let currentStageName = 'Submitted';
  let currentAction = caseItem.currentAction || 'Complaint submitted to municipal queue.';
  let nextAction = caseItem.nextAction || 'AI triage analysis and Government Officer review.';

  const st = (caseItem.status || '').toUpperCase().trim();

  // Full real-world lifecycle stages: Citizen -> Gov/AI -> Officer -> Officer Work -> Gov Approval -> Citizen
  const stages: LifecycleStage[] = [
    { id: 's1', name: 'Citizen Submission', status: 'completed', timestamp: caseItem.createdDate || caseItem.submittedAt, actor: caseItem.citizenName || 'Citizen' },
    { id: 's2', name: 'AI Triage & Analysis', status: 'pending', actor: 'CivicMind AI Swarm' },
    { id: 's3', name: 'Government Acceptance', status: 'pending', actor: 'Government Command Desk' },
    { id: 's4', name: 'Officer Assigned', status: 'pending', actor: caseItem.assignedDepartment || 'Department Dispatch' },
    { id: 's5', name: 'Field Work In Progress', status: 'pending', actor: caseItem.assignedOfficerName || 'Field Squad' },
    { id: 's6', name: 'Work Completed Review', status: 'pending', actor: 'Government Verification Desk' },
    { id: 's7', name: 'Verified & Resolved', status: 'pending', actor: 'Municipal Operations' }
  ];

  if (st === 'SUBMITTED') {
    plainStatus = 'Submitted — In Queue';
    progressPercent = caseItem.progress ?? 5;
    currentStageName = 'Citizen Submission';
    stages[0].status = 'completed';
    stages[1].status = 'current';
    currentAction = caseItem.currentAction || 'Complaint logged into municipal central registry.';
    nextAction = caseItem.nextAction || 'AI multi-agent triage and classification.';
  } else if (st === 'AI_PROCESSING') {
    plainStatus = 'AI Analysis In Progress';
    progressPercent = caseItem.progress ?? 10;
    currentStageName = 'AI Triage';
    stages[0].status = 'completed';
    stages[1].status = 'current';
    currentAction = caseItem.currentAction || 'Agentic AI evaluating severity, department routing, and duplicate risk.';
    nextAction = caseItem.nextAction || 'Government review and validation of AI recommendation.';
  } else if (st === 'AI_COMPLETED' || st === 'AI_ANALYSIS_COMPLETED' || st === 'UNDER_REVIEW') {
    plainStatus = 'AI Triage Complete — Under Review';
    progressPercent = caseItem.progress ?? 15;
    currentStageName = 'Government Review';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'current';
    currentAction = caseItem.currentAction || 'AI triage complete. Awaiting Government review and acceptance.';
    nextAction = caseItem.nextAction || 'Government desk acceptance and department routing.';
  } else if (st === 'GOVERNMENT_ACCEPTED' || st === 'ACCEPTED' || st === 'RISK_ASSESSED') {
    plainStatus = 'Accepted by Government';
    progressPercent = caseItem.progress ?? 25;
    currentStageName = 'Government Accepted';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'completed';
    stages[3].status = 'current';
    currentAction = caseItem.currentAction || 'Government accepted complaint. Proceeding to Officer Assignment.';
    nextAction = caseItem.nextAction || 'Department officer allocation and field order issuance.';
  } else if (st === 'OFFICER_ASSIGNED' || st === 'DEPARTMENT_ASSIGNED' || st === 'WAITING_FOR_OFFICER_ACCEPTANCE') {
    plainStatus = `Assigned to ${caseItem.assignedOfficerName || caseItem.assignedDepartment || 'Officer'}`;
    progressPercent = caseItem.progress ?? 30;
    currentStageName = 'Officer Assigned';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'completed';
    stages[3].status = 'completed';
    stages[4].status = 'current';
    currentAction = caseItem.currentAction || `Assigned to ${caseItem.assignedOfficerName || 'field officer'} (${caseItem.assignedDepartment}).`;
    nextAction = caseItem.nextAction || 'Officer acknowledging work order and mobilizing squad.';
  } else if (st === 'WORK_ACCEPTED' || st === 'ACTION_IN_PROGRESS' || st === 'IN_PROGRESS' || st === 'IN PROGRESS' || st === 'OPEN') {
    plainStatus = 'Field Work In Progress';
    progressPercent = caseItem.progress ?? 50;
    currentStageName = 'Field Action';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'completed';
    stages[3].status = 'completed';
    stages[4].status = 'current';
    currentAction = caseItem.currentAction || 'Field squad actively deployed on-site executing corrective action.';
    nextAction = caseItem.nextAction || 'Field repairs completion and upload of proof photos.';
  } else if (st === 'OFFICER_UPDATE') {
    plainStatus = 'Field Squad Update Logged';
    progressPercent = caseItem.progress ?? 65;
    currentStageName = 'Field Progress';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'completed';
    stages[3].status = 'completed';
    stages[4].status = 'current';
    currentAction = caseItem.currentAction || 'Officer provided intermediate field progress note.';
    nextAction = caseItem.nextAction || 'Completion of physical repairs and final work report submission.';
  } else if (st === 'BLOCKED' || st === 'BLOCKED / DELAYED') {
    plainStatus = 'Field Action Blocked / Delayed';
    progressPercent = caseItem.progress ?? 50;
    currentStageName = 'Action Delayed';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'completed';
    stages[3].status = 'completed';
    stages[4].status = 'current';
    currentAction = caseItem.currentAction || 'Work temporarily delayed due to site constraints or procurement.';
    nextAction = caseItem.nextAction || 'Resolving obstruction to resume field operations.';
  } else if (st === 'WORK_COMPLETED_REVIEW' || st === 'AWAITING_VERIFICATION' || st === 'AWAITING GOVERNMENT VERIFICATION' || st === 'PENDING_GOVERNMENT_APPROVAL') {
    plainStatus = 'Work Completed — Awaiting Government Approval';
    progressPercent = caseItem.progress ?? 80;
    currentStageName = 'Work Completed Review';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'completed';
    stages[3].status = 'completed';
    stages[4].status = 'completed';
    stages[5].status = 'current';
    currentAction = caseItem.currentAction || 'Officer completed field repairs. Work submitted for Government inspection.';
    nextAction = caseItem.nextAction || 'Government review and final resolution verification.';
  } else if (st === 'GOVERNMENT_REVIEW') {
    plainStatus = 'Government Reviewing Completed Work';
    progressPercent = caseItem.progress ?? 90;
    currentStageName = 'Government Review';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'completed';
    stages[3].status = 'completed';
    stages[4].status = 'completed';
    stages[5].status = 'current';
    currentAction = caseItem.currentAction || 'Government desk inspecting field repair evidence and quality metrics.';
    nextAction = caseItem.nextAction || 'Final sign-off and closure approval.';
  } else if (st === 'GOVERNMENT_APPROVED') {
    plainStatus = 'Government Approved — Final Verification';
    progressPercent = caseItem.progress ?? 95;
    currentStageName = 'Government Approved';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'completed';
    stages[3].status = 'completed';
    stages[4].status = 'completed';
    stages[5].status = 'completed';
    stages[6].status = 'current';
    currentAction = caseItem.currentAction || 'Government verified and approved completed repair work.';
    nextAction = caseItem.nextAction || 'Final case closure in municipal registry.';
  } else if (st === 'AI_VERIFIED' || st === 'SOLVED' || st === 'RESOLVED') {
    plainStatus = 'Resolved & Verified';
    progressPercent = 100;
    currentStageName = 'Resolved';
    stages.forEach(s => s.status = 'completed');
    currentAction = caseItem.currentAction || 'Repairs verified, inspected, and officially closed in municipal database.';
    nextAction = caseItem.nextAction || 'Case archived. Citizen satisfaction rating open.';
  } else if (st === 'CLOSED') {
    plainStatus = 'Closed';
    progressPercent = 100;
    currentStageName = 'Closed';
    stages.forEach(s => s.status = 'completed');
  } else if (st === 'REJECTED') {
    plainStatus = 'Rejected / Ineligible';
    progressPercent = 100;
    currentStageName = 'Closed';
  } else if (st === 'REVISION_REQUESTED' || st === 'REQUIRES_CORRECTION' || st === 'REWORK_REQUIRED') {
    plainStatus = 'Revision / Correction Requested';
    progressPercent = caseItem.progress ?? 50;
    currentStageName = 'Rework Required';
    stages[0].status = 'completed';
    stages[1].status = 'completed';
    stages[2].status = 'completed';
    stages[3].status = 'completed';
    stages[4].status = 'current';
  }

  // SLA details
  const isCompletedCase = (caseItem.status as string) === 'RESOLVED' || (caseItem.status as string) === 'Resolved' || (caseItem.status as string) === 'CLOSED';
  let slaFormatted = `${caseItem.slaHoursRemaining ?? 48}h remaining`;
  let slaIsUrgent = (caseItem.slaHoursRemaining ?? 48) <= 2 && !isCompletedCase;
  if (isCompletedCase) {
    slaFormatted = 'Completed within SLA';
    slaIsUrgent = false;
  } else if ((caseItem.slaHoursRemaining ?? 48) < 1) {
    const mins = Math.round((caseItem.slaHoursRemaining ?? 0) * 60);
    slaFormatted = `${Math.max(0, mins)} mins remaining`;
    slaIsUrgent = true;
  }

  const aiSummaryBrief = caseItem.systemRecommendedReason || caseItem.aiExplanation?.summary || `${severity.label} priority recommendation.`;
  const aiClassificationReason = caseItem.riskReason || caseItem.riskFactors?.[0] || caseItem.aiExplanation?.riskFactors?.[0] || 'Evaluated against municipal public safety criteria.';

  return {
    severity,
    plainStatus,
    progressPercent,
    currentStageName,
    currentAction,
    nextAction,
    slaFormatted,
    slaIsUrgent,
    lifecycleStages: stages,
    aiSummaryBrief,
    aiClassificationReason
  };
}
