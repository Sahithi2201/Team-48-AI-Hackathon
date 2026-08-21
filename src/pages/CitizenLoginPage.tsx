import React, { useState } from 'react';
import { 
  MapPin, 
  Cpu, 
  ShieldCheck, 
  ArrowLeft, 
  UserCheck, 
  Lock, 
  Mail, 
  Sparkles, 
  CheckCircle2,
  ArrowRight,
  Radio
} from 'lucide-react';
import { AppView } from '../types';

interface CitizenLoginPageProps {
  onNavigate: (view: AppView) => void;
  onLoginSuccess: (userRole: 'citizen' | 'gov') => void;
}

export const CitizenLoginPage: React.FC<CitizenLoginPageProps> = ({
  onNavigate,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('citizen.demo@civicmind.org');
  const [password, setPassword] = useState('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onLoginSuccess('citizen');
      onNavigate('citizen-dashboard');
    }, 400);
  };

  const handleDemoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onLoginSuccess('citizen');
      onNavigate('citizen-dashboard');
    }, 300);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F6F9FC] text-[#0F172A] flex items-center justify-center p-4 sm:p-6 bg-smart-grid relative">
      
      {/* Background Soft Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-3xl bg-white border border-slate-200/90 shadow-2xl overflow-hidden">
        
        {/* LEFT SIDE: Citizen Portal Proposition */}
        <div className="md:col-span-6 p-7 sm:p-8 bg-gradient-to-br from-blue-50/60 to-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
          <div className="space-y-4">
            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Landing Page</span>
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>CivicMind Citizen Gateway</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Your City. <br />
                Your Voice. <br />
                <span className="text-blue-600">Intelligently Heard.</span>
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Connect directly to your municipal corporation with AI-accelerated issue reporting, transparent prioritization, and verified resolution tracking.
              </p>
            </div>

            {/* THREE FEATURE INDICATORS */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Report Issues</h4>
                  <p className="text-[11px] text-slate-500">Multimodal intake with auto GPS & photo proof</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">AI Analysis</h4>
                  <p className="text-[11px] text-slate-500">Instant severity, duplication check & explainable triage</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Track Resolution</h4>
                  <p className="text-[11px] text-slate-500">Live milestones with verified before/after repair photos</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="font-medium">Citizen Portal Active</span>
            <span className="font-mono text-blue-600">256-Bit Encrypted</span>
          </div>
        </div>

        {/* RIGHT SIDE: Bright White Login Card */}
        <div className="md:col-span-6 p-7 sm:p-8 flex flex-col justify-between bg-white">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Citizen Sign In</h3>
              <p className="text-xs text-slate-500 mt-0.5">Enter your citizen credentials or use instant demo access.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address or Mobile
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                    placeholder="citizen@smartcity.gov.in"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button type="button" className="text-xs text-blue-600 font-semibold hover:underline">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </span>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 text-slate-400 font-bold font-mono">Instant Sandbox</span>
              </div>
            </div>

            {/* DEMO CITIZEN BUTTON */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>CONTINUE AS DEMO CITIZEN</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Demo Profile: </span>
            <span className="font-bold text-slate-800">Rahul Sharma (Ward 12)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
