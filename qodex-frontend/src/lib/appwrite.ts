import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

export const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const REPOSITORIES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_REPOSITORIES_COLLECTION_ID!;
export const USER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID!;
export const CONVERSATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_CONVERSATIONS_COLLECTION_ID!;
export const MESSAGES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID!;
export const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;

export { ID, Query };

export type * from '@/types/appwrite';