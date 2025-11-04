'use client';

interface ProcessingOverlayProps {
  repositoryName: string;
}

export default function ProcessingOverlay({ repositoryName }: ProcessingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-sm w-full mx-4 text-center border border-gray-200 dark:border-gray-700">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 dark:border-gray-700 dark:border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Processing Repository
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
          {repositoryName}
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-xs">
          This usually takes 2-5 minutes
        </p>
      </div>
    </div>
  );
}