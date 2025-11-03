/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { databases, DATABASE_ID, REPOSITORIES_COLLECTION_ID, ID } from '@/lib/appwrite';
import { RepositoryUploadProps, QodexRepositoryResponse } from '@/types';

export default function RepositoryUpload({ onUploadSuccess, userProfile }: RepositoryUploadProps) {
    const [repoUrl, setRepoUrl] = useState('');
    const [repoName, setRepoName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');

    const { user } = useAuth();

    const isAtLimit = userProfile ? userProfile.repos_uploaded_count >= userProfile.max_repos_allowed : false;

    // Debug environment variables
    console.log('🔍 Environment Variables Check:', {
        QODEX_API_URL: process.env.NEXT_PUBLIC_QODEX_API_URL,
        QODEX_CLIENT_SECRET: process.env.NEXT_PUBLIC_QODEX_CLIENT_SECRET,
        NODE_ENV: process.env.NODE_ENV
    });

    const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user || isAtLimit) return;

  setLoading(true);
  setError('');
  setProgress(0);
  setCurrentStep('Validating repository...');

  try {
    // Validate GitHub URL
    const githubUrlPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(\.git)?$/;
    const match = repoUrl.match(githubUrlPattern);
    
    if (!match) {
      throw new Error('Please provide a valid GitHub repository URL (e.g., https://github.com/user/repo)');
    }

    const [, owner, repoRaw] = match;
    const repo = repoRaw.replace(/\.git$/, '');
    const finalRepoName = repoName || `${owner}/${repo}`;

    setProgress(20);
    setCurrentStep('Sending to QODEX for processing...');

    // Send directly to QODEX backend for processing
    const response = await fetch(`${process.env.NEXT_PUBLIC_QODEX_API_URL}/api/v1/repositories/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Secret': process.env.NEXT_PUBLIC_QODEX_CLIENT_SECRET!,
        'X-User-ID': user.$id,
      },
      body: JSON.stringify({
        name: finalRepoName,
        github_url: `https://github.com/${owner}/${repo}`,
        user_id: user.$id,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: responseText || 'Unknown server error' };
      }
      throw new Error(errorData.detail || errorData.error || `Server error: ${response.status}`);
    }

    const qodexData = await response.json();
    console.log('✅ QODEX API Success:', qodexData);
    
    setProgress(60);
    setCurrentStep('Saving to database...');

    // Create repository record in Appwrite (without storage_file_id)
    const repoDocument = await databases.createDocument(
      DATABASE_ID,
      REPOSITORIES_COLLECTION_ID,
      ID.unique(),
      {
        repository_id: qodexData.id,
        name: finalRepoName,
        github_url: `https://github.com/${owner}/${repo}`,
        status: qodexData.status || 'pending',
        user_id: user.$id,
        quota_used: false,
        // Remove: storage_file_id field
      }
    );

    setProgress(80);
    setCurrentStep('Updating profile...');

    // Update user profile repository count
    await databases.updateDocument(
      DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID!,
      user.$id,
      {
        repos_uploaded_count: (userProfile?.repos_uploaded_count || 0) + 1,
      }
    );

    setProgress(100);
    setCurrentStep('Complete! 🎉');

    // Reset form
    setRepoUrl('');
    setRepoName('');
    
    onUploadSuccess();

    setTimeout(() => {
      setCurrentStep('');
      setProgress(0);
      setLoading(false);
    }, 2000);

  } catch (err: any) {
    console.error('❌ Repository upload failed:', err);
    setError(err.message || 'Failed to upload repository. Please try again.');
    setLoading(false);
    setProgress(0);
    setCurrentStep('');
  }
};

    // Auto-extract repo name from URL
    const handleUrlChange = (url: string) => {
        setRepoUrl(url);
        setError('');

        const githubUrlPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(\.git)?$/;
        const match = url.match(githubUrlPattern);

        if (match) {
            const [, owner, repo] = match;
            setRepoName(`${owner}/${repo}`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-6">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Upload Repository
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add a GitHub repository to your Qodex workspace
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            {loading && (
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>{currentStep}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Upload Form */}
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Repository URL */}
  <div>
    <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      GitHub Repository URL *
    </label>
    <input
      type="url"
      id="repo-url"
      required
      value={repoUrl}
      onChange={(e) => handleUrlChange(e.target.value)}
      placeholder="https://github.com/username/repository"
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      disabled={loading || isAtLimit}
    />
  </div>

  {/* Repository Name */}
  <div>
    <label htmlFor="repo-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Display Name
    </label>
    <input
      type="text"
      id="repo-name"
      value={repoName}
      onChange={(e) => setRepoName(e.target.value)}
      placeholder="Auto-filled from URL"
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      disabled={loading || isAtLimit}
    />
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    disabled={loading || isAtLimit || !repoUrl.trim()}
    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
      isAtLimit
        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        : loading
        ? 'bg-purple-400 text-white cursor-not-allowed'
        : 'bg-purple-600 hover:bg-purple-700 text-white'
    }`}
  >
    {loading ? (
      <span className="flex items-center justify-center">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing Repository...
      </span>
    ) : isAtLimit ? (
      'Repository Limit Reached'
    ) : (
      'Upload Repository'
    )}
  </button>
</form>

            {/* Help Text */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-1">How it works:</p>
                        <ul className="space-y-1 text-xs">
                            <li>• Your repository is processed by our AI system</li>
                            <li>• Code structure and content are analyzed</li>
                            <li>• Natural language search is enabled</li>
                            <li>• Repository data is securely stored</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}