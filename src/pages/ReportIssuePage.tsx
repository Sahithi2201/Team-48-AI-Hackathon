import React, { useState } from 'react';
import { 
  Camera, 
  MapPin, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Crosshair,
  FileCheck2,
  Clock,
  Building2,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle,
  FileText,
  HelpCircle
} from 'lucide-react';
import { 
  CivicCategory, 
  ProblemDuration, 
  CivicCase, 
  AppView 
} from '../types';
import { createComplaintInDb } from '../services/complaintsService';
import { getCurrentUser } from '../services/authService';
import { resolveCivicImageKey, getCivicImageUrl, CivicImageKey } from '../utils/imageAssets';

interface ReportIssuePageProps {
  onStartAnalysis?: (draftReport: any) => void;
  onCaseCreated?: (newCase: CivicCase) => void;
  onNavigate: (view: AppView) => void;
  onViewCase?: (caseId: string) => void;
}

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({
  onCaseCreated,
  onNavigate,
  onViewCase
}) => {
  const currentUser = getCurrentUser();

  // Multi-step Wizard: 1: Personal, 2: Location, 3: Complaint, 4: Duration, 5: Success
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // STEP 1: Personal Details
  const [fullName, setFullName] = useState<string>(currentUser.full_name || 'Rahul Sharma');
  const [phone, setPhone] = useState<string>(currentUser.phone || '+91 98230 44120');
  const [email, setEmail] = useState<string>(currentUser.email || 'rahul.sharma@civicmind.org');
  const [citizenId, setCitizenId] = useState<string>(currentUser.citizen_id || 'CIT-98230');

  // STEP 2: Location Details
  const [cityName, setCityName] = useState<string>('Hyderabad');
  const [areaName, setAreaName] = useState<string>('Kukatpally');
  const [colonyName, setColonyName] = useState<string>('Green Colony');
  const [wardNumber, setWardNumber] = useState<string>('Ward 08 (North Zone)');
  const [streetAddress, setStreetAddress] = useState<string>('Plot 42, Station Road');
  const [landmark, setLandmark] = useState<string>('Opposite Bus Depot & Metro Pillar 44');
  const [postalCode, setPostalCode] = useState<string>('500072');
  const [latitude, setLatitude] = useState<number>(17.4933);
  const [longitude, setLongitude] = useState<number>(78.3914);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // STEP 3: Complaint Details
  const [title, setTitle] = useState<string>('Garbage Overflow Near Station Road');
  const [category, setCategory] = useState<CivicCategory>('Garbage / Sanitation');
  const [subcategory, setSubcategory] = useState<string>('Secondary Bin Overflow');
  const [description, setDescription] = useState<string>(
    'Secondary municipal garbage bin is overflowing onto the main pedestrian footpath and road. Waste is decomposing and attracting stray animals, creating severe foul smell and health hazard for commuters.'
  );
  const [dateFirstNoticed, setDateFirstNoticed] = useState<string>('');
  const [selectedImageKey, setSelectedImageKey] = useState<CivicImageKey>('waste');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');

  // STEP 4: Problem Duration
  const [problemDuration, setProblemDuration] = useState<ProblemDuration>('More Than 1 Month');
  const [problemStartedDate, setProblemStartedDate] = useState<string>('Approximately May 2026');

  // Created Case Info
  const [createdCase, setCreatedCase] = useState<CivicCase | null>(null);

  // Categories list
  const CATEGORIES: CivicCategory[] = [
    'Garbage / Sanitation',
    'Water Supply',
    'Road Damage',
    'Streetlights',
    'Drainage',
    'Electricity',
    'Public Safety',
    'Public Property Damage',
    'Environmental Issue',
    'Health / Sanitation Hazard',
    'Other'
  ];

  // Duration options
  const DURATION_OPTIONS: ProblemDuration[] = [
    'Today',
    '1–3 Days',
    '4–7 Days',
    '1–2 Weeks',
    '2–4 Weeks',
    '1–3 Months',
    '3–6 Months',
    'More Than 6 Months',
    'More Than 1 Year'
  ];

  // Benchmark quick presets
  const PRESETS = [
    {
      label: 'Garbage Overflow Near Station Road',
      category: 'Garbage / Sanitation' as CivicCategory,
      title: 'Garbage Overflow Near Station Road',
      colony: 'Green Colony',
      area: 'Kukatpally',
      city: 'Hyderabad',
      ward: 'Ward 08 (North Zone)',
      street: 'Near Station Road Bus Stop',
      landmark: 'Opposite Metro Pillar 44',
      duration: 'More Than 1 Month' as ProblemDuration,
      desc: 'Secondary municipal garbage bin is overflowing onto the main pedestrian footpath and road. Waste is decomposing and attracting stray animals, creating severe foul smell and health hazard.',
      imgKey: 'waste' as CivicImageKey
    },
    {
      label: 'Major Water Pipe Rupture',
      category: 'Water Supply' as CivicCategory,
      title: 'Main Drinking Water Pipeline Rupture',
      colony: 'Gandhi Nagar',
      area: 'Banjara Hills',
      city: 'Hyderabad',
      ward: 'Ward 12 (Central Zone)',
      street: 'Road No. 10, Near Clock Tower',
      landmark: 'Near State Bank of India',
      duration: '4–7 Days' as ProblemDuration,
      desc: 'High-pressure clean potable water pipeline ruptured underground. Water gushing onto the road, flooding basement shops and depriving local residents of drinking water.',
      imgKey: 'water' as CivicImageKey
    },
    {
      label: 'Dangerous Crater Pothole Near School',
      category: 'Road Damage' as CivicCategory,
      title: 'Deep Crater Pothole Near Primary School Gate',
      colony: 'Adarsh Nagar',
      area: 'MG Road',
      city: 'Hyderabad',
      ward: 'Ward 05 (East Zone)',
      street: 'Near St. Mary High School Gate #2',
      landmark: 'Opposite Community Hall',
      duration: '2–4 Weeks' as ProblemDuration,
      desc: 'Over 15cm deep pothole filled with stagnant rainwater right at the school entrance. Two-wheelers skidding frequently and dangerous for morning school buses.',
      imgKey: 'roads' as CivicImageKey
    },
    {
      label: 'Monsoon Drain Blockage & Sewage Leak',
      category: 'Drainage' as CivicCategory,
      title: 'Open Drain Blockage & Sewage Overflow',
      colony: 'Nehru Colony',
      area: 'Secunderabad',
      city: 'Hyderabad',
      ward: 'Ward 03 (Old City)',
      street: 'Lane 4, Market Junction',
      landmark: 'Behind Public Health Dispensary',
      duration: '1–3 Months' as ProblemDuration,
      desc: 'Stormwater drainage choke causing black foul sewage water to back up onto residential driveways and pedestrian walkways. Severe mosquito breeding and hazard.',
      imgKey: 'drinage' as CivicImageKey
    }
  ];

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setCityName(preset.city);
    setAreaName(preset.area);
    setColonyName(preset.colony);
    setWardNumber(preset.ward);
    setStreetAddress(preset.street);
    setLandmark(preset.landmark);
    setProblemDuration(preset.duration);
    setDescription(preset.desc);
    setSelectedImageKey(preset.imgKey);
  };

  const handleAutoLocate = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(6)));
          setLongitude(Number(pos.coords.longitude.toFixed(6)));
          setIsLocating(false);
        },
        () => {
          setLatitude(17.4933);
          setLongitude(78.3914);
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Submission handler to Firestore
  const handleSubmitComplaint = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!fullName.trim() || !phone.trim()) {
        setCurrentStep(1);
        throw new Error('Please provide your Full Name and Phone Number in Step 1.');
      }
      if (!cityName.trim() || !areaName.trim() || !colonyName.trim()) {
        setCurrentStep(2);
        throw new Error('Please fill in required location details: City, Area, and Colony in Step 2.');
      }
      if (!title.trim() || !description.trim()) {
        setCurrentStep(3);
        throw new Error('Please provide Complaint Title and Description in Step 3.');
      }

      const photoUrl = customImageUrl || getCivicImageUrl(selectedImageKey);

      // Save real complaint to database
      const created = await createComplaintInDb({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        citizenId: citizenId.trim(),

        cityName: cityName.trim(),
        areaName: areaName.trim(),
        colonyName: colonyName.trim(),
        wardNumber: wardNumber.trim(),
        streetAddress: streetAddress.trim(),
        landmark: landmark.trim(),
        postalCode: postalCode.trim(),
        latitude,
        longitude,

        title: title.trim(),
        category,
        subcategory: subcategory.trim(),
        description: description.trim(),
        dateFirstNoticed,
        imageUrl: photoUrl,
        imageKey: selectedImageKey,

        problemDuration,
        problemStartedDate
      });

      setCreatedCase(created);
      if (onCaseCreated) {
        onCaseCreated(created);
      }
      setCurrentStep(5); // Success step
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Failed to save complaint to database. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Location' },
    { num: 3, label: 'Complaint' },
    { num: 4, label: 'Problem Duration' },
    { num: 5, label: 'Confirmation' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* 1. STEP PROGRESS BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isDone ? 'bg-emerald-600 text-white font-bold' :
                    isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                    'bg-slate-100 text-slate-500 border border-slate-300'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : `0${s.num}`}
                  </div>
                  <span className={`text-xs font-bold hidden sm:inline ${
                    isCurrent ? 'text-blue-600' : isDone ? 'text-emerald-700' : 'text-slate-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-all ${
                    currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Validation Alert</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* QUICK PRESETS BANNER (Steps 1-4) */}
      {currentStep <= 4 && (
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2.5">
          <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Fast Fill Sample Real Scenarios:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  title === p.title
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:text-blue-700 border border-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. STEP 1: PERSONAL DETAILS */}
      {currentStep === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-blue-600 font-bold tracking-wider">STEP 01</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Citizen Personal Details</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Step 1 of 4</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Your name and contact details will be recorded and made available to authorized Government officers for follow-up and verification.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98230 44120"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. citizen@civicmind.org"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Citizen ID / User Identifier
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={citizenId}
                  onChange={(e) => setCitizenId(e.target.value)}
                  placeholder="e.g. CIT-98230"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600 font-bold"
                />
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                if (!fullName.trim() || !phone.trim()) {
                  setErrorMessage('Please enter your full name and phone number to proceed.');
                  return;
                }
                setErrorMessage(null);
                setCurrentStep(2);
              }}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>NEXT: LOCATION DETAILS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* 3. STEP 2: LOCATION DETAILS */}
      {currentStep === 2 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-blue-600 font-bold tracking-wider">STEP 02</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Incident Location Details</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Step 2 of 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="e.g. Hyderabad"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Area Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="e.g. Kukatpally"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Colony / Locality <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={colonyName}
                onChange={(e) => setColonyName(e.target.value)}
                placeholder="e.g. Green Colony"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ward Number / Zone
              </label>
              <input
                type="text"
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                placeholder="e.g. Ward 08 (North Zone)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Street / Full Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. Plot 42, Station Road"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nearby Landmark (Hospital, School, Market, Bus Stop)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Metro Pillar 44 / Gate 2 School"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="e.g. 500072"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* GPS Coordinates Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">GPS Coordinates:</span>
              <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {latitude}° N, {longitude}° E
              </span>
            </div>
            <button
              type="button"
              onClick={handleAutoLocate}
              disabled={isLocating}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Acquiring GPS...' : 'Auto-detect GPS Location'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK</span>
            </button>

            <button
              onClick={() => {
                if (!cityName.trim() || !areaName.trim() || !colonyName.trim()) {
                  setErrorMessage('Please fill in City Name, Area Name, and Colony / Locality to proceed.');
                  return;
                }
                setErrorMessage(null);
                setCurrentStep(3);
              }}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>NEXT: COMPLAINT DETAILS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* 4. STEP 3: COMPLAINT DETAILS & PHOTO */}
      {currentStep === 3 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-blue-600 font-bold tracking-wider">STEP 03</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Problem Details & Attachments</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Step 3 of 4</span>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Complaint Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Garbage Overflow Near Station Road"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-bold"
              required
            />
          </div>

          {/* Problem Category */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Problem Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    const k = resolveCivicImageKey(cat);
                    setSelectedImageKey(k);
                  }}
                  className={`p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    category === cat
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {category === cat && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory & Date noticed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Optional Subcategory
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Pipeline burst / Bin overflow / Pothole"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date / Time First Noticed (Optional)
              </label>
              <input
                type="text"
                value={dateFirstNoticed}
                onChange={(e) => setDateFirstNoticed(e.target.value)}
                placeholder="e.g. 21 August 2026, 8:00 AM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Problem Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem, hazard level, proximity to schools, hospitals or high traffic..."
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white leading-relaxed font-normal"
              required
            />
          </div>

          {/* Photo Preview & Upload */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Photographic Evidence & Attachments
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative">
                <img
                  src={customImageUrl || getCivicImageUrl(selectedImageKey)}
                  alt="Evidence Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white font-mono text-[9px] rounded">
                  {selectedImageKey}
                </span>
              </div>
              <div className="space-y-2 flex-1 w-full text-xs">
                <p className="text-slate-600">
                  Select incident visual key or enter direct image URL:
                </p>
                <div className="flex flex-wrap gap-2">
                  {(['waste', 'roads', 'water', 'drinage', 'street images', 'public facilities'] as CivicImageKey[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setSelectedImageKey(k);
                        setCustomImageUrl('');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                        selectedImageKey === k && !customImageUrl
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK</span>
            </button>

            <button
              onClick={() => {
                if (!title.trim() || !description.trim()) {
                  setErrorMessage('Please enter Complaint Title and Problem Description to proceed.');
                  return;
                }
                setErrorMessage(null);
                setCurrentStep(4);
              }}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>NEXT: PROBLEM DURATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* 5. STEP 4: PROBLEM DURATION & SUBMISSION */}
      {currentStep === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-md space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-blue-600 font-bold tracking-wider">STEP 04</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Problem Duration & Review</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Step 4 of 4</span>
          </div>

          {/* DURATION SELECTOR */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 space-y-4">
            <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
              <Clock className="w-4 h-4 text-blue-700" />
              <span>HOW LONG HAVE YOU BEEN FACING THIS PROBLEM? *</span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              This helps municipal operations understand whether this is a newly emerging defect or a chronic long-standing issue requiring special inspection.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {DURATION_OPTIONS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setProblemDuration(dur)}
                  className={`p-3 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    problemDuration === dur
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-800 hover:bg-blue-50/50 border border-slate-300'
                  }`}
                >
                  <span>{dur}</span>
                  {problemDuration === dur && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-blue-950 mb-1">
                Approximate date the problem started (Optional)
              </label>
              <input
                type="text"
                value={problemStartedDate}
                onChange={(e) => setProblemStartedDate(e.target.value)}
                placeholder="e.g. Approximately May 2026 or 10 days ago"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-blue-200 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>

          {/* SUMMARY RECAP BEFORE SUBMIT */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center justify-between">
              <span>Complaint Submission Summary</span>
              <span className="font-mono text-blue-700">Initial Status: SUBMITTED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Citizen</span>
                <span className="font-bold text-slate-900">{fullName} ({phone})</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Location</span>
                <span className="font-bold text-slate-900">{colonyName}, {areaName}, {cityName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Category</span>
                <span className="font-bold text-slate-900">{category}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Reported Duration</span>
                <span className="font-bold text-blue-700 font-mono">{problemDuration}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK</span>
            </button>

            <button
              onClick={handleSubmitComplaint}
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving to Database...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  <span>SUBMIT COMPLAINT TO DATABASE</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* 6. STEP 5: COMPLAINT SUBMITTED SUCCESSFULLY */}
      {currentStep === 5 && createdCase && (
        <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-emerald-200 shadow-xl text-center space-y-6">
          
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
              COMPLAINT SUBMITTED SUCCESSFULLY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Complaint ID: {createdCase.id}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Your complaint has been permanently saved to the municipal database and dispatched to the Government operations team.
            </p>
          </div>

          {/* Ticket Spec Details */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 max-w-lg mx-auto grid grid-cols-2 gap-4 text-left text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Complaint ID</span>
              <div className="font-mono font-bold text-blue-700">{createdCase.id}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Status</span>
              <div className="font-bold text-blue-700 uppercase">{createdCase.status}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Government Risk Level</span>
              <div className="font-bold text-slate-600">{createdCase.finalGovernmentRisk}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Problem Duration</span>
              <div className="font-bold text-slate-900">{createdCase.problemDuration}</div>
            </div>
            <div className="col-span-2 border-t border-slate-200 pt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
              <div className="font-semibold text-slate-800">{createdCase.location.address}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                if (onViewCase) {
                  onViewCase(createdCase.id);
                } else {
                  onNavigate('citizen-case-details');
                }
              }}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>TRACK COMPLAINT</span>
            </button>

            <button
              onClick={() => onNavigate('citizen-dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>VIEW IN MY COMPLAINTS</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
