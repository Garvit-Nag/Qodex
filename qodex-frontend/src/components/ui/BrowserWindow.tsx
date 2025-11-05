'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, RotateCw, MoreVertical } from 'lucide-react';

interface BrowserWindowProps {
  className?: string;
}

export default function BrowserWindow({ className = "" }: BrowserWindowProps) {
  const [currentScreenshot, setCurrentScreenshot] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreenshot(prev => prev === 3 ? 1 : prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`bg-white/10 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl shadow-2xl overflow-hidden ${className}`}>
      {/* Browser Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/20 dark:bg-white/10 border-b border-gray-300 dark:border-white/20">
        {/* Left Side - Navigation Controls */}
        <div className="flex items-center space-x-1.5">
          <button className="w-5 h-5 rounded flex items-center justify-center text-gray-700 dark:text-white hover:bg-white/20 dark:hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button className="w-5 h-5 rounded flex items-center justify-center text-gray-400 opacity-50 cursor-not-allowed">
            <ChevronLeft className="w-3 h-3 rotate-180" />
          </button>
          <button className="w-5 h-5 rounded flex items-center justify-center text-gray-700 dark:text-white hover:bg-white/20 dark:hover:bg-white/10 transition-colors">
            <RotateCw className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Center - URL Bar */}
        <div className="flex-1 mx-3">
          <div className="bg-white/30 dark:bg-white/10 rounded-md px-2 py-1 text-xs text-gray-700 dark:text-gray-300 font-mono">
            https://qodex-gules.vercel.app
          </div>
        </div>

        {/* Right Side - Menu */}
        <div className="flex items-center">
          <button className="w-5 h-5 rounded flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-white/10 transition-colors">
            <MoreVertical className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* Screenshot Content */}
      <div className="relative h-[450px] bg-white dark:bg-gray-900 overflow-hidden">

        {[1, 2, 3].map((num) => (
          <div
            key={num}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${currentScreenshot === num
                ? 'opacity-100 transform translate-x-0'
                : currentScreenshot < num
                  ? 'opacity-0 transform translate-x-full'
                  : 'opacity-0 transform -translate-x-full'
              }`}
          >
            <Image
              src={`/s${num}.jpg`}
              alt={`Qodex Screenshot ${num}`}
              fill
              className="object-cover object-top"
              priority={num === 1}
            />
          </div>
        ))}

        {/* Navigation Dots */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setCurrentScreenshot(num)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${currentScreenshot === num
                  ? 'bg-white dark:bg-gray-200 scale-125'
                  : 'bg-white/50 dark:bg-gray-400 hover:bg-white/70 dark:hover:bg-gray-300'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}