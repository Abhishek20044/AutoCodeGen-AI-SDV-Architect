
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { AlertCircle, RefreshCw, ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';

interface DiagramViewerProps {
  definition: string;
  id: string;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({ definition, id }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Zoom and Pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      fontFamily: 'JetBrains Mono',
      themeVariables: {
        darkMode: true,
        background: '#0f172a',
        primaryColor: '#1e293b',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#3b82f6',
        lineColor: '#64748b',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        mainBkg: '#1e293b',
        nodeBorder: '#3b82f6',
        clusterBkg: '#0f172a',
        titleColor: '#60a5fa',
        edgeLabelBackground: '#0f172a',
        nodeTextColor: '#f1f5f9',
        // Class Diagram specific colors (limited support in some versions, but base theme allows overrides)
        classText: '#f8fafc',
      }
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!definition) return;
      
      setError(null);
      setIsRendering(true);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      
      await new Promise(resolve => setTimeout(resolve, 50));

      if (containerRef.current) {
        try {
          containerRef.current.innerHTML = '';
          const uniqueId = `mermaid-${id}-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(uniqueId, definition);
          
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
            const svgEl = containerRef.current.querySelector('svg');
            if (svgEl) {
              svgEl.style.maxWidth = '100%';
              svgEl.style.height = 'auto';
              
              // Apply custom styles to visibility modifiers if they exist in the text elements
              // Note: This is a best-effort approach as Mermaid renders text as <text> tags
              const textNodes = svgEl.querySelectorAll('text');
              textNodes.forEach(node => {
                const content = node.textContent || '';
                if (content.startsWith('+')) {
                  node.setAttribute('fill', '#4ade80'); // Green for public
                } else if (content.startsWith('-')) {
                  node.setAttribute('fill', '#f87171'); // Red for private
                } else if (content.startsWith('#')) {
                  node.setAttribute('fill', '#fbbf24'); // Yellow for protected
                } else if (content.startsWith('~')) {
                  node.setAttribute('fill', '#818cf8'); // Indigo for package
                }
              });
            }
          }
        } catch (err: any) {
          console.error('Mermaid render error:', err);
          setError('Failed to render architecture diagram. Syntax verification required.');
        } finally {
          setIsRendering(false);
        }
      }
    };

    renderDiagram();
  }, [definition, id]);

  const handleWheel = (e: React.WheelEvent) => {
    if (isRendering || error) return;
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = 1.1;
    const newScale = delta > 0 ? scale * factor : scale / factor;
    setScale(Math.max(0.1, Math.min(newScale, 10)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isRendering || error) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative w-full min-h-[450px] bg-slate-950/50 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center overflow-hidden group"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <style>{`
        /* Custom CSS injection for SVG text highlighting */
        .mermaid svg text { font-family: 'JetBrains Mono', monospace !important; font-size: 13px !important; }
        .mermaid .classTitle { font-weight: bold; fill: #60a5fa !important; }
        .mermaid .method { font-style: italic; }
      `}</style>

      {/* Controls Toolbar */}
      {!isRendering && !error && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => setScale(s => Math.min(s * 1.2, 10))}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setScale(s => Math.max(s / 1.2, 0.1))}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button 
            onClick={resetView}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
            title="Reset View"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg text-[10px] text-slate-500 font-mono text-center">
            {Math.round(scale * 100)}%
          </div>
        </div>
      )}

      {/* Navigation Hint */}
      {!isRendering && !error && (
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-full border border-slate-800 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Move className="w-3 h-3" />
          <span>Drag to pan • Scroll to zoom • Color-coded Visibility</span>
        </div>
      )}

      {isRendering && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            <span className="text-xs font-medium text-slate-400 tracking-wider">Compiling UML Visualization...</span>
          </div>
        </div>
      )}

      {error ? (
        <div className="max-w-md w-full p-8 bg-red-500/5 border border-red-500/10 rounded-2xl flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in duration-300">
          <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-base font-bold text-red-200">UML Render Error</h4>
            <p className="text-xs text-red-400/70 leading-relaxed">
              {error}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 mt-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-[10px] uppercase tracking-widest font-bold text-slate-300 transition-all"
          >
            Regenerate Model
          </button>
        </div>
      ) : (
        <div 
          ref={transformRef}
          className="w-full h-full flex justify-center items-center transition-opacity duration-500 p-8"
          style={{ 
            opacity: isRendering ? 0 : 1,
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
        >
          <div ref={containerRef} className="w-full h-full flex items-center justify-center select-none pointer-events-none mermaid" />
        </div>
      )}
    </div>
  );
};
