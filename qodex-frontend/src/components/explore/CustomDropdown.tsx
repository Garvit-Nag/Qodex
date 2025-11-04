'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Repository } from '@/types';

interface CustomDropdownProps {
  repositories: Repository[];
  selectedRepo: Repository | null;
  onRepoSelect: (repo: Repository) => void;
  getRepoStatus: (repo: Repository) => string;
  onOpenChange: (isOpen: boolean) => void; // Add this prop
}

export default function CustomDropdown({ 
  repositories, 
  selectedRepo, 
  onRepoSelect, 
  getRepoStatus,
  onOpenChange
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const readyRepos = repositories.filter(repo => getRepoStatus(repo).toLowerCase() === 'ready');

  useEffect(() => {
    onOpenChange(isOpen); // Notify parent when dropdown opens/closes
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (repo: Repository) => {
    onRepoSelect(repo);
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white/80 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/15 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white text-sm transition-all duration-300 backdrop-blur-sm shadow-lg"
      >
        <span className="truncate">
          {selectedRepo ? selectedRepo.name : 'Select Repository'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - Super high z-index */}
      {/* Dropdown Menu - True black/gray colors, no blue tint */}
{isOpen && (
  <div className="absolute top-full left-0 right-0 mt-2 z-[9999] bg-white/98 dark:bg-black/95 backdrop-blur-md border border-gray-300 dark:border-white/20 rounded-xl shadow-2xl overflow-hidden">
    <div className="max-h-60 overflow-y-auto custom-scrollbar">
      {readyRepos.length === 0 ? (
        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
          No repositories ready for chat
        </div>
      ) : (
        readyRepos.map((repo) => (
          <button
            key={repo.$id}
            onClick={() => handleSelect(repo)}
            className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 ${
              selectedRepo?.$id === repo.$id
                ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="truncate">{repo.name}</span>
              {selectedRepo?.$id === repo.$id && (
                <div className="w-2 h-2 bg-gray-900 dark:bg-gray-200 rounded-full"></div>
              )}
            </div>
          </button>
        ))
      )}
    </div>
  </div>
)}
    </div>
  );
}