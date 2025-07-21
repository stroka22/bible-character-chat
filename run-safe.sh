#!/bin/bash

# run-safe.sh - Temporary safe mode runner for Bible Character Chat
# This script swaps in a version of main.tsx that uses safe service initializers
# that don't throw errors when API keys are missing.

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directory where the script is run from
APP_DIR="$PWD"
MAIN_FILE="$APP_DIR/src/main.tsx"
BACKUP_FILE="$APP_DIR/src/main.tsx.bak"
SAFE_FILE="$APP_DIR/src/main-safe.tsx"

# Function to clean up and restore original files
cleanup() {
    echo -e "\n${YELLOW}Cleaning up and restoring original files...${NC}"
    
    # Stop any running npm processes
    pkill -f "npm run dev" || true
    
    # Restore the original main.tsx if backup exists
    if [ -f "$BACKUP_FILE" ]; then
        mv "$BACKUP_FILE" "$MAIN_FILE"
        echo -e "${GREEN}✓ Restored original main.tsx${NC}"
    fi
    
    echo -e "${GREEN}Cleanup complete. Original configuration restored.${NC}"
    exit 0
}

# Trap Ctrl+C (SIGINT), SIGTERM and EXIT signals
trap cleanup SIGINT SIGTERM EXIT

# Check if main-safe.tsx exists
if [ ! -f "$SAFE_FILE" ]; then
    echo -e "${RED}Error: $SAFE_FILE not found!${NC}"
    echo -e "Make sure you've created the safe version of main.tsx first."
    exit 1
fi

# Backup original main.tsx
if [ -f "$MAIN_FILE" ]; then
    echo -e "${BLUE}Backing up original main.tsx...${NC}"
    cp "$MAIN_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup created at $BACKUP_FILE${NC}"
else
    echo -e "${RED}Error: $MAIN_FILE not found!${NC}"
    exit 1
fi

# Copy safe version to main.tsx
echo -e "${BLUE}Installing safe version of main.tsx...${NC}"
cp "$SAFE_FILE" "$MAIN_FILE"
echo -e "${GREEN}✓ Safe version installed${NC}"

# Start the development server
echo -e "\n${YELLOW}Starting development server in SAFE MODE...${NC}"
echo -e "${YELLOW}This version gracefully handles missing API keys${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop and restore original configuration${NC}\n"

# Set the AUTH_DEBUG environment variable to help with troubleshooting
VITE_AUTH_DEBUG=true npm run dev

# Note: The cleanup function will be called automatically when the script exits
# due to the trap we set up earlier
