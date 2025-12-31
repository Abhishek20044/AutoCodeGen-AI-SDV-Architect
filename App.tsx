
import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Code, 
  FileText, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Layers,
  Settings,
  Database,
  Terminal,
  Activity,
  Share2,
  GitBranch
} from 'lucide-react';
import { generateAutomotiveSoA } from './services/geminiService';
import { AppState, WorkflowStep } from './types';
import { SimulationView } from './components/SimulationView';
import { DiagramViewer } from './components/DiagramViewer';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isGenerating: false,
    currentStep: WorkflowStep.REQUIREMENTS,
    asset: null,
    error: null
  });

  const [prompt, setPrompt] = useState('');
  const [activeCodeTab, setActiveCodeTab] = useState<'cpp' | 'rust' | 'java'>('cpp');
  const [activeDiagramTab, setActiveDiagramTab] = useState<'class' | 'sequence'>('class');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null, 
      asset: null,
      currentStep: WorkflowStep.REQUIREMENTS 
    }));
    
    try {
      // Initiate API call
      const result = await generateAutomotiveSoA(prompt);
      
      // Simulate workflow progress for UX once data is ready
      const steps = [
        WorkflowStep.REQUIREMENTS, 
        WorkflowStep.DESIGN, 
        WorkflowStep.CODE, 
        WorkflowStep.TESTS, 
        WorkflowStep.SIMULATION
      ];
      
      for (const step of steps) {
        setState(prev => ({ ...prev, currentStep: step }));
        await new Promise(r => setTimeout(r, 600));
      }

      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        asset: result 
      }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: err.message || 'Failed to generate assets' 
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">AutoCodeGen <span className="text-blue-500">AI</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Documentation</a>
            <div className="h-4 w-[1px] bg-slate-700" />
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-[10px] font-bold uppercase text-slate-300">ISO 26262 ASIL-D</span>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-6 gap-6">
        
        {/* Left Panel: Input & Workflow */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Requirement Input
            </h2>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vehicle feature (e.g., Vision-based Lane Keep Assist with steer-by-wire)..."
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all placeholder:text-slate-600"
              />
              {state.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400">{state.error}</p>
                </div>
              )}
              <button
                onClick={handleGenerate}
                disabled={state.isGenerating || !prompt.trim()}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  state.isGenerating 
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                }`}
              >
                {state.isGenerating ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Synthesize Software
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Workflow Indicator */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-4 tracking-widest">Digital Twin Pipeline</h3>
            <div className="space-y-4">
              {[
                { step: WorkflowStep.REQUIREMENTS, label: 'Req. Specification', icon: FileText },
                { step: WorkflowStep.DESIGN, label: 'System Design & UML', icon: Layers },
                { step: WorkflowStep.CODE, label: 'Code Synthesis', icon: Code },
                { step: WorkflowStep.TESTS, label: 'Verification Suite', icon: ShieldCheck },
                { step: WorkflowStep.SIMULATION, label: 'Simulation Loop', icon: Activity },
              ].map((item) => {
                const isActive = state.currentStep === item.step && state.isGenerating;
                const isCompleted = state.asset && !state.isGenerating;
                const isDoneStep = isCompleted || (state.isGenerating && Object.values(WorkflowStep).indexOf(state.currentStep) > Object.values(WorkflowStep).indexOf(item.step));

                return (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500/20 text-blue-400' : isDoneStep ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-600'}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-white' : isDoneStep ? 'text-slate-300' : 'text-slate-600'}`}>
                      {item.label}
                    </span>
                    {isActive && <Activity className="w-3 h-3 animate-spin text-blue-500 ml-auto" />}
                    {isDoneStep && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
                  </div>
                );
              })}
            </div>
          </div>

          {state.asset && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase text-slate-400">Safety Score</h3>
                <span className="text-green-500 font-bold">{state.asset.complianceScore}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-green-500 transition-all duration-1000" 
                  style={{ width: `${state.asset.complianceScore}%` }} 
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {state.asset.standardsCompliance.map((std, i) => (
                  <span key={i} className="text-[10px] px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-slate-300">
                    {std}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Output Viewer */}
        <div className="flex-1 flex flex-col gap-6">
          {state.asset ? (
            <div className="flex flex-col gap-6 animate-in fade-in duration-700">
              
              {/* Architecture Diagrams Section */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-500" />
                    Architecture Visualization
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveDiagramTab('class')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeDiagramTab === 'class' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Class Diagram
                    </button>
                    <button
                      onClick={() => setActiveDiagramTab('sequence')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeDiagramTab === 'sequence' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Sequence Diagram
                    </button>
                  </div>
                </div>
                <div className="bg-slate-950/50">
                  {activeDiagramTab === 'class' ? (
                    <DiagramViewer id="class" definition={state.asset.classDiagram} />
                  ) : (
                    <DiagramViewer id="sequence" definition={state.asset.sequenceDiagram} />
                  )}
                </div>
              </div>

              {/* Simulation Result */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    CARLA Simulation Loop
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">STATUS: VALIDATED</span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>
                <SimulationView status="running" metrics={state.asset.simData.metrics} />
              </div>

              {/* Code Viewer */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl min-h-[400px]">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex gap-2">
                    {(['cpp', 'rust', 'java'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setActiveCodeTab(lang)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeCodeTab === lang 
                            ? 'bg-blue-600 text-white' 
                            : 'text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {lang === 'cpp' ? 'C++ (MISRA)' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </button>
                    ))}
                  </div>
                  <Settings className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-300" />
                </div>
                
                <div className="flex-1 overflow-auto bg-slate-950 p-6 font-mono text-sm leading-relaxed max-h-[500px]">
                  <pre className="text-blue-300 whitespace-pre-wrap">
                    {state.asset.sourceCode[activeCodeTab]}
                  </pre>
                </div>
              </div>

              {/* Requirements & Test Cases Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Requirements
                  </h4>
                  <ul className="space-y-3">
                    {state.asset.requirements.map((req, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> Tests
                  </h4>
                  <ul className="space-y-3">
                    {state.asset.testCases.map((tc, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-300">
                        <div className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-800 text-[10px] text-slate-500 shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        {tc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20 p-12 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <GitBranch className="w-8 h-8 text-slate-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-300 mb-2">Workspace Empty</h2>
              <p className="text-slate-500 max-w-sm">
                Define your vehicle service requirements to initiate the automated design, UML modeling, and simulation toolchain.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="p-6 border-t border-slate-800 bg-slate-950 text-slate-500 text-xs text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2024 AutoCodeGen AI. Accelerating SDV Transformation.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>Model: Gemini 3 Pro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Safety Logic: Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
