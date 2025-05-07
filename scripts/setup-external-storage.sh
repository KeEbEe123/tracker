#!/bin/bash

# This script sets up external storage for file uploads in your EC2 instance
# Run this script with sudo when setting up your EC2 instance

# Configuration
STORAGE_DIR="/home/ubuntu/tracker-uploads"
PUBLIC_DIR="/home/ubuntu/tracker/public/uploads"
USER="ubuntu"
GROUP="ubuntu"

# Create main storage directory
echo "Creating main storage directory at $STORAGE_DIR"
mkdir -p "$STORAGE_DIR"
mkdir -p "$STORAGE_DIR/profiles"
mkdir -p "$STORAGE_DIR/certifications"

# Set proper permissions
echo "Setting directory permissions"
chown -R $USER:$GROUP "$STORAGE_DIR"
chmod -R 755 "$STORAGE_DIR"

# Create public directory if it doesn't exist
echo "Creating public directory structure"
mkdir -p "$PUBLIC_DIR"

# Create symbolic links
echo "Creating symbolic links from public directory to storage directory"
ln -sfn "$STORAGE_DIR/profiles" "$PUBLIC_DIR/profiles"
ln -sfn "$STORAGE_DIR/certifications" "$PUBLIC_DIR/certifications"

# Set proper permissions on public directory
chown -R $USER:$GROUP "$PUBLIC_DIR"

echo "External storage setup complete"
echo "Storage directory: $STORAGE_DIR"
echo "Public directory: $PUBLIC_DIR"

echo "Add the following to your .env file:"
echo "EXTERNAL_STORAGE_PATH=$STORAGE_DIR"
echo "NODE_ENV=production" 