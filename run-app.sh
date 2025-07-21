#!/bin/bash

# Bible Character Chat - Application Runner
# This script builds and runs the application with a single command

# ANSI color codes for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Fixed port for consistency
PORT=5186
APP_URL="http://localhost:$PORT"

# Print header
echo -e "${BLUE}${BOLD}"
echo -e "┌──────────────────────────────────────────────┐"
echo -e "│  Bible Character Chat - Application Runner   │"
echo -e "└──────────────────────────────────────────────┘"
echo -e "${RESET}"

# Step 1: Build the application
echo -e "${BLUE}Building application...${RESET}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}${BOLD}Build failed! Please check the errors above.${RESET}"
    exit 1
fi
echo -e "${GREEN}${BOLD}Build successful!${RESET}"

# Step 2: Check for and stop any running vite processes
echo -e "${BLUE}Checking for running servers...${RESET}"
if pgrep -f vite > /dev/null; then
    echo -e "${YELLOW}Found running vite process(es). Stopping...${RESET}"
    pkill -f vite
    sleep 1
    echo -e "${GREEN}Stopped existing servers.${RESET}"
else
    echo -e "${GREEN}No running servers found.${RESET}"
fi

# Step 3: Start the preview server
echo -e "${BLUE}Starting server on port ${BOLD}${PORT}${RESET}..."
# Start the server in the background
npm run preview -- --port $PORT &
SERVER_PID=$!

# Wait a moment for the server to start
sleep 2

# Check if server started successfully
if ! ps -p $SERVER_PID > /dev/null; then
    echo -e "${RED}${BOLD}Server failed to start! Please check for errors.${RESET}"
    exit 1
fi

echo -e "${GREEN}${BOLD}Server running at:${RESET} ${CYAN}$APP_URL${RESET}"

# Step 4: Open the browser
echo -e "${BLUE}Opening browser...${RESET}"

# Detect OS and use appropriate command to open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open $APP_URL
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open $APP_URL 2>/dev/null || sensible-browser $APP_URL 2>/dev/null || \
    echo -e "${YELLOW}Could not automatically open browser. Please visit:${RESET} ${CYAN}$APP_URL${RESET}"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows with Git Bash or similar
    start $APP_URL 2>/dev/null || \
    echo -e "${YELLOW}Could not automatically open browser. Please visit:${RESET} ${CYAN}$APP_URL${RESET}"
else
    echo -e "${YELLOW}Could not detect OS. Please open browser manually at:${RESET} ${CYAN}$APP_URL${RESET}"
fi

echo -e "${MAGENTA}${BOLD}Bible Character Chat is now running!${RESET}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${RESET}"

# Keep the script running until user presses Ctrl+C
wait $SERVER_PID
