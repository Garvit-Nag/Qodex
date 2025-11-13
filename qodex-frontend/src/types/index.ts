/* eslint-disable @typescript-eslint/no-explicit-any */
import { Models } from 'appwrite';

interface BaseDocument extends Models.Document {
  [key: string]: any;
}

export interface User {
  $id: string;
  name: string;
  email: string;
  avatar?: string; 
  emailVerification?: boolean;
}

export interface UserProfile extends BaseDocument {
  subscription_tier: string;
  repos_uploaded_count: number;
  max_repos_allowed: number;
  repos_uploaded_this_month: number;
  month_reset_date: string;
  subscription_status: string;
  subscription_id?: string;
  plan_id?: string;
  next_billing_date?: string;
  subscription_created_at?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly';
  features: string[];
  razorpay_plan_id: string;
  repos_limit: number;
  message_limit: number | null;
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  razorpay_order_id: string;
  status: 'created' | 'paid' | 'failed';
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface Repository extends BaseDocument {
  repository_id: number;
  name: string;
  github_url: string;
  status: string;
  error_message?: string;
  storage_file_id?: string;
  quota_used: boolean;
  user_id: string;
}

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

export interface QodexChatResponse {
  response: string;
  sources: Array<{
    file_path: string;
    start_line: number;
    end_line: number;
    content?: string;
    preview?: string;
    similarity: number;
  }>;
  repository_name: string;
  context_chunks_used: number;
  model_used: string;
  success: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    file_path: string;
    start_line: number;
    end_line: number;
    content?: string;
    preview?: string;
    similarity: number;
  }>;
  timestamp: Date;
  model_used?: string;
  context_chunks_used?: number;
}

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
      preview: string;
    }> | null;
    id: number;
    content: string;
    created_at: string;
  }>;
  total_messages: number;
}

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