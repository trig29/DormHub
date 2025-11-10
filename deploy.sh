#!/bin/bash

# Deployment script for Linux server
# Usage: ./deploy.sh

echo "Starting deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "Error: FFmpeg is not installed"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Build project
echo "Building project..."
npm run build

# Create necessary directories
echo "Creating directories..."
mkdir -p videos
mkdir -p hls
mkdir -p logs

# Set permissions
chmod 755 videos
chmod 755 hls

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
    echo "PM2 found, restarting application..."
    pm2 restart dormhub-video || pm2 start ecosystem.config.js
    pm2 save
else
    echo "PM2 not found. Starting with node..."
    echo "For production, install PM2: npm install -g pm2"
    PORT=8000 node dist/server/index.js
fi

echo "Deployment completed!"
echo "Application should be running on port 8000"

