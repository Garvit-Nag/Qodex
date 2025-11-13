import { databases, DATABASE_ID, USER_PROFILES_COLLECTION_ID, MESSAGES_COLLECTION_ID, Query } from '@/lib/appwrite';
import { UserProfile } from '@/types';

export const checkAndResetMonthlyQuota = async (userProfile: UserProfile): Promise<UserProfile> => {
  const currentMonth = new Date().toISOString().substring(0, 7); // "2025-11"
  
  if (userProfile.month_reset_date !== currentMonth) {
    console.log('🔄 Resetting monthly quota for new month:', currentMonth);
    
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

export const canUploadRepository = async (userProfile: UserProfile): Promise<boolean> => {
  const updatedProfile = await checkAndResetMonthlyQuota(userProfile);
  
  const limit = userProfile.subscription_tier === 'premium' ? 30 : 10;
  return updatedProfile.repos_uploaded_this_month < limit;
};

export const getConversationMessageCount = async (conversationId: number, userId: string): Promise<number> => {
  try {
    const messages = await databases.listDocuments(
      DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      [
        Query.equal('conversation_id', conversationId),
        Query.equal('user_id', userId),
        Query.equal('role', 'user') 
      ]
    );
    
    return messages.total;
  } catch (error) {
    console.error('Error counting messages:', error);
    return 0;
  }
};

export const canSendMessage = async (conversationId: number, userId: string, userProfile: UserProfile): Promise<boolean> => {
  if (userProfile.subscription_tier === 'premium') {
    return true;
  }
  
  const messageCount = await getConversationMessageCount(conversationId, userId);
  return messageCount < 25;
};

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