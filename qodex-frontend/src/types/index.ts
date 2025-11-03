/* eslint-disable @typescript-eslint/no-explicit-any */
import { Models } from 'appwrite';

// Base Appwrite Document interface
interface BaseDocument extends Models.Document {
  [key: string]: any;
}

// User related types
export interface User {
  $id: string;
  name: string;
  email: string;
  emailVerification?: boolean;
}

export interface UserProfile extends BaseDocument {
  subscription_tier: string;
  repos_uploaded_count: number;
  max_repos_allowed: number;
  $createdAt: string;
  $updatedAt: string;
}

// Repository related types
export interface Repository extends BaseDocument {
  repository_id: number;    // QODEX repository ID
  name: string;            // Repository name
  github_url: string;      // GitHub URL
  status: string;          // Status from QODEX API
  error_message?: string;  // Error message if failed
  storage_file_id?: string; // File storage ID (deprecated)
  quota_used: boolean;     // Quota usage flag
  user_id: string;         // User who owns it
}

// Conversation and Message types
export interface Conversation extends BaseDocument {
  user_id: string;
  repository_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message extends BaseDocument {
  conversation_id: string;
  user_id: string;
  content: string;
  message_type: 'user' | 'assistant';
  created_at: string;
}

// QODEX API response types
export interface QodexRepositoryResponse {
  id: number;
  name: string;
  github_url: string;
  user_id: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// Updated to match your actual backend response
export interface QodexChatResponse {
  response: string;
  sources: Array<{
    file_path: string;
    start_line: number;
    end_line: number;
    content?: string;        // Optional for compatibility
    preview?: string;        // Your backend uses this field
    similarity: number;
  }>;
  repository_name: string;
  context_chunks_used: number;
  model_used: string;
  success: boolean;
}

// Chat message interface for frontend
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    file_path: string;
    start_line: number;
    end_line: number;
    content?: string;        // Can be from direct chat
    preview?: string;        // Can be from chat history
    similarity: number;
  }>;
  timestamp: Date;
  model_used?: string;
  context_chunks_used?: number;
}

// Chat history response from backend
export interface QodexChatHistoryResponse {
  conversation_id: number;
  repository_id: number;
  user_id: string;
  messages: Array<{
    role: 'user' | 'assistant';
    conversation_id: number;
    citations: Array<{
      file_path: string;
      start_line: number;
      end_line: number;
      similarity: number;
      preview: string;       // Backend uses preview field
    }> | null;
    id: number;
    content: string;
    created_at: string;
  }>;
  total_messages: number;
}

// Component prop types
export interface RepositoryUploadProps {
  onUploadSuccess: () => void;
  userProfile: UserProfile | null;
}

export interface RepositoryListProps {
  repositories: Repository[];
  loading: boolean;
  onRepositoryDeleted: () => void;
}

export interface SubscriptionInfoProps {
  userProfile: UserProfile | null;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  sendVerificationEmail: () => Promise<boolean>;
  verifyEmail: (userId: string, secret: string) => Promise<boolean>;
}