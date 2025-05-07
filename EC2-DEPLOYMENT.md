# EC2 Deployment Guide

This guide explains how to set up external storage for uploaded files in your EC2 instance to ensure that files persist across application rebuilds.

## Setting Up External Storage

1. **SSH into your EC2 instance**:

   ```
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Create a directory for the setup script**:

   ```
   mkdir -p ~/setup-scripts
   ```

3. **Copy the setup script to your EC2 instance**:

   - Copy the `scripts/setup-external-storage.sh` file to your EC2 instance
   - Alternatively, create the script directly on the EC2 instance:
     ```
     nano ~/setup-scripts/setup-external-storage.sh
     ```
   - Paste the content of the script and save the file

4. **Make the script executable**:

   ```
   chmod +x ~/setup-scripts/setup-external-storage.sh
   ```

5. **Run the setup script with sudo**:

   ```
   sudo ~/setup-scripts/setup-external-storage.sh
   ```

   This script will:

   - Create a persistent storage directory at `/home/ubuntu/tracker-uploads`
   - Create subdirectories for profiles and certifications
   - Set appropriate permissions
   - Create symbolic links from your application's public directory to the storage directories

6. **Configure your application's environment variables**:
   - Create a `.env` file in your application's root directory:
     ```
     nano ~/tracker/.env
     ```
   - Add these environment variables:
     ```
     EXTERNAL_STORAGE_PATH=/home/ubuntu/tracker-uploads
     NODE_ENV=production
     ```

## After Setup

After setting up the external storage:

1. **Restart your application**:

   ```
   pm2 restart tracker
   ```

2. **Test file uploads**:
   - Upload a profile picture or certification and verify it works
   - The files should be saved to both `/home/ubuntu/tracker-uploads` and accessible via the application

## Rebuilding Your Application

When you need to rebuild and redeploy your application:

1. **Pull your latest code**:

   ```
   cd ~/tracker
   git pull
   ```

2. **Install dependencies and build**:

   ```
   npm install
   npm run build
   ```

3. **Restart the application**:
   ```
   pm2 restart tracker
   ```

Your uploaded files will remain safe in the `/home/ubuntu/tracker-uploads` directory, and the symbolic links will ensure they're accessible through your application.

## Troubleshooting

If files aren't being served correctly:

1. **Check symbolic links**:

   ```
   ls -la ~/tracker/public/uploads
   ```

   You should see links pointing to the external storage directories.

2. **Check file permissions**:

   ```
   ls -la ~/tracker-uploads
   ```

   Ensure the files are owned by the correct user (usually ubuntu) and have appropriate permissions.

3. **Check your application logs**:
   ```
   pm2 logs tracker
   ```
   Look for any errors related to file access or storage paths.
