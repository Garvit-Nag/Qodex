'use client';

import { X, Crown, Check } from 'lucide-react';

interface PremiumAlertModalProps {
  onClose: () => void;
  onManageSubscription: () => void;
}

export default function PremiumAlertModal({ onClose, onManageSubscription }: PremiumAlertModalProps) {
  
  const handleManageSubscription = () => {
    onClose();
    onManageSubscription();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Already Premium!
          </h3>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            You&apos;re already on the <span className="font-semibold text-purple-600 dark:text-purple-400">Code Pro</span> plan and enjoying all premium features.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-300"
            >
              Close
            </button>
            
            <button
              onClick={handleManageSubscription}
              className="flex-1 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Manage Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}