import { unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

/**
 * Deletes a file from the server
 * @param {string} fileUrl - The URL of the file (e.g., /uploads/profiles/filename.jpg)
 * @returns {Promise<boolean>} - True if file was deleted, false if file doesn't exist
 */
export async function deleteFileFromServer(fileUrl) {
  try {
    // Skip if fileUrl is empty or null
    if (!fileUrl) return false;

    // Convert relative URL to absolute file path
    const relativePath = fileUrl.startsWith("/")
      ? fileUrl.substring(1)
      : fileUrl;
    const filePath = path.join(process.cwd(), "public", relativePath);

    // Check if file exists
    if (!existsSync(filePath)) {
      console.log(`File does not exist: ${filePath}`);
      return false;
    }

    // Delete the file
    await unlink(filePath);
    console.log(`File deleted: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${fileUrl}:`, error);
    return false;
  }
}
