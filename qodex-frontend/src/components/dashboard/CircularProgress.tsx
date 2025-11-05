'use client';

interface CircularProgressProps {
  percentage: number;
  used: number;
  total: number;
}

export default function CircularProgress({ percentage, used, total }: CircularProgressProps) {
  const radius = 120; // Increased from 80
  const strokeWidth = 12; // Increased from 8
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 90) return '#ef4444'; // red
    if (percentage >= 75) return '#f59e0b'; // yellow
    return '#10b981'; // green
  };

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
        {/* Progress circle */}
        <circle
          stroke={getColor()}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-gray-900 dark:text-white">
          {used}/{total}
        </div>
        <div className="text-base text-gray-600 dark:text-gray-400 mt-1">
          repositories
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          {Math.max(0, total - used)} remaining
        </div>
      </div>
    </div>
  );
}