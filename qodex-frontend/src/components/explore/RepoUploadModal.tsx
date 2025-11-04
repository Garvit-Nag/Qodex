'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { databases, DATABASE_ID, REPOSITORIES_COLLECTION_ID, ID } from '@/lib/appwrite';
import { UserProfile } from '@/types';
import { X, Github } from 'lucide-react';

interface RepoUploadModalProps {
  onClose: () => void;
  onUploadSuccess: () => void;
  userProfile: UserProfile | null;
}

export default function RepoUploadModal({ onClose, onUploadSuccess, userProfile }: RepoUploadModalProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [repoName, setRepoName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // CORRECT: Use monthly quota system (NEW WAY)
  const isAtLimit = userProfile ? userProfile.repos_uploaded_this_month >= userProfile.max_repos_allowed : false;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isAtLimit || loading) return;

    setLoading(true);
    setError('');

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

      // Send to QODEX backend
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

      // Create repository record
      await databases.createDocument(
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
        }
      );

      // Update user profile with monthly quota (NEW WAY)
      await databases.updateDocument(
        DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID!,
        user.$id,
        {
          repos_uploaded_this_month: (userProfile?.repos_uploaded_this_month || 0) + 1,
          repos_uploaded_count: (userProfile?.repos_uploaded_count || 0) + 1, // Keep total count too
        }
      );

      onUploadSuccess();

    } catch (err: any) {
      console.error('Repository upload failed:', err);
      setError(err.message || 'Failed to upload repository. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-4 max-w-lg w-full border border-border">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-foreground mb-1">
            Add Repository
          </h2>
          <p className="text-muted-foreground text-sm">
            Upload a GitHub repository to start chatting
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Repository URL */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              GitHub Repository URL *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Github className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="url"
                required
                value={repoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full pl-10 pr-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-background text-foreground"
                disabled={loading || isAtLimit}
              />
            </div>
          </div>

          {/* Repository Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="Auto-filled from URL"
              className="w-full px-3 py-3 border border-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-background text-foreground"
              disabled={loading || isAtLimit}
            />
          </div>

          {/* Monthly Quota Info (NEW WAY) */}
          {userProfile && (
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <div className="text-xs text-muted-foreground">
                Using {userProfile.repos_uploaded_this_month} of {userProfile.max_repos_allowed} repositories this month
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-lg border border-border text-foreground hover:bg-muted transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isAtLimit || !repoUrl.trim()}
              className="flex-1 py-2 px-4 rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white dark:text-black transition-colors text-sm"
            >
              {loading ? 'Adding...' : isAtLimit ? 'Monthly Limit Reached' : 'Add Repository'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}