import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  CivicCase, 
  CaseStatus, 
  RiskLevel, 
  PriorityLevel, 
  ProblemDuration, 
  CivicCategory, 
  DepartmentName, 
  TimelineEvent, 
  GovernmentNote,
  CivicDepartmentKey,
  CivicDepartmentInfo,
  DepartmentOfficer,
  OfficerWorkUpdate
} from '../types';
import { resolveCivicImageKey, getCivicImageUrl } from '../utils/imageAssets';
import { MOCK_CASES } from '../data/mockData';

const COMPLAINTS_COLLECTION = 'complaints';
const OFFICER_WORK_UPDATES_COLLECTION = 'officer_work_updates';
const OFFICERS_COLLECTION = 'officers';
const ASSIGNMENT_HISTORY_COLLECTION = 'assignment_history';

// OFFICIAL CIVICMIND DEPARTMENTS & 25+ PRE-REGISTERED MUNICIPAL OFFICERS
export const CIVIC_DEPARTMENTS_CONFIG: CivicDepartmentInfo[] = [
  {
    key: 'sanitation',
    name: 'Sanitation & Waste Management',
    description: 'Garbage, waste, dirty public areas, illegal dumping, sanitation issues',
    coverage: ['Garbage Overflow', 'Solid Waste Dumping', 'Commercial Trash', 'Sanitation Hazards'],
    officers: [
      { id: 'OFF-SAN-01', name: 'Ravi Kumar', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', currentAssignments: 3, status: 'Available', phone: '+91 98765 43210', designation: 'Senior Sanitation Inspector', email: 'ravi.kumar@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-SAN-02', name: 'Suresh Reddy', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', currentAssignments: 5, status: 'Busy', phone: '+91 98765 43211', designation: 'Waste Logistics Supervisor', email: 'suresh.reddy@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-SAN-03', name: 'Anita Sharma', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', currentAssignments: 2, status: 'Available', phone: '+91 98765 43212', designation: 'Urban Sanitation Officer', email: 'anita.sharma@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-SAN-04', name: 'Dinesh Gupta', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', currentAssignments: 1, status: 'Available', phone: '+91 98765 43213', designation: 'Zone Waste Marshal', email: 'dinesh.gupta@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-SAN-05', name: 'Pooja Varma', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', currentAssignments: 4, status: 'Available', phone: '+91 98765 43214', designation: 'Sanitation Quality Controller', email: 'pooja.varma@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-SAN-06', name: 'Imran Khan', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', currentAssignments: 6, status: 'Busy', phone: '+91 98765 43215', designation: 'Bulk Garbage Dispatcher', email: 'imran.khan@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-SAN-07', name: 'Kavita Meena', departmentKey: 'sanitation', departmentName: 'Sanitation & Waste Management', currentAssignments: 0, status: 'Available', phone: '+91 98765 43216', designation: 'Recycling & Disposal Lead', email: 'kavita.meena@civicmind.gov.in', is_active: true, pin: '2026' }
    ]
  },
  {
    key: 'water',
    name: 'Water Supply & Drainage',
    description: 'Water leakage, broken pipes, water supply, drainage blockage, sewage overflow',
    coverage: ['Water Pipeline Leakage', 'Broken Pipes', 'Drainage Blockage', 'Sewage Overflow', 'Contaminated Supply'],
    officers: [
      { id: 'OFF-WAT-01', name: 'Rajesh Varma', departmentKey: 'water', departmentName: 'Water Supply & Drainage', currentAssignments: 2, status: 'Available', phone: '+91 98765 43220', designation: 'Hydro-Engineering Lead', email: 'rajesh.varma@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-WAT-02', name: 'Priya Nair', departmentKey: 'water', departmentName: 'Water Supply & Drainage', currentAssignments: 4, status: 'Available', phone: '+91 98765 43221', designation: 'Drainage Systems Engineer', email: 'priya.nair@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-WAT-03', name: 'K. Venkat', departmentKey: 'water', departmentName: 'Water Supply & Drainage', currentAssignments: 1, status: 'Available', phone: '+91 98765 43222', designation: 'Water Pipeline Inspector', email: 'k.venkat@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-WAT-04', name: 'Amit Chawla', departmentKey: 'water', departmentName: 'Water Supply & Drainage', currentAssignments: 3, status: 'Available', phone: '+91 98765 43223', designation: 'Stormwater Sewerage Specialist', email: 'amit.chawla@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-WAT-05', name: 'Sneha Pillai', departmentKey: 'water', departmentName: 'Water Supply & Drainage', currentAssignments: 5, status: 'Busy', phone: '+91 98765 43224', designation: 'Urban Water Quality Supervisor', email: 'sneha.pillai@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-WAT-06', name: 'Mahesh Babu', departmentKey: 'water', departmentName: 'Water Supply & Drainage', currentAssignments: 2, status: 'Available', phone: '+91 98765 43225', designation: 'Emergency Leakage Squad Lead', email: 'mahesh.babu@civicmind.gov.in', is_active: true, pin: '2026' }
    ]
  },
  {
    key: 'roads',
    name: 'Roads & Infrastructure',
    description: 'Potholes, damaged roads, footpaths, public infrastructure',
    coverage: ['Potholes & Sinkholes', 'Damaged Asphalt', 'Cracked Footpaths', 'Bridge & Median Hazards'],
    officers: [
      { id: 'OFF-ROA-01', name: 'Vikram Singh', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', currentAssignments: 3, status: 'Available', phone: '+91 98765 43230', designation: 'Executive Road Engineer', email: 'vikram.singh@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-ROA-02', name: 'Mohd. Irfan', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', currentAssignments: 2, status: 'Available', phone: '+91 98765 43231', designation: 'Rapid Paving Supervisor', email: 'mohd.irfan@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-ROA-03', name: 'Sunita Patel', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', currentAssignments: 4, status: 'Available', phone: '+91 98765 43232', designation: 'Public Works Inspector', email: 'sunita.patel@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-ROA-04', name: 'Harish Joshi', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', currentAssignments: 1, status: 'Available', phone: '+91 98765 43233', designation: 'Asphalt & Pavement Engineer', email: 'harish.joshi@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-ROA-05', name: 'Divya Sundaram', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', currentAssignments: 5, status: 'Busy', phone: '+91 98765 43234', designation: 'Bridge & Footpath Inspector', email: 'divya.sundaram@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-ROA-06', name: 'Gurpreet Singh', departmentKey: 'roads', departmentName: 'Roads & Infrastructure', currentAssignments: 2, status: 'Available', phone: '+91 98765 43235', designation: 'Heavy Machinery Operations Lead', email: 'gurpreet.singh@civicmind.gov.in', is_active: true, pin: '2026' }
    ]
  },
  {
    key: 'electrical',
    name: 'Electrical & Streetlights',
    description: 'Streetlights, public electrical problems, electrical infrastructure',
    coverage: ['Dark Corridors & Outages', 'Transformer Sparking', 'Exposed Cables', 'Damaged Electric Poles'],
    officers: [
      { id: 'OFF-ELE-01', name: 'Manoj Deshmukh', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', currentAssignments: 2, status: 'Available', phone: '+91 98765 43240', designation: 'Chief Electrical Inspector', email: 'manoj.deshmukh@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-ELE-02', name: 'Deepa Rao', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', currentAssignments: 1, status: 'Available', phone: '+91 98765 43241', designation: 'Grid & Lighting Technician', email: 'deepa.rao@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-ELE-03', name: 'Arjun Patil', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', currentAssignments: 3, status: 'Available', phone: '+91 98765 43242', designation: 'Streetlight Field Lead', email: 'arjun.patil@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-ELE-04', name: 'Rohit Saxena', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', currentAssignments: 4, status: 'Available', phone: '+91 98765 43243', designation: 'High-Tension Transformer Specialist', email: 'rohit.saxena@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-ELE-05', name: 'Ananya Sengupta', departmentKey: 'electrical', departmentName: 'Electrical & Streetlights', currentAssignments: 1, status: 'Available', phone: '+91 98765 43244', designation: 'Energy Efficiency & LED Supervisor', email: 'ananya.sengupta@civicmind.gov.in', is_active: true, pin: '2026' }
    ]
  },
  {
    key: 'safety',
    name: 'Public Safety & Emergency',
    description: 'Dangerous public hazards, emergency situations, serious safety issues',
    coverage: ['Open Manholes', 'Structural Collapse Hazard', 'Toxic Leakage', 'Public Obstruction'],
    officers: [
      { id: 'OFF-SAF-01', name: 'Inspector R. K. Saxena', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', currentAssignments: 1, status: 'Available', phone: '+91 98765 43250', designation: 'Municipal Safety Marshal', email: 'rk.saxena@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-SAF-02', name: 'Captain Farhan Ali', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', currentAssignments: 2, status: 'Available', phone: '+91 98765 43251', designation: 'Emergency Operations Lead', email: 'farhan.ali@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-SAF-03', name: 'Meera Nambiar', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', currentAssignments: 1, status: 'Available', phone: '+91 98765 43252', designation: 'Crisis Response Officer', email: 'meera.nambiar@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-SAF-04', name: 'Sanjay Choudhary', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', currentAssignments: 3, status: 'Available', phone: '+91 98765 43253', designation: 'Disaster Mitigation Specialist', email: 'sanjay.choudhary@civicmind.gov.in', is_active: true, pin: '2026' },
      { id: 'OFF-SAF-05', name: 'Neha Kulkarni', departmentKey: 'safety', departmentName: 'Public Safety & Emergency', currentAssignments: 0, status: 'Available', phone: '+91 98765 43254', designation: 'Hazard Identification Inspector', email: 'neha.kulkarni@civicmind.gov.in', is_active: true, pin: '2026' }
    ]
  }
];

export function getAllOfficersList(): DepartmentOfficer[] {
  return CIVIC_DEPARTMENTS_CONFIG.flatMap(d => d.officers);
}

// DYNAMIC ACTIVE CASE LOAD CALCULATION
export function calculateOfficerActiveLoad(officerId: string, officerName: string, allCases: CivicCase[]): number {
  if (!allCases || allCases.length === 0) return 0;
  const cleanId = (officerId || '').trim().toLowerCase();
  const cleanName = (officerName || '').trim().toLowerCase();

  return allCases.filter(c => {
    const cOffId = (c.assignedOfficerId || '').trim().toLowerCase();
    const cOffName = (c.assignedOfficerName || '').trim().toLowerCase();
    const matchesOfficer = (cleanId && cOffId === cleanId) || (cleanName && cOffName === cleanName);
    if (!matchesOfficer) return false;

    const st = (c.status || '').toUpperCase();
    const isCompleted = st === 'SOLVED' || st === 'RESOLVED' || st === 'COMPLETED' || st === 'CLOSED' || st === 'REJECTED';
    return !isCompleted;
  }).length;
}

export function getWorkloadStatus(activeCount: number): 'Available' | 'Busy' | 'Heavy Workload' {
  if (activeCount <= 4) return 'Available';
  if (activeCount <= 7) return 'Busy';
  return 'Heavy Workload';
}

export function getDepartmentOfficersWithDynamicLoad(
  deptKey: CivicDepartmentKey | string,
  allCases?: CivicCase[]
): DepartmentOfficer[] {
  const dept = CIVIC_DEPARTMENTS_CONFIG.find(d => d.key === deptKey) || CIVIC_DEPARTMENTS_CONFIG[0];
  const cases = allCases || [];

  return dept.officers.map(officer => {
    const dynamicActiveCount = calculateOfficerActiveLoad(officer.id, officer.name, cases);
    const effectiveCount = cases.length > 0 ? dynamicActiveCount : officer.currentAssignments;
    return {
      ...officer,
      currentAssignments: effectiveCount,
      activeCases: effectiveCount,
      status: getWorkloadStatus(effectiveCount)
    };
  });
}

export function getAllOfficersWithDynamicLoad(allCases?: CivicCase[]): DepartmentOfficer[] {
  const allOfficers = getAllOfficersList();
  const cases = allCases || [];

  return allOfficers.map(officer => {
    const dynamicActiveCount = calculateOfficerActiveLoad(officer.id, officer.name, cases);
    const effectiveCount = cases.length > 0 ? dynamicActiveCount : officer.currentAssignments;
    return {
      ...officer,
      currentAssignments: effectiveCount,
      activeCases: effectiveCount,
      status: getWorkloadStatus(effectiveCount)
    };
  });
}

export function getDepartmentSuggestionByCategory(category: string, title?: string, description?: string): CivicDepartmentInfo {
  const text = `${category || ''} ${title || ''} ${description || ''}`.toLowerCase();
  if (text.includes('garbage') || text.includes('waste') || text.includes('dump') || text.includes('sanitation') || text.includes('trash') || text.includes('dirty') || text.includes('clean')) {
    return CIVIC_DEPARTMENTS_CONFIG[0];
  }
  if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('drain') || text.includes('sewage') || text.includes('flood') || text.includes('overflow')) {
    return CIVIC_DEPARTMENTS_CONFIG[1];
  }
  if (text.includes('road') || text.includes('pothole') || text.includes('asphalt') || text.includes('footpath') || text.includes('crater') || text.includes('tar') || text.includes('paving')) {
    return CIVIC_DEPARTMENTS_CONFIG[2];
  }
  if (text.includes('light') || text.includes('electric') || text.includes('wire') || text.includes('spark') || text.includes('power') || text.includes('pole') || text.includes('dark')) {
    return CIVIC_DEPARTMENTS_CONFIG[3];
  }
  return CIVIC_DEPARTMENTS_CONFIG[4];
}

// AI Risk Recommendation Engine
export function calculateSystemRecommendedRisk(
  category: CivicCategory | string,
  problemDuration: ProblemDuration | string,
  description: string,
  landmark?: string
): {
  recommendedRisk: RiskLevel;
  recommendedPriority: PriorityLevel;
  confidence: number;
  impactScore: number;
  riskFactors: string[];
  recommendedAction: string;
  summary: string;
} {
  const desc = (description || '').toLowerCase();
  const dur = (problemDuration || '').toLowerCase();
  const factors: string[] = [];

  let riskScore = 0; // 0 - 100

  // 1. Duration factor
  if (dur.includes('year') || dur.includes('more than 6 months')) {
    riskScore += 35;
    factors.push(`Chronic issue unresolved for ${problemDuration}`);
  } else if (dur.includes('3 months') || dur.includes('1–3 months') || dur.includes('month')) {
    riskScore += 25;
    factors.push(`Long-running issue reported for ${problemDuration}`);
  } else if (dur.includes('week') || dur.includes('4–7 days')) {
    riskScore += 15;
    factors.push(`Ongoing persistent defect (${problemDuration})`);
  } else {
    factors.push(`Recently emerged issue (${problemDuration})`);
  }

  // 2. Public safety & Category sensitivity
  if (desc.includes('school') || desc.includes('children') || (landmark && landmark.toLowerCase().includes('school'))) {
    riskScore += 30;
    factors.push('School zone proximity (<50m) posing risk to children');
  }
  if (desc.includes('hospital') || desc.includes('clinic') || desc.includes('emergency')) {
    riskScore += 30;
    factors.push('Hospital / Healthcare access corridor impact');
  }
  if (desc.includes('burst') || desc.includes('flood') || desc.includes('overflow') || desc.includes('crater') || desc.includes('hazard') || desc.includes('skid') || desc.includes('spark') || desc.includes('fire') || desc.includes('danger')) {
    riskScore += 25;
    factors.push('High-velocity active hazard / physical obstruction detected');
  }
  if (category === 'Water Supply' || category === 'Water Supply & Pipelines') {
    riskScore += 15;
    factors.push('Essential potable drinking water service disruption');
  } else if (category === 'Drainage' || category === 'Drainage & Sewage' || category === 'Garbage / Sanitation' || category === 'Health / Sanitation Hazard') {
    riskScore += 20;
    factors.push('Sanitation and public health contamination vulnerability');
  } else if (category === 'Road Damage' || category === 'Roads & Infrastructure') {
    riskScore += 15;
    factors.push('Vehicular accident & commuter collision hazard');
  } else if (category === 'Streetlights' || category === 'Electricity') {
    riskScore += 10;
    factors.push('Night-time pedestrian safety & dark corridor risk');
  }

  // Final Risk Classification
  let recommendedRisk: RiskLevel = 'MEDIUM';
  let recommendedPriority: PriorityLevel = 'P3';

  if (riskScore >= 60) {
    recommendedRisk = 'CRITICAL';
    recommendedPriority = 'P1';
  } else if (riskScore >= 40) {
    recommendedRisk = 'HIGH';
    recommendedPriority = 'P2';
  } else if (riskScore >= 20) {
    recommendedRisk = 'MEDIUM';
    recommendedPriority = 'P3';
  } else {
    recommendedRisk = 'LOW';
    recommendedPriority = 'P4';
  }

  const confidence = Math.min(98.5, Math.max(85.0, 88 + (riskScore % 10)));
  const impactScore = Number((Math.min(10, Math.max(3.0, (riskScore / 10)))).toFixed(1));

  let recommendedAction = '';
  if (recommendedRisk === 'CRITICAL') {
    recommendedAction = 'Immediate dispatch of Emergency Response Unit & high-priority escalation.';
  } else if (recommendedRisk === 'HIGH') {
    recommendedAction = 'Assign departmental field squad for site inspection within 24 hours.';
  } else if (recommendedRisk === 'MEDIUM') {
    recommendedAction = 'Standard operational scheduling for next maintenance cycle.';
  } else {
    recommendedAction = 'Queue for routine scheduled maintenance pass.';
  }

  return {
    recommendedRisk,
    recommendedPriority,
    confidence,
    impactScore,
    riskFactors: factors,
    recommendedAction,
    summary: `System identified ${category} incident with ${factors.join(', ')}.`
  };
}

// Generate human-friendly Unique Complaint ID
export function generateComplaintId(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `CL-${year}-${randomDigits}`;
}

// Convert Firestore document data to typed CivicCase
export function convertDocToCivicCase(id: string, data: any): CivicCase {
  const imageKey = data.imageKey || resolveCivicImageKey((data.category || '') + ' ' + (data.title || ''));
  const fallbackImg = getCivicImageUrl(imageKey);

  return {
    id: data.complaint_number || id,
    complaint_number: data.complaint_number || id,
    title: data.title || 'Civic Complaint',
    description: data.description || '',
    category: data.category || 'Other',
    subcategory: data.subcategory || '',
    priority: (data.priority || 'P3') as PriorityLevel,
    status: (data.status || 'SUBMITTED') as CaseStatus,
    progress: typeof data.progress === 'number' ? data.progress : (data.status === 'SOLVED' || data.status === 'RESOLVED' || data.status === 'CLOSED' ? 100 : (data.status === 'AWAITING_VERIFICATION' || data.status === 'AWAITING GOVERNMENT VERIFICATION' ? 90 : (data.status === 'IN_PROGRESS' || data.status === 'ACTION_IN_PROGRESS' ? 45 : (data.status === 'WORK_ACCEPTED' ? 20 : 0)))),
    assignedDepartmentKey: data.assignedDepartmentKey || data.assigned_department_key || '',
    assignedDepartmentId: data.assignedDepartmentId || data.assigned_department_id || '',
    assignedBy: data.assignedBy || data.assigned_by || '',
    assignmentTimestamp: data.assignmentTimestamp || data.assignment_timestamp || '',
    officerAcceptanceStatus: data.officerAcceptanceStatus || data.officer_acceptance_status || 'WAITING_FOR_OFFICER_ACCEPTANCE',
    officerUpdateNote: data.officerUpdateNote || data.officer_update_note || '',
    officerLastUpdate: data.officerLastUpdate || data.officer_last_update || '',
    expectedCompletionDate: data.expectedCompletionDate || data.expected_completion_date || '',
    isBlocked: Boolean(data.isBlocked || data.is_blocked),
    blockedReason: data.blockedReason || data.blocked_reason || '',
    resolutionReport: data.resolutionReport || data.resolution_report || undefined,
    location: {
      city: data.city || 'Hyderabad',
      area: data.area || '',
      colony: data.colony || '',
      address: data.street_address || (data.location?.address) || `${data.colony || ''}, ${data.area || ''}, ${data.city || ''}`,
      ward: data.ward || (data.location?.ward) || 'Ward 01',
      landmark: data.landmark || (data.location?.landmark) || '',
      postal_code: data.postal_code || '',
      lat: Number(data.latitude || data.location?.lat || 17.3850),
      lng: Number(data.longitude || data.location?.lng || 78.4867)
    },
    coordinates: {
      lat: Number(data.latitude || data.location?.lat || 17.3850),
      lng: Number(data.longitude || data.location?.lng || 78.4867)
    },
    imageKey: imageKey,
    imageUrl: data.imageUrl || data.image_url || fallbackImg,
    evidenceImage: data.evidenceImage || data.imageUrl || data.image_url || fallbackImg,
    resolvedImageUrl: data.resolvedImageUrl || data.resolved_image_url || '',
    resolutionNotes: data.resolutionNotes || data.resolution_notes || '',
    affectedPopulation: data.affectedPopulation || 'Estimated 500+ Residents',
    aiConfidence: Number(data.aiConfidence || data.ai_confidence || 92.4),
    impactScore: Number(data.impactScore || data.impact_score || 7.5),
    duplicateCount: Number(data.duplicateCount || data.duplicate_count || 0),
    assignedDepartment: data.assignedDepartment || data.assigned_department || 'General Municipal Administration',
    assignedOfficerName: data.assignedOfficerName || data.assigned_officer_name || '',
    assignedOfficerId: data.assignedOfficerId || data.assigned_officer_id || '',
    slaHoursRemaining: Number(data.slaHoursRemaining ?? data.sla_hours_remaining ?? 48),
    slaTotalHours: Number(data.slaTotalHours ?? data.sla_total_hours ?? 48),
    createdDate: data.createdDate || data.submitted_at || new Date().toISOString(),
    updatedDate: data.updatedDate || data.updated_at || new Date().toISOString(),
    citizenId: data.citizenId || data.citizen_id || 'CIT-GUEST',
    citizenName: data.citizenName || data.citizen_name || 'Anonymous Citizen',
    citizenPhone: data.citizenPhone || data.citizen_phone || '',
    citizenEmail: data.citizenEmail || data.citizen_email || '',

    problemDuration: (data.problemDuration || data.problem_duration || 'Today') as ProblemDuration,
    problemStartedDate: data.problemStartedDate || data.problem_started_date || '',
    systemRecommendedRisk: (data.systemRecommendedRisk || data.system_recommended_risk || 'MEDIUM') as RiskLevel,
    systemRecommendedReason: data.systemRecommendedReason || data.system_recommended_reason || '',
    finalGovernmentRisk: (data.finalGovernmentRisk || data.final_government_risk || 'NOT YET ASSESSED') as RiskLevel,
    riskReason: data.riskReason || data.risk_reason || '',
    riskFactors: Array.isArray(data.riskFactors || data.risk_factors) ? (data.riskFactors || data.risk_factors) : [],
    riskAssessedBy: data.riskAssessedBy || data.risk_assessed_by || '',
    riskAssessedAt: data.riskAssessedAt || data.risk_assessed_at || '',
    currentAction: data.currentAction || data.current_action || 'Pending initial triage review',
    nextAction: data.nextAction || data.next_action || 'Verification and risk assessment by municipal desk',

    submittedAt: data.submittedAt || data.submitted_at || '',
    acceptedAt: data.acceptedAt || data.accepted_at || '',
    resolvedAt: data.resolvedAt || data.resolved_at || '',
    closedAt: data.closedAt || data.closed_at || '',

    aiExplanation: data.aiExplanation || {
      summary: data.systemRecommendedReason || 'AI Automated initial analysis',
      riskFactors: Array.isArray(data.riskFactors) ? data.riskFactors : ['Duration factor', 'Location proximity'],
      recommendedAction: data.recommendedAction || 'Review and assign squad'
    },
    timeline: Array.isArray(data.timeline) ? data.timeline : [
      {
        id: `t-init-${id}`,
        title: 'Complaint Submitted',
        timestamp: new Date().toLocaleString(),
        description: 'Complaint registered by citizen and saved to municipal database.',
        status: 'completed',
        actor: 'Citizen Portal',
        public_visible: true
      }
    ],
    notes: Array.isArray(data.notes) ? data.notes : [],
    relatedCases: Array.isArray(data.relatedCases) ? data.relatedCases : [],
    isEscalated: Boolean(data.isEscalated || data.is_escalated)
  };
}

// Convert CivicCase to clean Firestore Document Schema
export function convertCivicCaseToDoc(caseItem: CivicCase): any {
  return {
    complaint_number: caseItem.id,
    citizen_id: caseItem.citizenId || 'CIT-GUEST',
    citizen_name: caseItem.citizenName || 'Citizen',
    citizen_phone: caseItem.citizenPhone || '',
    citizen_email: caseItem.citizenEmail || '',
    title: caseItem.title,
    description: caseItem.description,
    category: caseItem.category,
    subcategory: caseItem.subcategory || '',
    city: caseItem.location.city || 'Hyderabad',
    area: caseItem.location.area || '',
    colony: caseItem.location.colony || '',
    ward: caseItem.location.ward || 'Ward 01',
    street_address: caseItem.location.address || '',
    landmark: caseItem.location.landmark || '',
    postal_code: caseItem.location.postal_code || '',
    latitude: caseItem.location.lat,
    longitude: caseItem.location.lng,
    problem_duration: caseItem.problemDuration || 'Today',
    problem_started_date: caseItem.problemStartedDate || '',
    status: caseItem.status,
    priority: caseItem.priority,
    progress: typeof caseItem.progress === 'number' ? caseItem.progress : 0,
    assigned_department_key: caseItem.assignedDepartmentKey || '',
    assigned_department_id: caseItem.assignedDepartmentId || '',
    assigned_by: caseItem.assignedBy || '',
    assignment_timestamp: caseItem.assignmentTimestamp || '',
    officer_acceptance_status: caseItem.officerAcceptanceStatus || 'WAITING_FOR_OFFICER_ACCEPTANCE',
    officer_update_note: caseItem.officerUpdateNote || '',
    officer_last_update: caseItem.officerLastUpdate || '',
    expected_completion_date: caseItem.expectedCompletionDate || '',
    is_blocked: Boolean(caseItem.isBlocked),
    blocked_reason: caseItem.blockedReason || '',
    resolution_report: caseItem.resolutionReport || null,
    system_recommended_risk: caseItem.systemRecommendedRisk || 'MEDIUM',
    system_recommended_reason: caseItem.systemRecommendedReason || '',
    final_government_risk: caseItem.finalGovernmentRisk || 'NOT YET ASSESSED',
    risk_reason: caseItem.riskReason || '',
    risk_factors: caseItem.riskFactors || [],
    risk_assessed_by: caseItem.riskAssessedBy || '',
    risk_assessed_at: caseItem.riskAssessedAt || '',
    assigned_department: caseItem.assignedDepartment || 'General Municipal Administration',
    assigned_officer_name: caseItem.assignedOfficerName || '',
    assigned_officer_id: caseItem.assignedOfficerId || '',
    current_action: caseItem.currentAction || '',
    next_action: caseItem.nextAction || '',
    sla_hours_remaining: caseItem.slaHoursRemaining ?? 48,
    sla_total_hours: caseItem.slaTotalHours ?? 48,
    imageUrl: caseItem.imageUrl || '',
    image_url: caseItem.imageUrl || '',
    resolved_image_url: caseItem.resolvedImageUrl || '',
    resolution_notes: caseItem.resolutionNotes || '',
    submitted_at: caseItem.submittedAt || caseItem.createdDate || new Date().toISOString(),
    accepted_at: caseItem.acceptedAt || '',
    resolved_at: caseItem.resolvedAt || '',
    closed_at: caseItem.closedAt || '',
    created_at: caseItem.createdDate || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    timeline: caseItem.timeline || [],
    notes: caseItem.notes || [],
    is_escalated: Boolean(caseItem.isEscalated)
  };
}

// 1. REAL-TIME SUBSCRIPTION TO COMPLAINTS
export function subscribeToComplaints(
  onUpdate: (complaints: CivicCase[]) => void,
  onError?: (error: any) => void
): () => void {
  try {
    const colRef = collection(db, COMPLAINTS_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: CivicCase[] = [];
        snapshot.forEach((docSnap) => {
          list.push(convertDocToCivicCase(docSnap.id, docSnap.data()));
        });
        // Sort newest first
        list.sort((a, b) => {
          const dateA = new Date(a.createdDate).getTime() || 0;
          const dateB = new Date(b.createdDate).getTime() || 0;
          return dateB - dateA;
        });
        console.log(`[Firestore] Real-time complaints update: ${list.length} complaint(s) synced from collection '${COMPLAINTS_COLLECTION}'`);
        onUpdate(list);
      },
      (err) => {
        console.error('Firestore complaints subscription error:', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Error starting snapshot listener:', err);
    return () => {};
  }
}

// Helper to seed initial benchmark cases if the database collection is completely empty
export async function seedComplaintsIfEmpty(): Promise<void> {
  try {
    const colRef = collection(db, COMPLAINTS_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log('[Firestore] Database complaints collection is empty. Seeding initial benchmark cases...');
      for (const c of MOCK_CASES) {
        const docRef = doc(db, COMPLAINTS_COLLECTION, c.id);
        await setDoc(docRef, convertCivicCaseToDoc(c));
      }
      console.log(`[Firestore] Successfully seeded ${MOCK_CASES.length} initial benchmark cases into Firestore.`);
    } else {
      console.log(`[Firestore] Database already has ${snapshot.size} complaint records.`);
    }
  } catch (err) {
    console.warn('[Firestore] Note on seeding database:', err);
  }
}

// 2. CREATE NEW COMPLAINT IN FIRESTORE
export interface CreateComplaintInput {
  fullName: string;
  phone: string;
  email?: string;
  citizenId?: string;

  cityName: string;
  areaName: string;
  colonyName: string;
  wardNumber?: string;
  streetAddress?: string;
  landmark?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;

  title: string;
  category: CivicCategory;
  subcategory?: string;
  description: string;
  dateFirstNoticed?: string;
  imageUrl?: string;
  imageKey?: string;

  problemDuration: ProblemDuration;
  problemStartedDate?: string;
}

export async function createComplaintInDb(input: CreateComplaintInput): Promise<CivicCase> {
  const complaintId = generateComplaintId();
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Calculate AI recommendation based on real inputs
  const aiTriage = calculateSystemRecommendedRisk(
    input.category,
    input.problemDuration,
    input.description,
    input.landmark
  );

  const fullAddress = input.streetAddress 
    ? `${input.streetAddress}, ${input.colonyName}, ${input.areaName}, ${input.cityName}`
    : `${input.colonyName}, ${input.areaName}, ${input.cityName}`;

  const resolvedImageKey = resolveCivicImageKey(input.category + ' ' + input.title);
  const photoUrl = input.imageUrl || getCivicImageUrl(resolvedImageKey);

  const initialTimeline: TimelineEvent[] = [
    {
      id: `t-sub-${Date.now()}`,
      title: 'Complaint Submitted',
      timestamp: formattedDate,
      description: `Complaint registered by ${input.fullName} via Citizen Portal. Problem duration reported as: ${input.problemDuration}.`,
      status: 'completed',
      actor: input.fullName,
      public_visible: true
    },
    {
      id: `t-ai-${Date.now()}`,
      title: 'AI Analysis & Initial Triage',
      timestamp: formattedDate,
      description: `System recommendation: ${aiTriage.recommendedRisk}. Factors: ${aiTriage.riskFactors.join('; ')}. Awaiting Government review.`,
      status: 'completed',
      actor: 'CivicMind AI Triage',
      public_visible: true
    }
  ];

  const newCase: CivicCase = {
    id: complaintId,
    complaint_number: complaintId,
    title: input.title,
    description: input.description,
    category: input.category,
    subcategory: input.subcategory || '',
    priority: aiTriage.recommendedPriority,
    status: 'SUBMITTED',
    location: {
      city: input.cityName,
      area: input.areaName,
      colony: input.colonyName,
      address: fullAddress,
      ward: input.wardNumber || 'Ward 01 (Central Zone)',
      landmark: input.landmark || '',
      postal_code: input.postalCode || '',
      lat: input.latitude || 17.3850,
      lng: input.longitude || 78.4867
    },
    coordinates: {
      lat: input.latitude || 17.3850,
      lng: input.longitude || 78.4867
    },
    imageKey: resolvedImageKey,
    imageUrl: photoUrl,
    evidenceImage: photoUrl,
    affectedPopulation: 'Estimated 1,000+ residents',
    aiConfidence: aiTriage.confidence,
    impactScore: aiTriage.impactScore,
    duplicateCount: 0,
    assignedDepartment: 'General Municipal Administration',
    slaHoursRemaining: 48,
    slaTotalHours: 48,
    createdDate: now.toISOString(),
    updatedDate: now.toISOString(),
    citizenId: input.citizenId || `CIT-${Math.floor(10000 + Math.random() * 90000)}`,
    citizenName: input.fullName,
    citizenPhone: input.phone,
    citizenEmail: input.email || '',

    problemDuration: input.problemDuration,
    problemStartedDate: input.problemStartedDate || '',
    systemRecommendedRisk: aiTriage.recommendedRisk,
    systemRecommendedReason: aiTriage.summary,
    finalGovernmentRisk: 'NOT YET ASSESSED',
    riskFactors: aiTriage.riskFactors,
    currentAction: 'Complaint submitted to municipal queue',
    nextAction: 'Under review by Government Officer',

    submittedAt: now.toISOString(),

    aiExplanation: {
      summary: aiTriage.summary,
      riskFactors: aiTriage.riskFactors,
      recommendedAction: aiTriage.recommendedAction
    },
    timeline: initialTimeline,
    notes: [],
    relatedCases: []
  };

  const docData = convertCivicCaseToDoc(newCase);
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  await setDoc(docRef, docData);

  console.log(`[Database] ========================================`);
  console.log(`[Database] DATABASE INSERT SUCCESS`);
  console.log(`[Database] Complaint ID: ${complaintId}`);
  console.log(`[Database] Database Record ID: ${complaintId}`);
  console.log(`[Database] Citizen: ${input.fullName} (${input.phone})`);
  console.log(`[Database] Category: ${input.category} | Colony: ${input.colonyName}`);
  console.log(`[Database] Duration: ${input.problemDuration}`);
  console.log(`[Database] Document path: ${COMPLAINTS_COLLECTION}/${complaintId}`);
  console.log(`[Database] ========================================`);

  return newCase;
}

// 3. GOVERNMENT: ACCEPT COMPLAINT
export async function acceptComplaintInDb(
  complaintId: string, 
  officerName: string = 'Municipal Officer',
  notes?: string
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-acc-${Date.now()}`,
      title: 'Complaint Accepted by Government',
      timestamp: formattedDate,
      description: notes || `Complaint reviewed and accepted for official municipal processing by ${officerName}.`,
      status: 'completed',
      actor: officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: 'ACCEPTED',
    accepted_at: now.toISOString(),
    updated_at: now.toISOString(),
    current_action: `Accepted by ${officerName}. Proceeding to Risk & Department Assignment.`,
    next_action: 'Assigning responsible department squad and priority window.',
    timeline: updatedTimeline
  });
}

// 4. GOVERNMENT: REJECT COMPLAINT
export async function rejectComplaintInDb(
  complaintId: string, 
  reason: string,
  officerName: string = 'Municipal Officer'
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-rej-${Date.now()}`,
      title: 'Complaint Rejected / Closed',
      timestamp: formattedDate,
      description: `Reason: ${reason}. Action taken by ${officerName}.`,
      status: 'completed',
      actor: officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: 'REJECTED',
    closed_at: now.toISOString(),
    updated_at: now.toISOString(),
    current_action: `Complaint closed as rejected: ${reason}`,
    next_action: 'No further action required.',
    timeline: updatedTimeline
  });
}

// 5. GOVERNMENT: REQUEST MORE INFORMATION
export async function requestMoreInfoInDb(
  complaintId: string,
  queryText: string,
  officerName: string = 'Municipal Officer'
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-info-${Date.now()}`,
      title: 'Additional Information Requested',
      timestamp: formattedDate,
      description: `${officerName} requested clarifications: "${queryText}". Citizen notified.`,
      status: 'current',
      actor: officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: 'UNDER_REVIEW',
    updated_at: now.toISOString(),
    current_action: `Awaiting citizen clarification on: "${queryText}"`,
    next_action: 'Citizen to submit additional photos or details.',
    timeline: updatedTimeline
  });
}

// 6. GOVERNMENT: ASSIGN FINAL RISK LEVEL
export async function assignRiskLevelInDb(
  complaintId: string,
  riskLevel: RiskLevel,
  riskReason: string,
  priority: PriorityLevel,
  officerName: string = 'Operations Director'
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-risk-${Date.now()}`,
      title: `Risk Level Confirmed: ${riskLevel}`,
      timestamp: formattedDate,
      description: `Official Risk Level evaluated as ${riskLevel} (${priority} Priority) by ${officerName}. Assessment reason: ${riskReason || 'Operational review completed'}.`,
      status: 'completed',
      actor: officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  // Adjust SLA hours based on confirmed risk
  let slaHours = 48;
  if (riskLevel === 'CRITICAL') slaHours = 12;
  else if (riskLevel === 'HIGH') slaHours = 24;
  else if (riskLevel === 'MEDIUM') slaHours = 48;
  else if (riskLevel === 'LOW') slaHours = 72;

  await updateDoc(docRef, {
    final_government_risk: riskLevel,
    risk_reason: riskReason,
    priority: priority,
    risk_assessed_by: officerName,
    risk_assessed_at: now.toISOString(),
    status: existing.status === 'SUBMITTED' ? 'RISK_ASSESSED' : existing.status,
    sla_total_hours: slaHours,
    sla_hours_remaining: slaHours,
    updated_at: now.toISOString(),
    current_action: `Risk verified as ${riskLevel} (${priority}). Routing to squad.`,
    timeline: updatedTimeline
  });
}

// 7. GOVERNMENT: ASSIGN RESPONSIBLE DEPARTMENT & SQUAD
export async function assignDepartmentInDb(
  complaintId: string,
  department: DepartmentName | string,
  officerName: string = 'Municipal Officer',
  squadTeam?: string
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const assignedSquad = squadTeam || 'Quick Response Team #1';

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-dept-${Date.now()}`,
      title: `Assigned to ${department}`,
      timestamp: formattedDate,
      description: `Work order dispatched to ${department} (${assignedSquad}) by ${officerName}.`,
      status: 'completed',
      actor: officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    assigned_department: department,
    assigned_officer_name: assignedSquad,
    status: 'DEPARTMENT_ASSIGNED',
    updated_at: now.toISOString(),
    current_action: `Assigned to ${department} (${assignedSquad})`,
    next_action: 'Field inspection and initial repairs deployment.',
    timeline: updatedTimeline
  });
}

// 8. GOVERNMENT / SQUAD: UPDATE WORK PROGRESS
export async function updateWorkProgressInDb(
  complaintId: string,
  newStatus: CaseStatus,
  currentAction: string,
  nextAction: string,
  updatedBy: string = 'Department Squad',
  publicDescription?: string
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-prog-${Date.now()}`,
      title: `Progress Update: ${newStatus}`,
      timestamp: formattedDate,
      description: publicDescription || currentAction || 'Field work progress updated.',
      status: newStatus === 'RESOLVED' || newStatus === 'CLOSED' ? 'completed' : 'current',
      actor: updatedBy,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: newStatus,
    current_action: currentAction,
    next_action: nextAction,
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });
}

// 9. GOVERNMENT: MARK COMPLAINT RESOLVED
export async function resolveComplaintInDb(
  complaintId: string,
  resolutionNotes: string = 'Issue successfully resolved and verified on site.',
  resolvedImageUrl?: string,
  officerName: string = 'Field Inspection Lead'
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const defaultResolvedImg = 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80';

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-res-${Date.now()}`,
      title: 'Complaint Marked Resolved',
      timestamp: formattedDate,
      description: resolutionNotes || 'Repairs completed and verified. Photographic evidence uploaded.',
      status: 'completed',
      actor: officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: 'RESOLVED',
    resolved_at: now.toISOString(),
    resolved_image_url: resolvedImageUrl || defaultResolvedImg,
    resolution_notes: resolutionNotes,
    sla_hours_remaining: 0,
    current_action: 'Resolution completed and verified on site.',
    next_action: 'Citizen feedback and final administrative closure.',
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });
}

// 10. GOVERNMENT: ADD INTERNAL OR PUBLIC NOTE
export async function addGovernmentNoteInDb(
  complaintId: string,
  noteText: string,
  createdBy: string = 'Government Officer',
  visibility: 'INTERNAL' | 'PUBLIC' = 'INTERNAL'
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const newNote: GovernmentNote = {
    id: `note-${Date.now()}`,
    note: noteText,
    created_by: createdBy,
    created_at: new Date().toISOString(),
    visibility
  };

  const updatedNotes = [newNote, ...(existing.notes || [])];
  let updatedTimeline = existing.timeline;

  if (visibility === 'PUBLIC') {
    const formattedDate = new Date().toLocaleString('en-US', { hour12: true });
    updatedTimeline = [
      {
        id: `t-note-${Date.now()}`,
        title: 'Public Officer Note',
        timestamp: formattedDate,
        description: noteText,
        status: 'completed',
        actor: createdBy,
        public_visible: true
      },
      ...existing.timeline
    ];
  }

  await updateDoc(docRef, {
    notes: updatedNotes,
    timeline: updatedTimeline,
    updated_at: new Date().toISOString()
  });
}

// 11. GOVERNMENT: FULL CONFIRM & ASSIGN OFFICER (ATOMIC ASSIGNMENT LIFECYCLE)
export async function confirmAndAssignOfficerInDb(params: {
  complaintId: string;
  riskLevel: RiskLevel;
  riskReason: string;
  priority?: PriorityLevel;
  departmentName: string;
  departmentKey: string;
  officerId: string;
  officerName: string;
  officerPhone?: string;
  assignedBy?: string;
}): Promise<CivicCase> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, params.complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(params.complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });

  const assignedBy = params.assignedBy || 'Government Admin';
  const calculatedPriority: PriorityLevel = 
    params.priority || 
    (params.riskLevel === 'CRITICAL' ? 'P1' : params.riskLevel === 'HIGH' ? 'P2' : params.riskLevel === 'MEDIUM' ? 'P3' : 'P4');

  let slaHours = 48;
  if (params.riskLevel === 'CRITICAL') slaHours = 12;
  else if (params.riskLevel === 'HIGH') slaHours = 24;
  else if (params.riskLevel === 'MEDIUM') slaHours = 48;
  else if (params.riskLevel === 'LOW') slaHours = 72;

  const assignmentTimelineEvent: TimelineEvent = {
    id: `t-assign-${Date.now()}`,
    title: `Assigned to ${params.officerName} (${params.departmentName})`,
    timestamp: formattedDate,
    description: `${assignedBy} accepted complaint & confirmed assignment. Risk Level: ${params.riskLevel}, Department: ${params.departmentName}, Assigned Officer: ${params.officerName}, Status: OFFICER ASSIGNED`,
    status: 'completed',
    actor: assignedBy,
    public_visible: true
  };

  const updatedTimeline = [assignmentTimelineEvent, ...existing.timeline];

  const updatePayload = {
    final_government_risk: params.riskLevel,
    risk_reason: params.riskReason || `Assessed as ${params.riskLevel} during triage assignment.`,
    priority: calculatedPriority,
    risk_assessed_by: assignedBy,
    risk_assessed_at: now.toISOString(),
    assigned_department: params.departmentName,
    assigned_department_key: params.departmentKey,
    assigned_officer_id: params.officerId,
    assigned_officer_name: params.officerName,
    assigned_by: assignedBy,
    assignment_timestamp: now.toISOString(),
    officer_acceptance_status: 'WAITING_FOR_OFFICER_ACCEPTANCE',
    status: 'OFFICER_ASSIGNED',
    progress: 0,
    sla_total_hours: slaHours,
    sla_hours_remaining: slaHours,
    current_action: `Assigned to ${params.officerName} (${params.departmentName})`,
    next_action: 'Officer acceptance & field dispatch',
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  };

  await updateDoc(docRef, updatePayload);

  return {
    ...existing,
    finalGovernmentRisk: params.riskLevel,
    riskReason: params.riskReason,
    priority: calculatedPriority,
    riskAssessedBy: assignedBy,
    riskAssessedAt: now.toISOString(),
    assignedDepartment: params.departmentName,
    assignedDepartmentKey: params.departmentKey,
    assignedOfficerId: params.officerId,
    assignedOfficerName: params.officerName,
    assignedBy,
    assignmentTimestamp: now.toISOString(),
    officerAcceptanceStatus: 'WAITING_FOR_OFFICER_ACCEPTANCE',
    status: 'OFFICER_ASSIGNED',
    progress: 0,
    slaTotalHours: slaHours,
    slaHoursRemaining: slaHours,
    currentAction: `Assigned to ${params.officerName} (${params.departmentName})`,
    nextAction: 'Officer acceptance & field dispatch',
    updatedDate: now.toISOString(),
    timeline: updatedTimeline
  };
}

// 12. OFFICER: ACCEPT ASSIGNMENT
export async function officerAcceptAssignmentInDb(
  complaintId: string,
  officerName: string
): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-off-acc-${Date.now()}`,
      title: 'Officer Accepted Assignment',
      timestamp: formattedDate,
      description: `${officerName} accepted the work order and scheduled field dispatch.`,
      status: 'completed',
      actor: officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: 'WORK_ACCEPTED',
    officer_acceptance_status: 'ACCEPTED',
    progress: 15,
    current_action: `${officerName} accepted task and mobilized equipment.`,
    next_action: 'On-site execution and repairs underway.',
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });
}

// 13. OFFICER: UPDATE FIELD PROGRESS & BLOCKS
export async function officerUpdateProgressInDb(params: {
  complaintId: string;
  progress: number;
  status?: CaseStatus;
  currentAction: string;
  nextAction: string;
  isBlocked?: boolean;
  blockedReason?: string;
  officerName: string;
}): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, params.complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(params.complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const effectiveStatus: CaseStatus = params.isBlocked 
    ? 'BLOCKED / DELAYED' 
    : (params.progress >= 100 ? 'AWAITING_VERIFICATION' : 'IN_PROGRESS');

  const timelineTitle = params.isBlocked 
    ? `Task Blocked / Delayed (${params.progress}%)` 
    : `Field Progress: ${params.progress}%`;

  const timelineDesc = params.isBlocked 
    ? `Delay Reason: ${params.blockedReason || 'Inclement conditions or parts shortage'}. Reported by ${params.officerName}.`
    : (params.currentAction || `Work in progress (${params.progress}% completed) by ${params.officerName}`);

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-off-upd-${Date.now()}`,
      title: timelineTitle,
      timestamp: formattedDate,
      description: timelineDesc,
      status: 'current',
      actor: params.officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: effectiveStatus,
    progress: params.progress,
    current_action: params.currentAction,
    next_action: params.nextAction,
    is_blocked: Boolean(params.isBlocked),
    blocked_reason: params.blockedReason || '',
    officer_update_note: params.currentAction,
    officer_last_update: now.toISOString(),
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });
}

// 14. OFFICER: SUBMIT RESOLUTION REPORT FOR VERIFICATION
export async function officerSubmitResolutionReportInDb(params: {
  complaintId: string;
  summary: string;
  actionTaken: string;
  afterPhotoUrl?: string;
  officerName: string;
}): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, params.complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(params.complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });

  const defaultAfterImg = 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80';
  const finalAfterPhoto = params.afterPhotoUrl || defaultAfterImg;

  const resolutionReport = {
    summary: params.summary,
    actionTaken: params.actionTaken,
    completedAt: now.toISOString(),
    afterPhotoUrl: finalAfterPhoto,
    verifiedByGovernment: false
  };

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-off-res-${Date.now()}`,
      title: 'Resolution Report Submitted by Officer',
      timestamp: formattedDate,
      description: `Repairs concluded. ${params.actionTaken}. Submitted for Government administrative verification.`,
      status: 'completed',
      actor: params.officerName,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: 'AWAITING GOVERNMENT VERIFICATION',
    progress: 95,
    resolution_report: resolutionReport,
    resolved_image_url: finalAfterPhoto,
    current_action: 'Work completed by squad. Awaiting Government Desk verification.',
    next_action: 'Government officer audit and case closeout.',
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });
}

// 15. GOVERNMENT: VERIFY RESOLUTION AND MARK SOLVED
export async function governmentVerifyAndSolveInDb(params: {
  complaintId: string;
  verificationNotes?: string;
  verifierName?: string;
}): Promise<void> {
  const docRef = doc(db, COMPLAINTS_COLLECTION, params.complaintId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Complaint not found in database');

  const existing = convertDocToCivicCase(params.complaintId, snap.data());
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', { hour12: true });
  const verifier = params.verifierName || 'Government Admin';

  const updatedResolutionReport = {
    ...(existing.resolutionReport || {
      summary: 'Repairs completed and verified.',
      actionTaken: 'Field squad addressed incident.',
      completedAt: now.toISOString()
    }),
    verifiedByGovernment: true,
    verificationNotes: params.verificationNotes || 'Inspection report and photographic proof verified.'
  };

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-gov-verify-${Date.now()}`,
      title: 'Case Verified & SOLVED',
      timestamp: formattedDate,
      description: `Government Admin (${verifier}) inspected resolution proof and marked ticket SOLVED. Citizen SMS dispatch completed.`,
      status: 'completed',
      actor: verifier,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(docRef, {
    status: 'SOLVED',
    progress: 100,
    resolved_at: now.toISOString(),
    resolution_report: updatedResolutionReport,
    resolution_notes: params.verificationNotes || 'Issue solved and verified by Municipal Government.',
    sla_hours_remaining: 0,
    current_action: 'Issue resolved & verified on-site. Citizen notified.',
    next_action: 'Case closed in municipal registry.',
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });
}

// 16. OFFICER: SUBMIT WORK UPDATE FORM (STORES IN OFFICER_WORK_UPDATES & COMPLAINTS)
export interface OfficerWorkUpdateInput {
  complaintId: string;
  officerId: string;
  officerName: string;
  departmentName: string;
  progressPercentage: number;
  workStatus: 'IN_PROGRESS' | 'BLOCKED' | 'WORK_COMPLETED';
  workDescription: string;
  nextAction: string;
  issuesEncountered?: string;
  estimatedCompletion?: string;
  materialsUsed?: string;
  proofImageUrl?: string;
}

export async function submitOfficerWorkUpdateInDb(input: OfficerWorkUpdateInput): Promise<OfficerWorkUpdate> {
  const updateId = `UPD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const newUpdateRecord: OfficerWorkUpdate = {
    update_id: updateId,
    complaint_id: input.complaintId,
    officer_id: input.officerId,
    officer_name: input.officerName,
    department_name: input.departmentName,
    progress_percentage: input.progressPercentage,
    work_status: input.workStatus,
    work_description: input.workDescription,
    next_action: input.nextAction,
    issues_encountered: input.issuesEncountered || '',
    estimated_completion: input.estimatedCompletion || '',
    materials_used: input.materialsUsed || '',
    proof_image_url: input.proofImageUrl || '',
    submitted_at: now.toISOString(),
    government_review_status: 'PENDING_APPROVAL'
  };

  // 1. Save to officer_work_updates collection
  try {
    const updateDocRef = doc(db, OFFICER_WORK_UPDATES_COLLECTION, updateId);
    await setDoc(updateDocRef, newUpdateRecord);
  } catch (err) {
    console.warn('[Firestore] Note saving to officer_work_updates collection:', err);
  }

  // 2. Atomically update the complaint in complaints collection
  const complaintDocRef = doc(db, COMPLAINTS_COLLECTION, input.complaintId);
  const snap = await getDoc(complaintDocRef);
  if (snap.exists()) {
    const existing = convertDocToCivicCase(input.complaintId, snap.data());

    // Determine effective status for complaint
    // Crucial rule: Officer submission of WORK_COMPLETED puts complaint in 'AWAITING GOVERNMENT VERIFICATION'
    let newComplaintStatus: CaseStatus = 'IN_PROGRESS';
    let timelineTitle = `Officer Work Update (${input.progressPercentage}%)`;
    let timelineDesc = `${input.workDescription}. Next: ${input.nextAction}`;

    if (input.workStatus === 'WORK_COMPLETED') {
      newComplaintStatus = 'AWAITING GOVERNMENT VERIFICATION';
      timelineTitle = 'Work Completed — Awaiting Government Verification';
      timelineDesc = `Repairs concluded by ${input.officerName}. Work Report & proof submitted for official Government Admin approval.`;
    } else if (input.workStatus === 'BLOCKED') {
      newComplaintStatus = 'BLOCKED / DELAYED';
      timelineTitle = `Task Blocked / Delayed (${input.progressPercentage}%)`;
      timelineDesc = `Issue encountered: ${input.issuesEncountered || 'Bottleneck reported'}. Officer: ${input.officerName}.`;
    } else {
      newComplaintStatus = 'IN_PROGRESS';
      timelineTitle = `Field Progress Updated (${input.progressPercentage}%)`;
    }

    const updatedTimeline: TimelineEvent[] = [
      {
        id: `t-off-upd-${Date.now()}`,
        title: timelineTitle,
        timestamp: formattedDate,
        description: timelineDesc,
        status: input.workStatus === 'WORK_COMPLETED' ? 'completed' : 'current',
        actor: input.officerName,
        public_visible: true
      },
      ...existing.timeline
    ];

    const resolutionReportObj = input.workStatus === 'WORK_COMPLETED' || input.proofImageUrl ? {
      summary: input.workDescription,
      actionTaken: input.workDescription,
      completedAt: now.toISOString(),
      afterPhotoUrl: input.proofImageUrl || existing.resolvedImageUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
      verifiedByGovernment: false
    } : existing.resolutionReport || null;

    await updateDoc(complaintDocRef, {
      status: newComplaintStatus,
      progress: input.progressPercentage,
      current_action: input.workDescription,
      next_action: input.nextAction,
      is_blocked: input.workStatus === 'BLOCKED',
      blocked_reason: input.issuesEncountered || '',
      officer_update_note: input.workDescription,
      officer_last_update: now.toISOString(),
      expected_completion_date: input.estimatedCompletion || existing.expectedCompletionDate || '',
      resolved_image_url: input.proofImageUrl || existing.resolvedImageUrl || '',
      resolution_report: resolutionReportObj,
      updated_at: now.toISOString(),
      timeline: updatedTimeline
    });
  }

  console.log(`[OfficerService] Work update ${updateId} submitted successfully for complaint ${input.complaintId}`);
  return newUpdateRecord;
}

// 17. REAL-TIME SUBSCRIPTION TO OFFICER WORK UPDATES
export function subscribeToOfficerWorkUpdates(
  onUpdate: (updates: OfficerWorkUpdate[]) => void,
  onError?: (error: any) => void
): () => void {
  try {
    const colRef = collection(db, OFFICER_WORK_UPDATES_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: OfficerWorkUpdate[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            update_id: d.update_id || docSnap.id,
            complaint_id: d.complaint_id,
            officer_id: d.officer_id || '',
            officer_name: d.officer_name || 'Officer',
            department_name: d.department_name || '',
            progress_percentage: typeof d.progress_percentage === 'number' ? d.progress_percentage : 0,
            work_status: d.work_status || 'IN_PROGRESS',
            work_description: d.work_description || '',
            next_action: d.next_action || '',
            issues_encountered: d.issues_encountered || '',
            estimated_completion: d.estimated_completion || '',
            materials_used: d.materials_used || '',
            proof_image_url: d.proof_image_url || '',
            submitted_at: d.submitted_at || new Date().toISOString(),
            government_review_status: d.government_review_status || 'PENDING_APPROVAL',
            government_reviewed_by: d.government_reviewed_by || '',
            government_reviewed_at: d.government_reviewed_at || '',
            government_feedback: d.government_feedback || ''
          });
        });
        // Sort newest first
        list.sort((a, b) => {
          const dateA = new Date(a.submitted_at).getTime() || 0;
          const dateB = new Date(b.submitted_at).getTime() || 0;
          return dateB - dateA;
        });
        onUpdate(list);
      },
      (err) => {
        console.error('Firestore officer work updates subscription error:', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Error starting officer updates listener:', err);
    return () => {};
  }
}

// 18. GOVERNMENT: APPROVE OFFICER WORK UPDATE
export async function governmentApproveWorkUpdateInDb(params: {
  updateId: string;
  complaintId: string;
  verifierName?: string;
  approvalNotes?: string;
  isFinalResolution?: boolean;
}): Promise<void> {
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const verifier = params.verifierName || 'Government Admin';

  // 1. Update the officer_work_updates record
  try {
    const updateDocRef = doc(db, OFFICER_WORK_UPDATES_COLLECTION, params.updateId);
    await updateDoc(updateDocRef, {
      government_review_status: 'APPROVED',
      government_reviewed_by: verifier,
      government_reviewed_at: now.toISOString(),
      government_feedback: params.approvalNotes || 'Approved without modifications.'
    });
  } catch (err) {
    console.warn('[Firestore] Note updating officer_work_updates record:', err);
  }

  // 2. Update the parent complaint document
  const complaintDocRef = doc(db, COMPLAINTS_COLLECTION, params.complaintId);
  const snap = await getDoc(complaintDocRef);
  if (!snap.exists()) return;

  const existing = convertDocToCivicCase(params.complaintId, snap.data());

  if (params.isFinalResolution || existing.status === 'AWAITING GOVERNMENT VERIFICATION' || existing.status === 'AWAITING_VERIFICATION') {
    // Officially mark complaint as SOLVED / RESOLVED
    const updatedResolutionReport = {
      ...(existing.resolutionReport || {
        summary: existing.officerUpdateNote || 'Field repairs executed by departmental squad.',
        actionTaken: existing.currentAction || 'Issue resolved and verified.',
        completedAt: now.toISOString()
      }),
      verifiedByGovernment: true,
      verificationNotes: params.approvalNotes || 'Official Government verification completed. Photographic evidence approved.'
    };

    const updatedTimeline: TimelineEvent[] = [
      {
        id: `t-gov-appr-${Date.now()}`,
        title: 'Government Approved Resolution & Ticket SOLVED',
        timestamp: formattedDate,
        description: `Government Admin (${verifier}) reviewed Officer report & verified site repairs. Case officially marked COMPLETED / RESOLVED.`,
        status: 'completed',
        actor: verifier,
        public_visible: true
      },
      ...existing.timeline
    ];

    await updateDoc(complaintDocRef, {
      status: 'SOLVED',
      progress: 100,
      resolved_at: now.toISOString(),
      resolution_report: updatedResolutionReport,
      resolution_notes: params.approvalNotes || 'Government verification completed.',
      sla_hours_remaining: 0,
      current_action: 'Case officially closed and verified by Municipal Government.',
      next_action: 'Citizen rating and archival completed.',
      updated_at: now.toISOString(),
      timeline: updatedTimeline
    });
  } else {
    // Approve intermediate progress
    const updatedTimeline: TimelineEvent[] = [
      {
        id: `t-gov-appr-${Date.now()}`,
        title: 'Government Approved Officer Progress',
        timestamp: formattedDate,
        description: `Government Admin (${verifier}) approved field progress report. Notes: ${params.approvalNotes || 'Squad proceeding on schedule.'}`,
        status: 'completed',
        actor: verifier,
        public_visible: true
      },
      ...existing.timeline
    ];

    await updateDoc(complaintDocRef, {
      status: 'IN_PROGRESS',
      updated_at: now.toISOString(),
      timeline: updatedTimeline
    });
  }
}

// 19. GOVERNMENT: REJECT / REQUEST REVISION ON OFFICER WORK UPDATE
export async function governmentRejectWorkUpdateInDb(params: {
  updateId: string;
  complaintId: string;
  verifierName?: string;
  reason: string;
}): Promise<void> {
  const now = new Date();
  const formattedDate = now.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const verifier = params.verifierName || 'Government Admin';

  // 1. Update the officer_work_updates record
  try {
    const updateDocRef = doc(db, OFFICER_WORK_UPDATES_COLLECTION, params.updateId);
    await updateDoc(updateDocRef, {
      government_review_status: 'REJECTED',
      government_reviewed_by: verifier,
      government_reviewed_at: now.toISOString(),
      government_feedback: params.reason
    });
  } catch (err) {
    console.warn('[Firestore] Note updating officer_work_updates record:', err);
  }

  // 2. Update complaint document to alert officer of revision needed
  const complaintDocRef = doc(db, COMPLAINTS_COLLECTION, params.complaintId);
  const snap = await getDoc(complaintDocRef);
  if (!snap.exists()) return;

  const existing = convertDocToCivicCase(params.complaintId, snap.data());

  const updatedTimeline: TimelineEvent[] = [
    {
      id: `t-gov-rev-${Date.now()}`,
      title: 'Revision Requested by Government Admin',
      timestamp: formattedDate,
      description: `Government Admin (${verifier}) requested revision on work update. Reason: "${params.reason}". Returned to officer.`,
      status: 'current',
      actor: verifier,
      public_visible: true
    },
    ...existing.timeline
  ];

  await updateDoc(complaintDocRef, {
    status: 'IN_PROGRESS',
    current_action: `Revision requested by Government: ${params.reason}`,
    next_action: 'Officer to perform required corrections and re-submit work report.',
    updated_at: now.toISOString(),
    timeline: updatedTimeline
  });
}
