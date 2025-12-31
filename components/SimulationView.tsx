
import React, { useEffect, useState, useMemo } from 'react';
import { Box, Activity, Zap, Navigation, Eye, Camera, Shield, Cpu, Target } from 'lucide-react';

interface SimulationViewProps {
  status: 'idle' | 'running' | 'completed';
  metrics: { name: string; value: number }[];
}

export const SimulationView: React.FC<SimulationViewProps> = ({ status, metrics }) => {
  const [frame, setFrame] = useState(0);
  const [viewMode, setViewMode] = useState<'follow' | 'drone'>('follow');

  useEffect(() => {
    if (status === 'running') {
      let requestRef: number;
      const animate = () => {
        setFrame((prev) => (prev + 1) % 1000);
        requestRef = requestAnimationFrame(animate);
      };
      requestRef = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef);
    }
  }, [status]);

  // Environment data
  const environment = useMemo(() => {
    return [...Array(10)].map((_, i) => ({
      id: i,
      x: i % 2 === 0 ? -180 - (Math.random() * 50) : 180 + (Math.random() * 50),
      zOffset: i * 150,
      type: i % 3 === 0 ? 'building' : 'infrastructure',
      height: 40 + Math.random() * 80,
      width: 40 + Math.random() * 30,
      color: i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-700'
    }));
  }, []);

  const speed = metrics.find(m => m.name.toLowerCase().includes('speed'))?.value || 0;
  const currentSpeed = status === 'running' ? (speed + Math.sin(frame/10) * 2) : 0;
  
  // Simulation logic for visual effects
  const steerAngle = status === 'running' ? Math.sin(frame / 40) * 15 : 0;
  const isBraking = status === 'running' && Math.sin(frame / 60) < -0.8;
  const obstacleDetected = status === 'running' && frame % 400 > 300;

  return (
    <div className="relative w-full h-[450px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group select-none">
      {/* 3D World */}
      <div 
        className="absolute inset-0 overflow-hidden transition-all duration-1000 ease-in-out"
        style={{ 
          perspective: '1200px', 
          perspectiveOrigin: viewMode === 'follow' ? '50% 45%' : '50% 15%' 
        }}
      >
        {/* Skybox */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#1e293b_0%,#020617_100%)]" />
        
        {/* Road & Ground */}
        <div 
          className="absolute top-1/2 left-1/2 w-[400%] h-[400%] origin-top transition-all duration-1000"
          style={{ 
            transform: `translateX(-50%) rotateX(${viewMode === 'follow' ? '75deg' : '88deg'})`,
            background: `
              linear-gradient(to bottom, transparent 0%, #020617 100%),
              linear-gradient(90deg, transparent 49.5%, rgba(59, 130, 246, 0.4) 49.8%, rgba(59, 130, 246, 0.4) 50.2%, transparent 50.5%),
              repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 100px)
            `,
            backgroundPosition: `0 0, 0 0, 0 ${status === 'running' ? frame * 12 : 0}px`
          }}
        >
          {/* Projected Intent Path (Ribbon) */}
          {status === 'running' && (
            <div 
              className="absolute left-1/2 top-0 bottom-1/2 w-48 -translate-x-1/2 opacity-30 transition-transform duration-500"
              style={{
                background: 'linear-gradient(to top, #3b82f6, transparent)',
                transform: `translateX(calc(-50% + ${steerAngle * 2}px)) skewX(${steerAngle}deg)`,
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
              }}
            />
          )}
        </div>

        {/* Passing Objects */}
        <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
          {environment.map((obj) => {
            const zPos = ((status === 'running' ? frame * 12 : 0) + obj.zOffset) % 1500;
            const opacity = 1 - (zPos / 1500);
            return (
              <div 
                key={obj.id}
                className={`absolute ${obj.color} border border-slate-600/20`}
                style={{
                  left: `calc(50% + ${obj.x}px)`,
                  bottom: '40%',
                  width: `${obj.width}px`,
                  height: `${obj.height}px`,
                  transform: `translateZ(${-zPos}px)`,
                  transformStyle: 'preserve-3d',
                  opacity: status === 'idle' ? 0 : opacity
                }}
              >
                <div className="absolute top-0 left-full h-full w-40 bg-slate-900 origin-left rotate-y-90" />
                <div className="absolute bottom-full left-0 w-full h-40 bg-slate-800 origin-bottom rotate-x-90" />
              </div>
            );
          })}

          {/* Virtual Obstacle Detection */}
          {obstacleDetected && (
            <div 
              className="absolute bg-red-500/10 border-2 border-red-500/50 rounded-lg animate-pulse"
              style={{
                left: 'calc(50% + 40px)',
                bottom: '45%',
                width: '60px',
                height: '40px',
                transform: `translateZ(-400px)`,
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] bg-red-500 text-white px-1 font-bold rounded">
                OBJECT_DETECTED
              </div>
            </div>
          )}
        </div>

        {/* The Digital Twin Vehicle */}
        <div 
          className={`absolute left-1/2 bottom-28 -translate-x-1/2 transition-all duration-700 ${status === 'idle' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
          style={{ 
            transformStyle: 'preserve-3d',
            transform: `translateX(-50%) rotateX(-2deg) rotateY(${steerAngle/2}deg)`
          }}
        >
          {/* Dynamic Safety Bubble */}
          <div 
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 rounded-full transition-colors duration-300 ${obstacleDetected ? 'border-red-500/50 bg-red-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}
            style={{ transform: 'rotateX(90deg) translateZ(-10px)' }}
          />

          {/* Advanced Voxel Car */}
          <div className="relative w-32 h-12" style={{ transformStyle: 'preserve-3d' }}>
            {/* Chassis Shell */}
            <div className="absolute inset-0 bg-blue-700/80 border border-blue-400/50 backdrop-blur-sm" style={{ transform: 'translateZ(5px)' }} />
            
            {/* internal "Service" Nodes (Glows) */}
            <div className="absolute top-2 left-4 w-4 h-4 bg-cyan-400 rounded-full blur-md animate-pulse" />
            <div className="absolute top-2 right-4 w-4 h-4 bg-green-400 rounded-full blur-md animate-pulse" />
            
            {/* Cockpit / Processing Unit */}
            <div 
              className="absolute -top-6 left-8 right-8 h-10 bg-slate-900/60 border border-blue-400/30 backdrop-blur-xl"
              style={{ transform: 'translateZ(20px)' }}
            >
               <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent" />
               {/* Internal Tag */}
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[6px] font-bold text-blue-400 whitespace-nowrap">MAIN_ECU_V3</div>
            </div>

            {/* Steerable Wheels */}
            {/* Front Left */}
            <div className="absolute bottom-[-8px] left-[80px] w-8 h-8 bg-slate-900 border-2 border-slate-700 rounded-full transition-transform"
                 style={{ transform: `translateZ(20px) rotateY(${steerAngle}deg) rotateX(${frame * 20}deg)` }} />
            {/* Front Right */}
            <div className="absolute bottom-[-8px] left-[80px] w-8 h-8 bg-slate-900 border-2 border-slate-700 rounded-full transition-transform"
                 style={{ transform: `translateZ(-8px) rotateY(${steerAngle}deg) rotateX(${frame * 20}deg)` }} />
            {/* Rear Wheels */}
            {[-8, 20].map(z => (
              <div key={z} className="absolute bottom-[-8px] left-[10px] w-8 h-8 bg-slate-900 border-2 border-slate-700 rounded-full"
                   style={{ transform: `translateZ(${z}px) rotateX(${frame * 20}deg)` }} />
            ))}

            {/* Lights */}
            <div className={`absolute -left-1 top-2 bottom-2 w-1 transition-all ${isBraking ? 'bg-red-500 shadow-[0_0_30px_red]' : 'bg-red-900 shadow-none'}`} />
            <div className="absolute -right-1 top-2 bottom-2 w-1 bg-blue-100 shadow-[0_0_20px_white]" />

            {/* Understanding Overlay (Tags) */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
               <div className="bg-slate-900/90 border border-blue-500/50 px-2 py-1 rounded flex items-center gap-2 shadow-2xl">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span className="text-[9px] text-white font-mono uppercase">Perception_Active</span>
               </div>
               <div className="h-10 w-[1px] bg-gradient-to-b from-blue-500/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating UI Elements */}
      <div className="absolute top-6 left-6 z-40 space-y-3">
        <div className="flex items-center gap-3 bg-slate-900/95 backdrop-blur-lg px-4 py-2.5 rounded-2xl border border-slate-800 shadow-2xl">
          <div className={`w-2.5 h-2.5 rounded-full ${status === 'running' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-slate-600'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Vehicle State</span>
            <span className="text-xs font-bold text-white uppercase">{status === 'running' ? 'SDV Core Online' : 'Standby'}</span>
          </div>
        </div>

        {/* Sensor Status Indicators */}
        <div className="flex gap-2">
          {['Lidar', 'Radar', 'Vision', 'IMU'].map(sensor => (
            <div key={sensor} className="bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-2.5 h-2.5 text-blue-500" />
              <span className="text-[8px] text-slate-400 font-bold uppercase">{sensor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div className="absolute top-6 right-6 z-40">
        <button 
          onClick={() => setViewMode(v => v === 'follow' ? 'drone' : 'follow')}
          className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2 group/btn"
        >
          {viewMode === 'follow' ? <Camera className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="text-[10px] font-bold uppercase tracking-tighter max-w-0 overflow-hidden group-hover/btn:max-w-[100px] transition-all duration-300">
             Switch View
          </span>
        </button>
      </div>

      {/* Simplified Telemetry Bar */}
      <div className="absolute bottom-6 left-6 right-6 z-40 grid grid-cols-4 gap-4">
        {metrics.slice(0, 4).map((m, i) => (
          <div key={i} className="bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800/80 shadow-2xl group/metric">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{m.name}</span>
              <Target className="w-3 h-3 text-slate-600 group-hover/metric:text-blue-500 transition-colors" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-mono font-black text-white">
                {status === 'running' ? (m.value + Math.sin(frame/20) * (m.value * 0.02)).toFixed(1) : m.value}
              </span>
              <span className="text-[9px] text-slate-600 font-bold">NOMINAL</span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State Overlay */}
      {status === 'idle' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500 max-w-sm px-8">
            <div className="w-20 h-20 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center border border-blue-500/20 mb-8 relative">
              <Shield className="w-10 h-10 text-blue-500 relative z-10" />
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Awaiting SoA Synthesis</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Describe a vehicle feature and click <b>Synthesize</b>. We'll generate the ISO-compliant architecture and a 3D Digital Twin will simulate the logic in real-time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal Lucide icons for this component
const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);
