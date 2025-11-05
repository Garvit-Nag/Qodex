export interface User {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface UserProfile {
  $id: string;
  subscription_tier: 'free' | 'premium';
  repos_uploaded_count: number;
  max_repos_allowed: number;
  repos_uploaded_this_month: number;
  month_reset_date: string;
  subscription_status: 'active' | 'cancelled' | 'expired';
  subscription_id?: string;
  plan_id?: string;
  next_billing_date?: string;
  subscription_created_at?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Repository {
  $id: string;
  repository_id: number;
  user_id: string;
  name: string;
  github_url: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  error_message?: string;
  storage_file_id?: string;
  quota_used: boolean;
  $createdAt: string;
  $updatedAt: string;
}

export interface Citation {
  file_path: string;
  start_line: number;
  end_line: number;
  similarity: number;
  preview: string;
}

export interface Message {
  $id: string;
  message_id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  $createdAt: string;
}

export interface Conversation {
  $id: string;
  conversation_id: number;
  repository_id: number;
  last_message_id?: number;
  last_updated_at: string;
  $createdAt: string;
  $updatedAt: string;
}