import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Activity, 
  Compass, 
  Eye, 
  Clock, 
  AlertCircle, 
  Sliders,
  FileCode,
  Terminal,
  Zap,
  Repeat
} from 'lucide-react';
import { AIAgentDefinition } from '../types';
import { AI_AGENTS_LIST } from '../data/mockData';

interface AiResolutionEnginePageProps {
  onNavigateToReport: () => void;
}

export const AiResolutionEnginePage: React.FC<AiResolutionEnginePageProps> = ({
  onNavigateToReport
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AIAgentDefinition>(AI_AGENTS_LIST[0]);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [testScenario, setTestScenario] = useState(
    'Deep 15-inch pothole with exposed reinforcement rebar outside St. Mary School on MG Road. 8 citizen calls received.'
  );

  const testPrompts = [
    {
      label: 'School Pothole & Rebar',
      text: 'Deep 15-inch pothole with exposed reinforcement rebar outside St. Mary School on MG Road. 8 citizen calls received.'
    },
    {
      label: 'Main Water Pipeline Rupture',
      text: 'High-pressure drinking water line ruptured under Gandhi Chowk roadway. 850L/min potable loss flowing toward electrical substation.'
    },
    {
      label: 'Overflowing Toxic Bio-Waste',
      text: '2.5 tons of rotten organic and commercial waste spilling out from municipal dumpster across pedestrian footpath near fruit market.'
    }
  ];

  const handleRunPipeline = () => {
    setIsRunningPipeline(true);
    setActiveStepIndex(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < AI_AGENTS_LIST.length) {
        setActiveStepIndex(current);
        setSelectedAgent(AI_AGENTS_LIST[current]);
      } else {
        clearInterval(interval);
        setIsRunningPipeline(false);
      }
    }, 850);
  };

  return (
    <div className="min-h-full bg-[#F6F9FC] text-[#0F172A] p-4 sm:p-6 lg:p-8 space-y-6 bg-smart-grid">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 uppercase">
            <Cpu className="w-3.5 h-3.5" /> Autonomous Core Engine
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            AI Multi-Agent Resolution Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            CivicLens AI coordinates 8 specialized neural agents to analyze, deduplicate, prioritize, and verify municipal civic tickets without human bottlenecks.
          </p>
        </div>

        {/* INTERACTIVE WORKBENCH SIMULATOR BAR */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" /> Interactive Agent Orchestrator Workbench
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Trigger real-time execution across the entire 8-agent swarm pipeline.
              </p>
            </div>

            <button
              onClick={handleRunPipeline}
              disabled={isRunningPipeline}
              className={`py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                isRunningPipeline
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isRunningPipeline ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Executing Agent Swarm ({activeStepIndex + 1}/8)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Full 8-Agent Pipeline</span>
                </>
              )}
            </button>
          </div>

          {/* Test Prompt Input & Scenario Chips */}
          <div className="space-y-2 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700">Load Incident Test Case:</span>
              {testPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setTestScenario(p.text)}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-[11px] text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={testScenario}
              onChange={(e) => setTestScenario(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>
        </div>

        {/* 8-AGENT VISUAL PIPELINE GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Autonomous Agent Pipeline Topology
            </h3>
            <span className="text-[11px] text-blue-700 font-mono font-bold">
              Latency: ~1.4s End-to-End
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AI_AGENTS_LIST.map((agent, index) => {
              const isActive = activeStepIndex === index;
              const isSelected = selectedAgent.id === agent.id;
              const isFinished = activeStepIndex > index;

              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden group shadow-xs ${
                    isActive
                      ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 scale-102'
                      : isSelected
                      ? 'bg-blue-50/50 border-blue-600'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top: Step Index & Status */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-blue-700">
                      Agent 0{index + 1}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      isActive
                        ? 'bg-blue-600 text-white animate-pulse'
                        : isFinished
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isActive ? 'PROCESSING' : isFinished ? 'DONE' : 'IDLE'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {agent.name}
                  </h4>
                  <div className="text-[10px] text-blue-600 font-mono mt-0.5 font-bold">
                    {agent.role}
                  </div>

                  <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed font-normal">
                    {agent.description}
                  </p>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>Latency: {agent.latencyTarget}</span>
                    <span className="text-blue-600 font-bold">Inspect →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DEEP AGENT INSPECTOR & NEURAL TELEMETRY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Agent System Architecture (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="text-xs font-mono font-bold text-blue-700">
                    NEURAL AGENT SPECIFICATION
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    {selectedAgent.name}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-700">
                  Reliability: {selectedAgent.accuracyRate}
                </span>
              </div>

              {/* Functional Purpose */}
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-700 uppercase">Core Mandate</div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  {selectedAgent.description}
                </p>
              </div>

              {/* Input Streams & Output Artifacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2">
                  <div className="font-bold text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" /> Ingested Inputs
                  </div>
                  <div className="space-y-1 text-slate-700 text-[11px] font-medium">
                    {selectedAgent.inputs.map((inp, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                        <span>{inp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <div className="font-bold text-emerald-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Emitted Outputs
                  </div>
                  <div className="space-y-1 text-slate-700 text-[11px] font-medium">
                    {selectedAgent.outputs.map((out, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span>{out}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Model Backbone */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-medium">
                <span className="text-slate-600">Underlying Model Backbone:</span>
                <span className="font-mono font-bold text-blue-700">{selectedAgent.model}</span>
              </div>

            </div>
          </div>

          {/* Neural Prompt & Rule Logic Viewer (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4 h-full flex flex-col justify-between">
              
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-blue-600" /> Autonomous Rule Engine
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">ISO 37120</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-800 leading-relaxed max-h-80 overflow-y-auto space-y-2">
                  <div className="text-slate-500">// System Prompt Instruction for {selectedAgent.name}</div>
                  <div className="text-blue-700 font-bold">@AgentRole: "{selectedAgent.role}"</div>
                  <div className="text-slate-600">
                    1. Intercept raw payload from previous agent stream.
                  </div>
                  <div className="text-slate-600">
                    2. Apply spatial Bayesian clustering on Ward 1-18 GIS database.
                  </div>
                  <div className="text-slate-600">
                    3. Compute multi-factor risk gradient based on child pedestrian proximity, hospital corridors, and rain forecast.
                  </div>
                  <div className="text-emerald-700 font-bold">
                    4. Emit structured JSON telemetry to Central Dispatch Bus.
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={onNavigateToReport}
                  className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <span>Test with Live Issue Submission</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
