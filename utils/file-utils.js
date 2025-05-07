import { unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Define base storage path outside of application directory
const EXTERNAL_STORAGE_PATH =
  process.env.EXTERNAL_STORAGE_PATH || "/home/ubuntu/persistent-storage";

/**
 * Deletes a file from the server
 * @param {string} fileUrl - The URL of the file (e.g., /uploads/profiles/filename.jpg)
 * @returns {Promise<boolean>} - True if file was deleted, false if file doesn't exist
 */
export async function deleteFileFromServer(fileUrl) {
  try {
    // Skip if fileUrl is empty or null
    if (!fileUrl) return false;

    // Convert relative URL to path components
    const relativePath = fileUrl.startsWith("/")
      ? fileUrl.substring(1)
      : fileUrl;

    // Delete from external storage in production
    if (process.env.NODE_ENV === "production") {
      const externalFilePath = path.join(EXTERNAL_STORAGE_PATH, relativePath);

      // Check if file exists in external storage
      if (existsSync(externalFilePath)) {
        await unlink(externalFilePath);
        console.log(`File deleted from external storage: ${externalFilePath}`);
        return true;
      }
    }

    // Always try to delete from public directory as well
    const publicFilePath = path.join(process.cwd(), "public", relativePath);

    // Check if file exists in public directory
    if (existsSync(publicFilePath)) {
      await unlink(publicFilePath);
      console.log(`File deleted from public directory: ${publicFilePath}`);
      return true;
    }

    console.log(`File does not exist in any location: ${relativePath}`);
    return false;
  } catch (error) {
    console.error(`Error deleting file ${fileUrl}:`, error);
    return false;
  }
}
