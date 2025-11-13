'use client';

interface DeleteConfirmModalProps {
  repoName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  repoName,
  onConfirm,
  onCancel
}: DeleteConfirmModalProps) {
  return (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
            Delete Repository
          </h3>

          <p className="text-sm text-gray-600 dark:text-white/60 text-center mb-6">
            Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">&quot;{repoName}&quot;</span>? This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white rounded-xl transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}