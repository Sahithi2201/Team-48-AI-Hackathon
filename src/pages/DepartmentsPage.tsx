import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Users, 
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
  Wrench,
  Phone,
  UserCheck,
  BadgeCheck
} from 'lucide-react';
import { CivicCase, DepartmentName, CivicCategory, AppView } from '../types';
import { CIVIC_DEPARTMENTS_CONFIG, getDepartmentOfficersWithDynamicLoad } from '../services/complaintsService';
import { getCivicImageUrl, resolveCivicImageKey } from '../utils/imageAssets';
import { getSeverityInfo } from '../utils/operationsFormatters';

interface DepartmentsPageProps {
  cases: CivicCase[];
  onSelectCase: (caseId: string) => void;
  onNavigate: (view: AppView) => void;
}

const DEPT_METADATA_MAP: Record<string, {
  lead: string;
  squads: string;
  slaCompliance: number;
  avgResolutionHours: string;
  aiAction: string;
  imageKey: string;
}> = {
  roads: {
    lead: 'Superintending Engineer Rajesh Sharma',
    squads: '12 Active Asphalt & Paving Squads',
    slaCompliance: 92.4,
    avgResolutionHours: '12.4 Hours',
    aiAction: 'Pre-allocate asphalt compactor crews to high-traffic arterial junctions before evening commute.',
    imageKey: 'roads'
  },
  water: {
    lead: 'Chief Engineer Anita Sen',
    squads: '8 Valve Isolation & Repair Units',
    slaCompliance: 94.6,
    avgResolutionHours: '8.2 Hours',
    aiAction: 'Monitor pressure drop telemetry on 600mm distribution feeder lines to prevent pipe cavitation.',
    imageKey: 'water'
  },
  sanitation: {
    lead: 'Chief Sanitation Officer Dr. V. Nair',
    squads: '24 Compactor Tipper Trucks',
    slaCompliance: 96.0,
    avgResolutionHours: '5.2 Hours',
    aiAction: 'Optimize morning clearance routes for commercial market corridors and high-density bins.',
    imageKey: 'waste'
  },
  drainage: {
    lead: 'Executive Engineer M. Deshmukh',
    squads: '6 Super Sucker Jetting Trucks',
    slaCompliance: 88.5,
    avgResolutionHours: '14.8 Hours',
    aiAction: 'Deploy vacuum desilting machines to low-lying catchment areas ahead of predicted rainfall.',
    imageKey: 'drinage'
  },
  street_lighting: {
    lead: 'Assistant Engineer Farhan Qureshi',
    squads: '9 Aerial Bucket & Hydraulic Vans',
    slaCompliance: 95.1,
    avgResolutionHours: '6.5 Hours',
    aiAction: 'Dispatch hydraulic bucket van to restore severed underground illumination feeder line.',
    imageKey: 'street images'
  },
  public_health: {
    lead: 'Chief Medical Officer Dr. Sunita Rao',
    squads: '10 Fogging & Vector Control Squads',
    slaCompliance: 93.8,
    avgResolutionHours: '7.0 Hours',
    aiAction: 'Initiate thermal fogging and anti-larval treatment across waterlogged wards within 4 hours.',
    imageKey: 'waste'
  },
  parks: {
    lead: 'Horticulture Director Priya Verma',
    squads: '7 Landscape & Tree Trimming Squads',
    slaCompliance: 91.0,
    avgResolutionHours: '18.5 Hours',
    aiAction: 'Inspect and trim precariously hanging branches near primary public walkways and playgrounds.',
    imageKey: 'public facilities'
  },
  traffic: {
    lead: 'Traffic Division Head Sanjay Patel',
    squads: '8 Signal & Road Marking Squads',
    slaCompliance: 94.0,
    avgResolutionHours: '9.0 Hours',
    aiAction: 'Reprogram synchronized signal timing at busy 4-way junctions to relieve peak congestion.',
    imageKey: 'roads'
  },
  electricity: {
    lead: 'Chief Electrical Inspector Arvind Kumar',
    squads: '11 High-Tension Quick Response Teams',
    slaCompliance: 96.5,
    avgResolutionHours: '4.5 Hours',
    aiAction: 'Isolate sparking distribution transformer and deploy emergency mobile backup unit.',
    imageKey: 'street images'
  },
  public_facilities: {
    lead: 'Public Works Custodian Meenakshi Iyer',
    squads: '5 Civil Maintenance Squads',
    slaCompliance: 89.2,
    avgResolutionHours: '20.0 Hours',
    aiAction: 'Schedule sanitation deep-clean and plumbing overhaul at central municipal bus transit shelter.',
    imageKey: 'public facilities'
  }
};

export const DepartmentsPage: React.FC<DepartmentsPageProps> = ({
  cases,
  onSelectCase,
  onNavigate
}) => {
  const [selectedDeptKey, setSelectedDeptKey] = useState<string>('roads');
  const [broadcastNotif, setBroadcastNotif] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const departmentsData = useMemo(() => {
    return CIVIC_DEPARTMENTS_CONFIG.map(dept => {
      const meta = DEPT_METADATA_MAP[dept.key] || {
        lead: dept.officers[0]?.name || 'Department Head',
        squads: '6 Active Squads',
        slaCompliance: 92.0,
        avgResolutionHours: `${dept.slaHours || 12} Hours`,
        aiAction: `Coordinate dynamic officer dispatch across active ${dept.name} tickets.`,
        imageKey: 'roads'
      };

      // Match cases for this department
      const deptCases = cases.filter(c => 
        c.assignedDepartment?.toLowerCase().includes(dept.name.toLowerCase()) ||
        c.assignedDepartment?.toLowerCase().includes(dept.key.toLowerCase()) ||
        (dept.key === 'roads' && (c.category === 'Road Damage' || c.category === 'Roads & Infrastructure')) ||
        (dept.key === 'water' && (c.category === 'Water Supply' || c.category === 'Water Supply & Pipelines')) ||
        (dept.key === 'sanitation' && (c.category === 'Garbage / Sanitation' || c.category === 'Waste & Sanitation')) ||
        (dept.key === 'drainage' && (c.category === 'Drainage' || c.category === 'Drainage & Sewage')) ||
        (dept.key === 'street_lighting' && (c.category === 'Streetlights' || c.category === 'Streetlights & Electrical')) ||
        (dept.key === 'public_health' && (c.category === 'Health / Sanitation Hazard' || c.category === 'Public Health & Sanitation')) ||
        (dept.key === 'parks' && (c.category === 'Parks & Greenery' || c.category === 'Parks & Public Spaces')) ||
        (dept.key === 'traffic' && (c.category === 'Traffic & Signals' || c.category === 'Traffic & Transportation')) ||
        (dept.key === 'electricity' && (c.category === 'Electricity' || c.category === 'Electricity & Utilities')) ||
        (dept.key === 'public_facilities' && (c.category === 'Public Buildings' || c.category === 'Public Facilities'))
      );

      const criticalCount = deptCases.filter(c => c.priority === 'P1' || c.isEscalated).length;
      const officersWithLoad = getDepartmentOfficersWithDynamicLoad(dept.key, cases);

      return {
        ...dept,
        ...meta,
        deptCases,
        activeCasesCount: deptCases.length,
        criticalCasesCount: criticalCount,
        officers: officersWithLoad
      };
    });
  }, [cases]);

  const filteredDepts = useMemo(() => {
    if (!searchTerm.trim()) return departmentsData;
    const term = searchTerm.toLowerCase();
    return departmentsData.filter(d => 
      d.name.toLowerCase().includes(term) || 
      d.lead.toLowerCase().includes(term) ||
      d.officers.some(o => o.name.toLowerCase().includes(term) || o.id.toLowerCase().includes(term))
    );
  }, [departmentsData, searchTerm]);

  const currentDept = departmentsData.find(d => d.key === selectedDeptKey) || departmentsData[0];
  const departmentCases = currentDept.deptCases;

  return (
    <div className="min-h-full text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-blue-700 uppercase">
                MUNICIPAL COORDINATION MATRIX
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Department Operations & Dispatch
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Real-time monitoring across 10 municipal departments and 50 registered civic response officers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search departments or officers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-56 sm:w-64"
              />
            </div>
            <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-mono font-bold text-blue-700 whitespace-nowrap">
              10 Departments • 50 Officers
            </span>
          </div>
        </div>

        {broadcastNotif && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 flex items-center justify-between">
            <span>{broadcastNotif}</span>
            <button onClick={() => setBroadcastNotif(null)} className="text-emerald-900 hover:underline">Dismiss</button>
          </div>
        )}

        {/* 10 DEPARTMENT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {filteredDepts.map((dept) => {
            const isSelected = selectedDeptKey === dept.key;

            return (
              <div
                key={dept.key}
                onClick={() => setSelectedDeptKey(dept.key)}
                className={`group relative rounded-3xl p-5 transition-all duration-300 cursor-pointer overflow-hidden border shadow-xs ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 -translate-y-0.5'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:-translate-y-0.5'
                }`}
              >
                <div className="space-y-3 relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {dept.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {dept.name}
                      </h3>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[9px] font-bold uppercase">ACTIVE</span>
                      <div className="text-sm font-black text-slate-900 font-mono">{dept.activeCasesCount}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-rose-700 text-[9px] font-bold uppercase">CRITICAL</span>
                      <div className="text-sm font-black text-rose-700 font-mono">{dept.criticalCasesCount}</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-[9px] font-bold uppercase">SLA TARGET</span>
                      <div className="text-[11px] font-bold text-slate-800">{dept.slaHours}h SLA</div>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-700 text-[9px] font-bold uppercase">OFFICERS</span>
                      <div className="text-[11px] font-black text-emerald-700 font-mono">{dept.officers.length} Active</div>
                    </div>
                  </div>

                  {/* AI Strategy snippet */}
                  <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[10px] space-y-1">
                    <div className="flex items-center gap-1 text-blue-800 font-bold">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span>AI Directive:</span>
                    </div>
                    <p className="text-slate-600 line-clamp-2 leading-tight">
                      {dept.aiAction}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono text-[10px] font-medium truncate max-w-[90px]">{dept.lead.split(' ').slice(0, 2).join(' ')}</span>
                  <span className={`font-bold flex items-center gap-0.5 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                    <span>{isSelected ? 'Active' : 'Select'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* DEPARTMENT OFFICERS ROSTER */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-blue-700 font-bold">Authorized Municipal Officers (50 Total)</span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {currentDept.name} — Officer Squad (5 Registered Officers)
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono font-medium">Head: {currentDept.lead}</span>
              <button
                onClick={() => setBroadcastNotif(`Automatic priority dispatch broadcasted to all 5 officers in ${currentDept.name}.`)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Broadcast Squad Alert
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {currentDept.officers.map((officer) => {
              const isBusy = officer.status === 'Heavy Workload' || officer.status === 'Busy';

              return (
                <div
                  key={officer.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {officer.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{officer.name}</h4>
                      <p className="text-[11px] text-slate-500">{officer.designation || 'Municipal Officer'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      isBusy ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {officer.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Jurisdiction:</span>
                      <span className="font-medium text-slate-800">{officer.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Zone:</span>
                      <span className="font-medium text-slate-800">{officer.area}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Active Load:</span>
                      <span className="font-mono font-bold text-slate-900">{officer.currentAssignments} cases</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contact:</span>
                      <span className="font-mono text-slate-700">{officer.phone}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIVE CASES FOR SELECTED DEPARTMENT */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-blue-700 font-bold">Department Case Queue</span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                {currentDept.name} ({departmentCases.length} Active Incidents)
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono font-medium">SLA Window: {currentDept.slaHours} Hours</span>
            </div>
          </div>

          {departmentCases.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800">No active backlog for {currentDept.name}</p>
              <p className="text-xs">All assigned civic service requests have been triaged or resolved within SLA.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentCases.map((item) => {
                const severity = getSeverityInfo(item.priority, item.isEscalated);

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectCase(item.id)}
                    className="p-5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-400 transition-all cursor-pointer space-y-3 flex flex-col justify-between shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-slate-600 font-bold">{item.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${severity.pillClass}`}>
                          {severity.label} ({severity.code})
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">{item.description}</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Location:</span>
                        <span className="text-slate-800 font-medium truncate max-w-[170px]">{item.location?.address || 'Municipal Area'}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Officer:</span>
                        <span className="text-blue-700 font-medium truncate max-w-[170px]">{item.assignedOfficerName || 'Auto-Allocated'}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>SLA Window:</span>
                        <span className={`font-mono font-bold ${item.slaHoursRemaining <= 2 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {item.slaHoursRemaining <= 0 ? 'Due immediately' : `${item.slaHoursRemaining}h remaining`}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-mono font-medium">{item.location?.ward || 'Central Ward'}</span>
                      <span className="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Inspect <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

