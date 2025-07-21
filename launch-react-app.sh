#!/bin/bash
# =========================================================================
# Bible Character Chat - React App Launcher
# =========================================================================
# This script prepares the environment and launches the React application
# with proper settings to avoid redirection issues and port conflicts.
# 
# Usage: ./launch-react-app.sh [port]
# Optional port parameter defaults to 5173 if not specified.
# =========================================================================

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

# Default port
DEFAULT_PORT=5173
PORT=${1:-$DEFAULT_PORT}

# App directory - use the directory where this script is located
APP_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Print header
echo -e "${BOLD}${BLUE}==========================================${RESET}"
echo -e "${BOLD}${BLUE}  Bible Character Chat - React Launcher  ${RESET}"
echo -e "${BOLD}${BLUE}==========================================${RESET}"
echo -e "Directory: ${APP_DIR}"
echo -e "Port: ${PORT}"
echo

# Function to check if a port is in use
is_port_in_use() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -i :"$1" >/dev/null 2>&1
    return $?
  elif command -v netstat >/dev/null 2>&1; then
    netstat -tuln | grep -q ":$1 "
    return $?
  else
    # If neither command is available, assume port is free
    return 1
  fi
}

# Function to kill process using a specific port
kill_process_on_port() {
  echo -e "${YELLOW}Attempting to free port $1...${RESET}"
  
  if command -v lsof >/dev/null 2>&1; then
    local pid=$(lsof -t -i:"$1")
    if [ -n "$pid" ]; then
      echo -e "Found process ${BOLD}$pid${RESET} using port $1. Terminating..."
      kill -15 "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null
      sleep 1
      return 0
    fi
  elif command -v netstat >/dev/null 2>&1 && command -v grep >/dev/null 2>&1 && command -v awk >/dev/null 2>&1; then
    local pid=$(netstat -tuln | grep ":$1 " | awk '{print $7}' | cut -d'/' -f1)
    if [ -n "$pid" ]; then
      echo -e "Found process ${BOLD}$pid${RESET} using port $1. Terminating..."
      kill -15 "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null
      sleep 1
      return 0
    fi
  fi
  
  echo -e "${YELLOW}No process found using port $1${RESET}"
  return 1
}

# Step 1: Check and clean up port conflicts
echo -e "${BOLD}Step 1: Checking for port conflicts...${RESET}"
if is_port_in_use "$PORT"; then
  echo -e "${YELLOW}Port $PORT is already in use.${RESET}"
  kill_process_on_port "$PORT"
  
  if is_port_in_use "$PORT"; then
    echo -e "${RED}Failed to free port $PORT. Please close the application using this port or specify a different port.${RESET}"
    echo -e "Usage: $0 [port]"
    exit 1
  else
    echo -e "${GREEN}Successfully freed port $PORT.${RESET}"
  fi
else
  echo -e "${GREEN}Port $PORT is available.${RESET}"
fi

# Step 2: Check for required dependencies
echo -e "\n${BOLD}Step 2: Checking dependencies...${RESET}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}Node.js is required but not installed. Please install Node.js.${RESET}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}npm is required but not installed. Please install npm.${RESET}"; exit 1; }

# Display Node.js and npm versions
echo -e "Node.js version: $(node --version)"
echo -e "npm version: $(npm --version)"

# Step 3: Check for .env file and create if missing
echo -e "\n${BOLD}Step 3: Checking environment configuration...${RESET}"
ENV_FILE="$APP_DIR/.env"
ENV_EXAMPLE="$APP_DIR/.env.example"

if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$ENV_EXAMPLE" ]; then
    echo -e "${YELLOW}.env file not found. Creating from .env.example...${RESET}"
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo -e "${GREEN}Created .env file from example.${RESET}"
  else
    echo -e "${YELLOW}.env and .env.example files not found. Creating minimal .env...${RESET}"
    cat > "$ENV_FILE" << EOF
# Bible Character Chat - Environment Variables
VITE_OPENAI_API_KEY=sk-placeholder
VITE_STRIPE_PUBLIC_KEY=pk-placeholder
VITE_STRIPE_PRICE_ID=price_placeholder
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENABLE_INTERCEPTOR=true
VITE_DIRECT_RENDER=false
VITE_SKIP_AUTH=false
VITE_AUTH_DEBUG=false
EOF
    echo -e "${GREEN}Created minimal .env file.${RESET}"
  fi
  
  echo -e "${YELLOW}Please edit the .env file to add your API keys before using the application.${RESET}"
else
  echo -e "${GREEN}.env file found.${RESET}"
  
  # Check for critical environment variables
  grep -q "VITE_OPENAI_API_KEY" "$ENV_FILE" || echo -e "${YELLOW}Warning: VITE_OPENAI_API_KEY not found in .env${RESET}"
  grep -q "VITE_SUPABASE_URL" "$ENV_FILE" || echo -e "${YELLOW}Warning: VITE_SUPABASE_URL not found in .env${RESET}"
  grep -q "VITE_SUPABASE_ANON_KEY" "$ENV_FILE" || echo -e "${YELLOW}Warning: VITE_SUPABASE_ANON_KEY not found in .env${RESET}"
  
  # Add missing configuration options
  grep -q "VITE_ENABLE_INTERCEPTOR" "$ENV_FILE" || echo "VITE_ENABLE_INTERCEPTOR=true" >> "$ENV_FILE"
  grep -q "VITE_DIRECT_RENDER" "$ENV_FILE" || echo "VITE_DIRECT_RENDER=false" >> "$ENV_FILE"
  grep -q "VITE_SKIP_AUTH" "$ENV_FILE" || echo "VITE_SKIP_AUTH=false" >> "$ENV_FILE"
  grep -q "VITE_AUTH_DEBUG" "$ENV_FILE" || echo "VITE_AUTH_DEBUG=false" >> "$ENV_FILE"
fi

# Step 4: Check for required files
echo -e "\n${BOLD}Step 4: Checking for required files...${RESET}"

# Check for service worker cleanup script
SW_CLEANUP="$APP_DIR/public/service-worker-cleanup.js"
if [ ! -f "$SW_CLEANUP" ]; then
  echo -e "${YELLOW}Service worker cleanup script not found. The app may experience redirection issues.${RESET}"
  echo -e "${YELLOW}Please ensure service-worker-cleanup.js exists in the public directory.${RESET}"
fi

# Check for network interceptor
INTERCEPTOR="$APP_DIR/public/intercept.js"
if [ ! -f "$INTERCEPTOR" ]; then
  echo -e "${YELLOW}Network interceptor script not found. The app may experience image loading issues.${RESET}"
  echo -e "${YELLOW}Please ensure intercept.js exists in the public directory.${RESET}"
fi

# Step 5: Install dependencies if node_modules is missing or package.json has changed
echo -e "\n${BOLD}Step 5: Checking dependencies...${RESET}"
if [ ! -d "$APP_DIR/node_modules" ] || [ "$APP_DIR/package.json" -nt "$APP_DIR/node_modules" ]; then
  echo -e "${YELLOW}Node modules missing or package.json has been updated. Installing dependencies...${RESET}"
  cd "$APP_DIR" && npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies. Please run 'npm install' manually.${RESET}"
    exit 1
  fi
  echo -e "${GREEN}Dependencies installed successfully.${RESET}"
else
  echo -e "${GREEN}Dependencies are up to date.${RESET}"
fi

# Step 6: Launch the application
echo -e "\n${BOLD}Step 6: Launching the React application...${RESET}"
echo -e "${BLUE}Starting Bible Character Chat on port $PORT...${RESET}"
echo -e "${YELLOW}Press Ctrl+C to stop the application.${RESET}"
echo

# Set environment variables for this session
export VITE_PORT="$PORT"

# Launch with specific port and disable host check
cd "$APP_DIR" && npx vite --port "$PORT" --strictPort --host

# Check if the application started successfully
if [ $? -ne 0 ]; then
  echo -e "\n${RED}Failed to start the application.${RESET}"
  
  # Provide troubleshooting tips
  echo -e "\n${BOLD}Troubleshooting tips:${RESET}"
  echo -e "1. Try a different port: $0 5174"
  echo -e "2. Check for error messages above"
  echo -e "3. Try running 'npm run dev' manually"
  echo -e "4. Check if Vite is installed: 'npm list vite'"
  echo -e "5. Try clearing node_modules and reinstalling: 'rm -rf node_modules && npm install'"
  
  exit 1
fi

exit 0
