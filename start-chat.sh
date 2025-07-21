#!/bin/bash
# =========================================================================
# Bible Character Chat - Standalone Chat Launcher
# =========================================================================
# This script launches the standalone Bible Character Chat solution.
#
# Usage: ./start-chat.sh [options]
# Options:
#   --http         Serve over HTTP instead of opening directly
#   --port=NUMBER  Specify HTTP port (default: 8000)
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

# ---------------------------------------------------------------------------
# Default settings
#   • CHAT_FILE      – Primary, polished interface (improved mockup version)
#   • FALLBACK_FILE  – Legacy standalone file kept as a safe backup
# ---------------------------------------------------------------------------
SERVE_HTTP=false
PORT=8000
# Main (improved) SPA
CHAT_FILE="public/standalone-chat-improved.html"
# Fallback (original standalone) if the improved file is missing
FALLBACK_FILE="public/standalone-chat.html"

# App directory - use the directory where this script is located
APP_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FULL_PATH="$APP_DIR/$CHAT_FILE"
FALLBACK_PATH="$APP_DIR/$FALLBACK_FILE"

# Parse command line arguments
for arg in "$@"; do
  case $arg in
    --http)
      SERVE_HTTP=true
      shift
      ;;
    --port=*)
      PORT="${arg#*=}"
      shift
      ;;
    --help)
      echo -e "${BOLD}Bible Character Chat - Standalone Launcher${RESET}"
      echo
      echo "Usage: ./start-chat.sh [options]"
      echo
      echo "Options:"
      echo "  --http         Serve over HTTP instead of opening directly"
      echo "  --port=NUMBER  Specify HTTP port (default: 8000)"
      echo "  --help         Show this help message"
      echo
      echo "Examples:"
      echo "  ./start-chat.sh                   # Open directly in browser"
      echo "  ./start-chat.sh --http            # Serve over HTTP on port 8000"
      echo "  ./start-chat.sh --http --port=3000  # Serve over HTTP on port 3000"
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
  echo -e "${YELLOW}The chat application failed to start. See error details above.${RESET}"
  exit 1
}

# Set up error trap
trap 'handle_error "Script interrupted"' INT TERM

# Print header
echo -e "${BOLD}${BLUE}==========================================${RESET}"
echo -e "${BOLD}${BLUE}  Bible Character Chat - Launcher        ${RESET}"
echo -e "${BOLD}${BLUE}==========================================${RESET}"

# Check if the chat file exists
check_files() {
  if [ ! -f "$FULL_PATH" ]; then
    echo -e "${YELLOW}Warning: Main chat file not found at $CHAT_FILE${RESET}"
    
    if [ -f "$FALLBACK_PATH" ]; then
      echo -e "${YELLOW}Using fallback file: $FALLBACK_FILE${RESET}"
      CHAT_FILE=$FALLBACK_FILE
      FULL_PATH=$FALLBACK_PATH
    else
      handle_error "Neither main chat file nor fallback file found. Please check your installation."
    fi
  else
    echo -e "${GREEN}Found chat file: $CHAT_FILE${RESET}"
  fi
}

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

# Function to open file in browser
open_in_browser() {
  echo -e "${BOLD}Opening chat in browser...${RESET}"
  
  # Detect OS and use appropriate open command
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$FULL_PATH"
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start "$FULL_PATH"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open >/dev/null 2>&1; then
      xdg-open "$FULL_PATH"
    elif command -v gnome-open >/dev/null 2>&1; then
      gnome-open "$FULL_PATH"
    else
      echo -e "${YELLOW}Could not detect browser opener. Try:${RESET}"
      echo -e "  firefox \"$FULL_PATH\""
      echo -e "  google-chrome \"$FULL_PATH\""
    fi
  else
    echo -e "${YELLOW}Unknown operating system. Please open this file manually:${RESET}"
    echo -e "  $FULL_PATH"
  fi
}

# Function to start HTTP server
start_http_server() {
  echo -e "${BOLD}Starting HTTP server on port $PORT...${RESET}"
  
  # Check if port is in use
  if is_port_in_use "$PORT"; then
    echo -e "${YELLOW}Port $PORT is already in use.${RESET}"
    kill_process_on_port "$PORT"
    
    if is_port_in_use "$PORT"; then
      handle_error "Failed to free port $PORT. Please specify a different port with --port=NUMBER."
    else
      echo -e "${GREEN}Successfully freed port $PORT.${RESET}"
    fi
  else
    echo -e "${GREEN}Port $PORT is available.${RESET}"
  fi
  
  # Try different HTTP server options
  if command -v python3 >/dev/null 2>&1; then
    echo -e "${GREEN}Using Python 3 HTTP server${RESET}"
    echo -e "${CYAN}${BOLD}==========================================${RESET}"
    echo -e "${CYAN}${BOLD}  Server running at:                     ${RESET}"
    echo -e "${CYAN}${BOLD}  http://localhost:$PORT/${CHAT_FILE}    ${RESET}"
    echo -e "${CYAN}${BOLD}==========================================${RESET}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server.${RESET}"
    cd "$APP_DIR" && python3 -m http.server "$PORT"
  elif command -v python >/dev/null 2>&1; then
    echo -e "${GREEN}Using Python HTTP server${RESET}"
    echo -e "${CYAN}${BOLD}==========================================${RESET}"
    echo -e "${CYAN}${BOLD}  Server running at:                     ${RESET}"
    echo -e "${CYAN}${BOLD}  http://localhost:$PORT/${CHAT_FILE}    ${RESET}"
    echo -e "${CYAN}${BOLD}==========================================${RESET}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server.${RESET}"
    cd "$APP_DIR" && python -m SimpleHTTPServer "$PORT"
  elif command -v npx >/dev/null 2>&1; then
    echo -e "${GREEN}Using npx serve${RESET}"
    echo -e "${CYAN}${BOLD}==========================================${RESET}"
    echo -e "${CYAN}${BOLD}  Server running at:                     ${RESET}"
    echo -e "${CYAN}${BOLD}  http://localhost:$PORT                 ${RESET}"
    echo -e "${CYAN}${BOLD}==========================================${RESET}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server.${RESET}"
    cd "$APP_DIR" && npx serve --listen "$PORT"
  else
    handle_error "No suitable HTTP server found. Please install Python 3 or Node.js."
  fi
}

# Main execution
check_files

if [ "$SERVE_HTTP" = true ]; then
  start_http_server
else
  open_in_browser
  echo -e "${GREEN}Chat launched in browser. You can close this terminal window.${RESET}"
fi

exit 0
