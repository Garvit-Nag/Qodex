'use client';

import { useEffect, useState } from 'react';

interface CircularProgressProps {
  percentage: number;
  used: number;
  total: number;
}

export default function CircularProgress({ percentage, used, total }: CircularProgressProps) {
  const [animatedUsed, setAnimatedUsed] = useState(0);
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  const radius = 120;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  const getColor = () => {
    if (animatedPercentage >= 90) return '#ef4444'; // red
    if (animatedPercentage >= 75) return '#f59e0b'; // yellow
    return '#10b981'; // green
  };

  useEffect(() => {
    if (hasAnimated) return;

    // Counter animation for the number
    const duration = 2500; // 2.5 seconds for smoother animation
    const steps = 100; // More steps for smoother animation
    const stepDuration = duration / steps;
    let currentStep = 0;

    const counterInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      // Stronger ease-out for fast start, gradual slow
      const easeOut = 1 - Math.pow(1 - progress, 4);
      
      setAnimatedUsed(Math.round(easeOut * used));
      setAnimatedPercentage(easeOut * percentage);

      if (currentStep >= steps) {
        clearInterval(counterInterval);
        setAnimatedUsed(used);
        setAnimatedPercentage(percentage);
        setHasAnimated(true);
      }
    }, stepDuration);

    return () => clearInterval(counterInterval);
  }, [used, percentage, hasAnimated]);

  // Update immediately if values change after initial animation
  useEffect(() => {
    if (hasAnimated) {
      setAnimatedUsed(used);
      setAnimatedPercentage(percentage);
    }
  }, [used, percentage, hasAnimated]);

  return (
    <div className="relative">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle with animation */}
        <circle
          stroke={getColor()}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{ 
            strokeDashoffset,
            transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease'
          }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
          {animatedUsed}/{total}
        </div>
        <div className="text-base text-gray-600 dark:text-gray-400 mt-1">
          repositories
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          {Math.max(0, total - animatedUsed)} remaining
        </div>
      </div>
    </div>
  );
}