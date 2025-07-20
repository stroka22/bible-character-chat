#!/bin/bash

# Bible Character Chat - Bypass Version Runner
# This script builds and runs a simplified version of the app
# that bypasses all API dependencies to isolate UI issues.

# Color codes for prettier output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PORT=5179
BYPASS_BUILD_DIR="dist-bypass"
VITE_CONFIG="vite.bypass.config.js"

# Display header
echo -e "${PURPLE}=== Bible Character Chat - Bypass Version ===${NC}"
echo -e "${CYAN}Building and running a simplified version with no API dependencies${NC}"
echo

# Function to check and kill processes on a port
kill_port_process() {
  local port=$1
  local pid=$(lsof -ti:$port 2>/dev/null)
  
  if [ -n "$pid" ]; then
    echo -e "${YELLOW}Port $port is in use by PID $pid. Terminating...${NC}"
    kill -9 $pid 2>/dev/null
    sleep 1
    
    # Verify it's gone
    if lsof -ti:$port >/dev/null 2>&1; then
      echo -e "${RED}Failed to free up port $port. Please terminate the process manually.${NC}"
      return 1
    else
      echo -e "${GREEN}Successfully freed port $port${NC}"
    fi
  else
    echo -e "${GREEN}Port $port is available${NC}"
  fi
  
  return 0
}

# Function to handle errors
handle_error() {
  echo -e "${RED}Error: $1${NC}"
  exit 1
}

# Step 1: Free up the port
echo -e "${BLUE}Step 1: Checking port availability...${NC}"
kill_port_process $PORT || handle_error "Could not free up port $PORT"
echo

# Step 2: Clean old builds
echo -e "${BLUE}Step 2: Cleaning old bypass builds...${NC}"
if [ -d "$BYPASS_BUILD_DIR" ]; then
  echo -e "Removing existing $BYPASS_BUILD_DIR directory..."
  rm -rf "$BYPASS_BUILD_DIR" || handle_error "Failed to remove old build directory"
  echo -e "${GREEN}Old build directory removed${NC}"
else
  echo -e "${GREEN}No old build directory found${NC}"
fi
echo

# Step 3: Create bypass-main.jsx if it doesn't exist
if [ ! -f "src/bypass-main.jsx" ]; then
  echo -e "${YELLOW}Warning: src/bypass-main.jsx not found.${NC}"
  echo -e "${YELLOW}Please create this file first with a simplified app version.${NC}"
  exit 1
fi

# Step 4: Verify bypass config exists
if [ ! -f "$VITE_CONFIG" ]; then
  echo -e "${YELLOW}Warning: $VITE_CONFIG not found.${NC}"
  echo -e "${YELLOW}Please create this file first with the bypass configuration.${NC}"
  exit 1
fi

# Step 5: Build the bypass version
echo -e "${BLUE}Step 5: Building bypass version...${NC}"
echo -e "Running: npx vite build --config $VITE_CONFIG"
npx vite build --config $VITE_CONFIG || handle_error "Build failed"
echo -e "${GREEN}Build completed successfully${NC}"
echo

# Step 6: Serve the bypass version
echo -e "${BLUE}Step 6: Starting server on port $PORT...${NC}"
echo -e "Running: npx http-server $BYPASS_BUILD_DIR -p $PORT --cors -o"
npx http-server $BYPASS_BUILD_DIR -p $PORT --cors -o || handle_error "Failed to start server"

# This line will only be reached if http-server is terminated
echo -e "${YELLOW}Server has been stopped${NC}"
