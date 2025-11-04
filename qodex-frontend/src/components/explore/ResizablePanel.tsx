'use client';

import { useState, useRef, useEffect } from 'react';

interface ResizablePanelProps {
  width: number;
  onResize: (width: number) => void;
  minWidth: number;
  maxWidth: number;
  children: React.ReactNode;
}

export default function ResizablePanel({
  width,
  onResize,
  minWidth,
  maxWidth,
  children
}: ResizablePanelProps) {
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const newWidth = e.clientX - panelRef.current.getBoundingClientRect().left;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      onResize(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, minWidth, maxWidth, onResize]);

  return (
    <div 
      ref={panelRef}
      className="relative bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 rounded-3xl shadow-xl"
      style={{ width }}
    >
      {children}
      
      {/* Resize Handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-purple-400/50 transition-colors group"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-12 bg-gray-300/50 dark:bg-gray-600/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
    </div>
  );
}