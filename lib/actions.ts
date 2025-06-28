// lib/actions.ts
import { account, databases, storage, ID } from "./appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const LINKS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_LINKS_COLLECTION_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

export async function fetchLinks(userId: string) {
  try {
    const res = await databases.listDocuments(DATABASE_ID, LINKS_COLLECTION_ID, [
      Query.equal("userId", userId),
    ]);
    return res.documents;
  } catch (err) {
    console.error("Failed to fetch links", err);
    return [];
  }
}

export async function addLink({
  title,
  url,
  userId,
  icon = "",
  color = "#3b82f6",
  order = 1,
}: {
  title: string;
  url: string;
  userId: string;
  icon?: string;
  color?: string;
  order?: number;
}) {
  try {
    const res = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_LINKS_COLLECTION_ID!,
      ID.unique(),
      {
        title,
        url,
        userId,
        icon,
        color,
        order,
        clicks: 0, //  Add this line to satisfy schema
      }
    );
    return res;
  } catch (err) {
    console.error("Failed to add link", err);
    return null;
  }
}


export async function logout() {
  try {
    await account.deleteSession("current");
    localStorage.removeItem("lynks-user"); // ← clear cache
  } catch (err) {
    console.error("Logout failed", err);
  }
}

export async function updateLink(linkId: string, updates: Partial<{ title: string; url: string; icon: string; color: string; order: number }>) {
  try {
    const res = await databases.updateDocument(DATABASE_ID, LINKS_COLLECTION_ID, linkId, updates);
    return res;
  } catch (err) {
    console.error("Failed to update link", err);
    return null;
  }
}

export async function deleteLink(linkId: string) {
  try {
    await databases.deleteDocument(DATABASE_ID, LINKS_COLLECTION_ID, linkId);
    return true;
  } catch (err) {
    console.error("Failed to delete link", err);
    return false;
  }
}

export async function getUserByUsername(username: string) {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("username", username)]
    );
    return res.documents[0] || null;
  } catch (err) {
    console.error("Error getting user by username", err);
    return null;
  }
}

export async function getUserById(userId: string) {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("userId", userId), Query.limit(1)]
    );

    return result.documents[0] || null;
  } catch (err) {
    console.error("Failed to fetch user by ID:", err);
    return null;
  }
}

export async function updateUserInDB(
  documentId: string,
  updates: Partial<{
    name: string;
    username: string;
    bio: string;
    avatarUrl: string;
  }>
) {
  try {
    const updated = await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      documentId,
      updates
    );
    return updated;
  } catch (err) {
    console.error("Failed to update user:", err);
    return null;
  }
}

export async function uploadAvatar(file: File) {
  try {
    const res = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return res;
  } catch (err) {
    console.error("Upload failed", err);
    return null;
  }
}

export function getAvatarUrl(fileId: string) {
  return storage.getFileDownload(BUCKET_ID, fileId);
}

export async function checkUsernameExists(username: string) {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("username", username)]
    );
    return result.total > 0;
  } catch (err) {
    console.error("Failed to check username:", err);
    return false;
 
  }
}

// Get logged-in Appwrite user
export async function getLoggedInAccount() {
  try {
    const user = await account.get();
    return user;
  } catch (err) {
    console.error("No Appwrite session found", err);
    return null;
  }
}
