import { databases, DATABASE_ID, USER_PROFILES_COLLECTION_ID, MESSAGES_COLLECTION_ID, Query } from '@/lib/appwrite';
import { UserProfile } from '@/types';

// Check and reset monthly quota if needed
export const checkAndResetMonthlyQuota = async (userProfile: UserProfile): Promise<UserProfile> => {
  const currentMonth = new Date().toISOString().substring(0, 7); // "2025-11"
  
  if (userProfile.month_reset_date !== currentMonth) {
    console.log('🔄 Resetting monthly quota for new month:', currentMonth);
    
    // Reset quota for new month
    const updatedProfile = await databases.updateDocument(
      DATABASE_ID,
      USER_PROFILES_COLLECTION_ID,
      userProfile.$id,
      {
        repos_uploaded_this_month: 0,
        month_reset_date: currentMonth
      }
    );
    
    return updatedProfile as unknown as UserProfile;
  }
  
  return userProfile;
};

// Check if user can upload more repositories this month
export const canUploadRepository = async (userProfile: UserProfile): Promise<boolean> => {
  const updatedProfile = await checkAndResetMonthlyQuota(userProfile);
  
  const limit = userProfile.subscription_tier === 'premium' ? 30 : 10;
  return updatedProfile.repos_uploaded_this_month < limit;
};

// Get user's message count for a specific conversation
export const getConversationMessageCount = async (conversationId: number, userId: string): Promise<number> => {
  try {
    const messages = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      [
        Query.equal('conversation_id', conversationId),
        Query.equal('user_id', userId),
        Query.equal('role', 'user') // Only count user messages
      ]
    );
    
    return messages.total;
  } catch (error) {
    console.error('Error counting messages:', error);
    return 0;
  }
};

// Check if user can send more messages in a conversation
export const canSendMessage = async (conversationId: number, userId: string, userProfile: UserProfile): Promise<boolean> => {
  // Premium users have unlimited messages
  if (userProfile.subscription_tier === 'premium') {
    return true;
  }
  
  // Free users limited to 25 messages per conversation
  const messageCount = await getConversationMessageCount(conversationId, userId);
  return messageCount < 25;
};

// Increment repository count for user
export const incrementRepositoryCount = async (userId: string): Promise<void> => {
  try {
    const userProfile = await databases.getDocument(
      DATABASE_ID,
      USER_PROFILES_COLLECTION_ID,
      userId
    );
    
    await databases.updateDocument(
      DATABASE_ID,
      USER_PROFILES_COLLECTION_ID,
      userId,
      {
        repos_uploaded_this_month: (userProfile.repos_uploaded_this_month || 0) + 1,
        repos_uploaded_count: (userProfile.repos_uploaded_count || 0) + 1
      }
    );
  } catch (error) {
    console.error('Error incrementing repository count:', error);
  }
};

// Get quota status for display
export const getQuotaStatus = async (userProfile: UserProfile) => {
  const updatedProfile = await checkAndResetMonthlyQuota(userProfile);
  const limit = userProfile.subscription_tier === 'premium' ? 30 : 10;
  
  return {
    used: updatedProfile.repos_uploaded_this_month,
    limit,
    remaining: limit - updatedProfile.repos_uploaded_this_month,
    percentage: Math.round((updatedProfile.repos_uploaded_this_month / limit) * 100)
  };
};