import React, { useState, useEffect } from 'react';
import { 
  MOCK_CASES, 
  CITY_HOTSPOTS, 
  AI_LIVE_INSIGHTS 
} from './data/mockData';
import { CivicCase, CityHotspot, AIInsightItem, AppView, CivicCategory, DepartmentOfficer } from './types';
import { CaseDetailsModal } from './components/CaseDetailsModal';
import { GovernmentLayout } from './components/GovernmentLayout';
import { CitizenLayout } from './components/CitizenLayout';
import { subscribeToComplaints, seedComplaintsIfEmpty } from './services/complaintsService';
import { getActiveOfficer } from './services/authService';

// Pages
import { LandingPage } from './pages/LandingPage';
import { CitizenLoginPage } from './pages/CitizenLoginPage';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { CitizenAiAnalysisPage } from './pages/CitizenAiAnalysisPage';
import { CitizenCaseDetailsPage } from './pages/CitizenCaseDetailsPage';
import { GovernmentLoginPage } from './pages/GovernmentLoginPage';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { CityIntelligencePage } from './pages/CityIntelligencePage';
import { AiResolutionEnginePage } from './pages/AiResolutionEnginePage';
import { CaseIntelligencePage } from './pages/CaseIntelligencePage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TrackCasePage } from './pages/TrackCasePage';
import { OfficerLoginPage } from './pages/OfficerLoginPage';
import { OfficerWorkspacePage } from './pages/OfficerWorkspacePage';
import { CivicImageKey } from './utils/imageAssets';

// URL Mapping Helper
const viewToPath = (view: AppView, caseId: string = 'CL-2026-0847'): string => {
  switch (view) {
    case 'landing':
    case 'home':
      return '/';
    case 'citizen-login':
      return '/citizen/login';
    case 'citizen-dashboard':
      return '/citizen/dashboard';
    case 'citizen-report':
    case 'report':
      return '/citizen/report';
    case 'citizen-ai-analysis':
    case 'citizen-analysis':
      return '/citizen/ai-analysis';
    case 'citizen-case-details':
    case 'citizen-case-detail':
      return `/citizen/case/${caseId}`;
    case 'citizen-track':
    case 'track':
    case 'track-case':
      return `/citizen/case/${caseId}/track`;
    case 'gov-login':
      return '/government/login';
    case 'gov-dashboard':
    case 'command-center':
      return '/government/dashboard';
    case 'gov-live-cases':
      return '/government/live-cases';
    case 'city-intelligence':
    case 'gov-city-intelligence':
      return '/government/city-intelligence';
    case 'ai-resolution-engine':
    case 'ai-engine':
    case 'gov-ai-engine':
      return '/government/ai-engine';
    case 'case-intelligence':
    case 'gov-case-intelligence':
      return `/government/case/${caseId}`;
    case 'departments':
    case 'gov-departments':
      return '/government/departments';
    case 'analytics':
    case 'gov-analytics':
      return '/government/analytics';
    case 'officer-login':
      return '/officer/login';
    case 'officer-workspace':
      return '/officer/workspace';
    default:
      return '/';
  }
};

const pathToView = (path: string): { view: AppView; caseId?: string } => {
  const cleanPath = path.split('?')[0].replace(/\/$/, '') || '/';
  
  if (cleanPath === '' || cleanPath === '/') return { view: 'landing' };
  if (cleanPath === '/citizen/login') return { view: 'citizen-login' };
  if (cleanPath === '/citizen/dashboard' || cleanPath === '/citizen/complaints') return { view: 'citizen-dashboard' };
  if (cleanPath === '/citizen/report') return { view: 'citizen-report' };
  if (cleanPath === '/citizen/ai-analysis') return { view: 'citizen-ai-analysis' };
  
  if (cleanPath.startsWith('/citizen/case/')) {
    const parts = cleanPath.split('/');
    // /citizen/case/CL-2026-0847 or /citizen/case/CL-2026-0847/track
    const cId = parts[3] || 'CL-2026-0847';
    if (parts[4] === 'track') {
      return { view: 'citizen-track', caseId: cId };
    }
    return { view: 'citizen-case-details', caseId: cId };
  }

  if (cleanPath === '/citizen/track') return { view: 'citizen-track' };

  if (cleanPath === '/government/login') return { view: 'gov-login' };
  if (cleanPath === '/government/dashboard') return { view: 'gov-dashboard' };
  if (cleanPath === '/government/live-cases') return { view: 'gov-live-cases' };
  if (cleanPath === '/government/city-intelligence') return { view: 'city-intelligence' };
  if (cleanPath === '/government/ai-engine') return { view: 'ai-resolution-engine' };
  
  if (cleanPath.startsWith('/government/case/')) {
    const parts = cleanPath.split('/');
    const cId = parts[3] || 'CL-2026-0847';
    return { view: 'case-intelligence', caseId: cId };
  }

  if (cleanPath === '/government/departments') return { view: 'departments' };
  if (cleanPath === '/government/analytics') return { view: 'analytics' };

  if (cleanPath === '/officer/login') return { view: 'officer-login' };
  if (cleanPath === '/officer/workspace' || cleanPath === '/officer') return { view: 'officer-workspace' };

  return { view: 'landing' };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<AppView>('landing');
  const [cases, setCases] = useState<CivicCase[]>(MOCK_CASES);
  const [hotspots] = useState<CityHotspot[]>(CITY_HOTSPOTS);
  const [insights] = useState<AIInsightItem[]>(AI_LIVE_INSIGHTS);
  const [userRole, setUserRole] = useState<'citizen' | 'gov' | 'guest'>('guest');
  const [activeOfficer, setActiveOfficerState] = useState<DepartmentOfficer | null>(() => getActiveOfficer());
  
  // Selected Case for Modal or Details View
  const [selectedCaseForModal, setSelectedCaseForModal] = useState<CivicCase | null>(null);
  const [activeCaseIdForPage, setActiveCaseIdForPage] = useState<string>('CL-2026-0847');
  
  // Draft report for AI analysis flow
  const [draftReport, setDraftReport] = useState<{
    title: string;
    description: string;
    category: CivicCategory;
    address: string;
    ward: string;
    landmark: string;
    imageKey: CivicImageKey;
    imageUrl: string;
  }>({
    title: 'Large Pothole Near School',
    description: 'There is a huge crater pothole right near the school entrance gate on MG Road. Deep cavity filled with rainwater is causing two-wheelers to skid and creating extreme danger for children during morning school hours.',
    category: 'Roads & Infrastructure',
    address: 'Near St. Mary High School, MG Road',
    ward: 'Ward 12 (Central Zone)',
    landmark: 'Gate No. 2, St. Mary School',
    imageKey: 'roads',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80'
  });

  // 1. Synchronize URL on Mount and Handle PopState (Browser Back/Forward)
  useEffect(() => {
    const handleLocationChange = () => {
      const parsed = pathToView(window.location.pathname);
      setActiveTab(parsed.view);
      if (parsed.caseId) {
        setActiveCaseIdForPage(parsed.caseId);
      }
      if (parsed.view.startsWith('gov-') || parsed.view === 'city-intelligence' || parsed.view === 'ai-resolution-engine' || parsed.view === 'departments' || parsed.view === 'analytics' || parsed.view === 'case-intelligence') {
        setUserRole('gov');
      } else if (parsed.view.startsWith('citizen-')) {
        setUserRole('citizen');
      }
    };

    // Initial load
    handleLocationChange();

    // Listen to browser navigation
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // 2. Real-Time Firestore Synchronization for Shared Single-Source-of-Truth Database
  useEffect(() => {
    // Check and seed initial complaints if collection is empty
    seedComplaintsIfEmpty();

    console.log('[CivicMind App] Subscribing to real-time Firestore complaints stream...');
    const unsubscribe = subscribeToComplaints(
      (complaintsList) => {
        console.log(`[CivicMind App] Received ${complaintsList.length} complaint(s) from database`);
        if (complaintsList.length > 0) {
          setCases(complaintsList);
        }
      },
      (err) => {
        console.error('[CivicMind App] Database subscription error:', err);
      }
    );

    return () => {
      console.log('[CivicMind App] Unsubscribing from Firestore complaints stream');
      unsubscribe();
    };
  }, []);

  // 2. Navigation with pushState
  const navigateTo = (view: AppView, caseId?: string) => {
    const targetCaseId = caseId || activeCaseIdForPage;
    if (caseId) {
      setActiveCaseIdForPage(caseId);
    }
    
    // Map legacy alias IDs
    let targetView: AppView = view;
    if (view === 'home') targetView = 'landing';
    if (view === 'report') targetView = 'citizen-report';
    if (view === 'command-center') targetView = 'gov-dashboard';
    if (view === 'track' || view === 'track-case') targetView = 'citizen-track';
    if (view === 'ai-engine') targetView = 'ai-resolution-engine';

    setActiveTab(targetView);

    // Update Role Context
    if (targetView.startsWith('gov-') || targetView === 'city-intelligence' || targetView === 'ai-resolution-engine' || targetView === 'departments' || targetView === 'analytics' || targetView === 'case-intelligence') {
      setUserRole('gov');
    } else if (targetView.startsWith('citizen-')) {
      setUserRole('citizen');
    }

    const path = viewToPath(targetView, targetCaseId);
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Escalate case handler
  const handleEscalateCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              isEscalated: true,
              priority: 'P1',
              status: 'Escalated',
              timeline: [
                {
                  id: `t-esc-${Date.now()}`,
                  title: 'Escalated to Municipal Commissioner',
                  timestamp: 'Just now',
                  description: 'Priority bumped to P1 Emergency. Immediate field deployment order issued.',
                  status: 'completed',
                  actor: 'Operations Desk'
                },
                ...c.timeline
              ]
            }
          : c
      )
    );
  };

  // Resolve case handler
  const handleResolveCase = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status: 'Resolved',
              slaHoursRemaining: 0,
              resolvedImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
              timeline: [
                {
                  id: `t-res-${Date.now()}`,
                  title: 'Resolution & Optical Verification Complete',
                  timestamp: 'Just now',
                  description: 'Field repair photo validated by AI Computer Vision. Issue officially marked resolved.',
                  status: 'completed',
                  actor: 'CivicMind AI System'
                },
                ...c.timeline
              ]
            }
          : c
      )
    );

    if (selectedCaseForModal && selectedCaseForModal.id === caseId) {
      setSelectedCaseForModal((prev) =>
        prev
          ? {
              ...prev,
              status: 'Resolved',
              slaHoursRemaining: 0,
              resolvedImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80'
            }
          : null
      );
    }
  };

  // Trigger AI Analysis from Report form
  const handleStartAnalysis = (draft: typeof draftReport) => {
    setDraftReport(draft);
    navigateTo('citizen-ai-analysis');
  };

  // Add newly created case from AI analysis or report wizard
  const handleCaseCreated = (newCase: CivicCase) => {
    setCases((prev) => [newCase, ...prev.filter(c => c.id !== newCase.id)]);
    setActiveCaseIdForPage(newCase.id);
    navigateTo('citizen-case-details', newCase.id);
  };

  // Navigate to Case Intelligence Detailed Page
  const handleNavigateToCase = (caseId: string) => {
    setActiveCaseIdForPage(caseId);
    if (userRole === 'citizen' || activeTab.startsWith('citizen')) {
      navigateTo('citizen-case-details', caseId);
    } else {
      navigateTo('case-intelligence', caseId);
    }
  };

  // Active case for detail pages
  const currentCaseDetail = cases.find((c) => c.id === activeCaseIdForPage) || cases[0];

  // Helper check for layouts
  const isGovernmentView = [
    'gov-dashboard',
    'gov-live-cases',
    'command-center',
    'city-intelligence',
    'gov-city-intelligence',
    'ai-resolution-engine',
    'ai-engine',
    'gov-ai-engine',
    'case-intelligence',
    'gov-case-intelligence',
    'departments',
    'gov-departments',
    'analytics',
    'gov-analytics'
  ].includes(activeTab);

  const isCitizenView = [
    'citizen-dashboard',
    'citizen-report',
    'report',
    'citizen-ai-analysis',
    'citizen-case-details',
    'citizen-track',
    'track',
    'track-case'
  ].includes(activeTab);

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* 1. STANDALONE LANDING PAGE (Marketing / Portal Selection) */}
      {activeTab === 'landing' && (
        <LandingPage
          onNavigate={(view) => navigateTo(view)}
          onOpenReport={() => navigateTo('citizen-report')}
          onOpenTrack={() => navigateTo('citizen-track')}
        />
      )}

      {/* 2. STANDALONE CITIZEN LOGIN */}
      {activeTab === 'citizen-login' && (
        <CitizenLoginPage
          onNavigate={(view) => navigateTo(view)}
          onLoginSuccess={(role) => {
            setUserRole(role);
            navigateTo('citizen-dashboard');
          }}
        />
      )}

      {/* 3. STANDALONE GOVERNMENT LOGIN */}
      {activeTab === 'gov-login' && (
        <GovernmentLoginPage
          onNavigate={(view) => navigateTo(view)}
          onLoginSuccess={(role) => {
            setUserRole(role);
            navigateTo('gov-dashboard');
          }}
        />
      )}

      {/* 4. STANDALONE OFFICER LOGIN */}
      {activeTab === 'officer-login' && (
        <OfficerLoginPage
          onNavigate={(view) => navigateTo(view)}
          onLoginSuccess={(officer) => {
            setActiveOfficerState(officer);
            setUserRole('gov');
            navigateTo('officer-workspace');
          }}
        />
      )}

      {/* 5. STANDALONE RESTRICTED OFFICER WORKSPACE */}
      {activeTab === 'officer-workspace' && (
        <OfficerWorkspacePage
          onNavigate={(view) => navigateTo(view)}
          activeOfficer={activeOfficer}
        />
      )}

      {/* 6. CITIZEN PORTAL SHELL (Sticky Top Navigation + Viewport Content) */}
      {isCitizenView && (
        <CitizenLayout
          currentView={activeTab}
          onNavigate={(view) => navigateTo(view)}
          onSwitchToGov={() => navigateTo('gov-dashboard')}
          onOpenReport={() => navigateTo('citizen-report')}
        >
          {activeTab === 'citizen-dashboard' && (
            <CitizenDashboardPage
              cases={cases}
              onNavigate={(view) => navigateTo(view)}
              onSelectCase={(caseId) => handleNavigateToCase(caseId)}
              onOpenReport={() => navigateTo('citizen-report')}
            />
          )}

          {(activeTab === 'citizen-report' || activeTab === 'report') && (
            <div className="py-8 px-4 sm:px-6 lg:px-8">
              <ReportIssuePage
                onStartAnalysis={handleStartAnalysis}
                onCaseCreated={handleCaseCreated}
                onNavigate={(view) => navigateTo(view)}
                onViewCase={(caseId) => handleNavigateToCase(caseId)}
              />
            </div>
          )}

          {activeTab === 'citizen-ai-analysis' && (
            <CitizenAiAnalysisPage
              draftData={draftReport}
              onCreateComplaint={handleCaseCreated}
              onNavigate={(view) => navigateTo(view)}
            />
          )}

          {activeTab === 'citizen-case-details' && (
            <CitizenCaseDetailsPage
              caseItem={currentCaseDetail}
              onNavigate={(view) => navigateTo(view)}
              onOpenAIAnalysis={() => navigateTo('citizen-ai-analysis')}
            />
          )}

          {(activeTab === 'citizen-track' || activeTab === 'track' || activeTab === 'track-case') && (
            <TrackCasePage
              cases={cases}
              onNavigateToCase={(caseId) => handleNavigateToCase(caseId)}
              onNavigateToReport={() => navigateTo('citizen-report')}
            />
          )}
        </CitizenLayout>
      )}

      {/* 5. GOVERNMENT COMMAND CENTER SHELL (Fixed Left Sidebar + Operations Workspace) */}
      {isGovernmentView && (
        <GovernmentLayout
          currentView={activeTab}
          onNavigate={(view) => navigateTo(view)}
          onSwitchToCitizen={() => navigateTo('citizen-dashboard')}
          insights={insights}
        >
          {(activeTab === 'gov-dashboard' || activeTab === 'command-center' || activeTab === 'gov-live-cases') && (
            <CommandCenterPage
              cases={cases}
              hotspots={hotspots}
              insights={insights}
              onSelectCase={(c) => setSelectedCaseForModal(c)}
              onNavigateToCaseIntelligence={(caseId) => handleNavigateToCase(caseId)}
              onOpenAIAnalysis={(c) => {
                setActiveCaseIdForPage(c.id);
                navigateTo('ai-resolution-engine');
              }}
              onEscalateCase={handleEscalateCase}
              onResolveCase={handleResolveCase}
            />
          )}

          {(activeTab === 'city-intelligence' || activeTab === 'gov-city-intelligence') && (
            <CityIntelligencePage
              cases={cases}
              hotspots={hotspots}
              onSelectCase={(c) => setSelectedCaseForModal(c)}
              onNavigateToCase={(caseId) => handleNavigateToCase(caseId)}
            />
          )}

          {(activeTab === 'ai-resolution-engine' || activeTab === 'ai-engine' || activeTab === 'gov-ai-engine') && (
            <AiResolutionEnginePage
              onNavigateToReport={() => navigateTo('citizen-report')}
            />
          )}

          {(activeTab === 'case-intelligence' || activeTab === 'gov-case-intelligence') && (
            <CaseIntelligencePage
              caseItem={currentCaseDetail}
              onBack={() => navigateTo('gov-dashboard')}
              onSelectCaseById={(id) => handleNavigateToCase(id)}
              onEscalateCase={handleEscalateCase}
              onResolveCase={handleResolveCase}
            />
          )}

          {(activeTab === 'departments' || activeTab === 'gov-departments') && (
            <DepartmentsPage
              cases={cases}
              onSelectCase={(caseId) => handleNavigateToCase(caseId)}
              onNavigate={(view) => navigateTo(view)}
            />
          )}

          {(activeTab === 'analytics' || activeTab === 'gov-analytics') && (
            <AnalyticsPage />
          )}
        </GovernmentLayout>
      )}

      {/* Case Details Quick Modal for map/feed pins */}
      {selectedCaseForModal && (
        <CaseDetailsModal
          caseItem={selectedCaseForModal}
          onClose={() => setSelectedCaseForModal(null)}
          onViewFullCase={(id) => {
            setSelectedCaseForModal(null);
            handleNavigateToCase(id);
          }}
          onEscalate={(id) => handleEscalateCase(id)}
          onResolve={(id) => handleResolveCase(id)}
        />
      )}

    </div>
  );
}
