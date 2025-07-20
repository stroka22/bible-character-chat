#!/bin/bash
# =========================================================================
# Bible Character Chat - Application Starter
# =========================================================================
# This script builds the React app (if needed) and starts the dedicated
# server for the Bible Character Chat application.
#
# Usage: ./start-app.sh [options]
# Options:
#   --skip-auth    Start the app with authentication bypassed
#   --port=NUMBER  Use a specific port (default: 3000)
#   --help         Show this help message
# =========================================================================

# Text formatting
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
CYAN="\033[36m"
RESET="\033[0m"

# Default settings
PORT=3000
SKIP_AUTH=false
BUILD_DIR="dist"
SERVER_SCRIPT="react-server.mjs"
FORCE_REACT=false

# App directory - use the directory where this script is located
APP_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Parse command line arguments
for arg in "$@"; do
  case $arg in
    --skip-auth)
      SKIP_AUTH=true
      shift
      ;;
    --force-react)
      FORCE_REACT=true
      shift
      ;;
    --port=*)
      PORT="${arg#*=}"
      shift
      ;;
    --help)
      echo -e "${BOLD}Bible Character Chat - Application Starter${RESET}"
      echo
      echo "Usage: ./start-app.sh [options]"
      echo
      echo "Options:"
      echo "  --skip-auth    Start the app with authentication bypassed"
      echo "  --port=NUMBER  Use a specific port (default: 3000)"
      echo "  --force-react  Always serve the React SPA (ignore legacy HTML)"
      echo "  --help         Show this help message"
      echo
      exit 0
      ;;
    *)
      # Unknown option
      echo -e "${RED}Unknown option: $arg${RESET}"
      echo "Use --help to see available options"
      exit 1
      ;;
  esac
done

# Error handling
handle_error() {
  echo -e "\n${RED}${BOLD}ERROR: $1${RESET}"
  echo -e "${YELLOW}The application failed to start. See error details above.${RESET}"
  exit 1
}

# Set up error trap
trap 'handle_error "Script interrupted"' INT TERM

# Print header
echo -e "${BOLD}${BLUE}==========================================${RESET}"
echo -e "${BOLD}${BLUE}  Bible Character Chat - App Launcher     ${RESET}"
echo -e "${BOLD}${BLUE}==========================================${RESET}"
echo -e "Directory: ${APP_DIR}"
echo -e "Port: ${PORT}"
if [ "$SKIP_AUTH" = true ]; then
  echo -e "Auth: ${YELLOW}BYPASSED${RESET} (--skip-auth enabled)"
else
  echo -e "Auth: ${GREEN}ENABLED${RESET} (normal login flow)"
fi
if [ "$FORCE_REACT" = true ]; then
  echo -e "Mode: ${GREEN}FORCE_REACT${RESET} (stand-alone HTML disabled)"
fi
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
    handle_error "Failed to free port $PORT. Please close the application using this port or specify a different port."
  else
    echo -e "${GREEN}Successfully freed port $PORT.${RESET}"
  fi
else
  echo -e "${GREEN}Port $PORT is available.${RESET}"
fi

# Step 2: Check for required dependencies
echo -e "\n${BOLD}Step 2: Checking dependencies...${RESET}"
command -v node >/dev/null 2>&1 || handle_error "Node.js is required but not installed. Please install Node.js."
command -v npm >/dev/null 2>&1 || handle_error "npm is required but not installed. Please install npm."

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
VITE_SKIP_AUTH=${SKIP_AUTH}
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
  
  # Update SKIP_AUTH in .env if --skip-auth flag is used
  if [ "$SKIP_AUTH" = true ]; then
    if grep -q "VITE_SKIP_AUTH" "$ENV_FILE"; then
      sed -i.bak "s/VITE_SKIP_AUTH=.*/VITE_SKIP_AUTH=true/" "$ENV_FILE" && rm -f "$ENV_FILE.bak"
      echo -e "${YELLOW}Updated VITE_SKIP_AUTH=true in .env file${RESET}"
    else
      echo "VITE_SKIP_AUTH=true" >> "$ENV_FILE"
      echo -e "${YELLOW}Added VITE_SKIP_AUTH=true to .env file${RESET}"
    fi
  fi
fi

# Step 4: Check for required files
echo -e "\n${BOLD}Step 4: Checking for required files...${RESET}"

# Check for server script
if [ ! -f "$APP_DIR/$SERVER_SCRIPT" ]; then
  echo -e "${RED}Server script $SERVER_SCRIPT not found!${RESET}"
  echo -e "${YELLOW}Checking for alternative server scripts...${RESET}"
  
  if [ -f "$APP_DIR/server.mjs" ]; then
    SERVER_SCRIPT="server.mjs"
    echo -e "${GREEN}Found alternative server: server.mjs${RESET}"
  else
    handle_error "No server script found. Please ensure react-server.mjs or server.mjs exists."
  fi
fi

# Check for service worker cleanup script
SW_CLEANUP="$APP_DIR/public/service-worker-cleanup.js"
if [ ! -f "$SW_CLEANUP" ]; then
  echo -e "${YELLOW}Service worker cleanup script not found. The app may experience redirection issues.${RESET}"
  echo -e "${YELLOW}Please ensure service-worker-cleanup.js exists in the public directory.${RESET}"
fi

# Step 5: Build the React app if needed
echo -e "\n${BOLD}Step 5: Checking build status...${RESET}"

# Only build if the dist directory doesn't exist or is older than source files
if [ ! -d "$APP_DIR/$BUILD_DIR" ] || [ -n "$(find "$APP_DIR/src" -type f -newer "$APP_DIR/$BUILD_DIR" 2>/dev/null)" ]; then
  echo -e "${YELLOW}Build directory missing or outdated. Building the React app...${RESET}"
  
  # Install dependencies if needed
  if [ ! -d "$APP_DIR/node_modules" ] || [ "$APP_DIR/package.json" -nt "$APP_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${RESET}"
    cd "$APP_DIR" && npm install || handle_error "Failed to install dependencies"
  fi
  
  # Build the app
  echo -e "${YELLOW}Building the React app...${RESET}"
  cd "$APP_DIR" && npm run build || handle_error "Failed to build the React app"
  
  echo -e "${GREEN}React app built successfully.${RESET}"
else
  echo -e "${GREEN}Build is up to date.${RESET}"
fi

# Step 6: Start the server
echo -e "\n${BOLD}Step 6: Starting the application...${RESET}"

# Set environment variables
export PORT="$PORT"
export SKIP_AUTH="$SKIP_AUTH"
export FORCE_REACT="$FORCE_REACT"

# Print access information
echo -e "${CYAN}${BOLD}==========================================${RESET}"
echo -e "${CYAN}${BOLD}  Bible Character Chat is starting up!    ${RESET}"
echo -e "${CYAN}${BOLD}==========================================${RESET}"
echo -e "${BOLD}Access the app at:${RESET}"
echo -e "  ${GREEN}${BOLD}http://localhost:$PORT${RESET}"

if [ "$SKIP_AUTH" = true ]; then
  echo -e "${YELLOW}Authentication is bypassed. No login required.${RESET}"
else
  echo -e "${GREEN}Normal authentication flow is enabled.${RESET}"
  echo -e "Use ${BOLD}http://localhost:$PORT/?skipAuth=1${RESET} to bypass login if needed."
fi

echo -e "${CYAN}${BOLD}==========================================${RESET}"
echo -e "${YELLOW}Press Ctrl+C to stop the application.${RESET}"
echo

# Start the server
cd "$APP_DIR" && node "$SERVER_SCRIPT" || handle_error "Failed to start the server"

exit 0
