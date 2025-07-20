#!/bin/bash
#
# start-react-app.sh - Start the Bible Character Chat React application
#
# This script:
# 1. Checks for an available port (starting from 5180)
# 2. Loads environment variables from .env file
# 3. Starts the app using npm run preview on the selected port
# 4. Displays helpful messages about the app's status

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}${BOLD}"
echo "┌──────────────────────────────────────────────┐"
echo "│  Bible Character Chat - Application Starter  │"
echo "└──────────────────────────────────────────────┘"
echo -e "${NC}"

# Function to check if a port is available
check_port() {
  local port=$1
  if command -v nc &> /dev/null; then
    nc -z localhost $port &> /dev/null
    return $?
  elif command -v lsof &> /dev/null; then
    lsof -i:$port &> /dev/null
    return $?
  else
    # Fallback to attempting a connection
    (echo > /dev/tcp/localhost/$port) &> /dev/null
    return $?
  fi
}

# Function to find an available port
find_available_port() {
  local port=$1
  while check_port $port; do
    echo -e "${YELLOW}Port $port is in use, trying next port...${NC}"
    port=$((port + 1))
  done
  echo $port
}

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found!${NC}"
  echo "Please create a .env file with required environment variables."
  echo "See .env.example for reference."
  exit 1
fi

# Load environment variables from .env file
echo -e "${BLUE}Loading environment variables from .env file...${NC}"
export $(grep -v '^#' .env | xargs)

# Check if build directory exists
if [ ! -d "dist" ]; then
  echo -e "${YELLOW}Build directory not found. Running build process...${NC}"
  npm run build
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Please fix the errors and try again.${NC}"
    exit 1
  fi
fi

# Find an available port starting from 5180
DEFAULT_PORT=5180
PORT=$(find_available_port $DEFAULT_PORT)

echo -e "${GREEN}Starting Bible Character Chat on port ${BOLD}$PORT${NC}"

# Display environment information
echo -e "${BLUE}Environment Configuration:${NC}"
echo -e "  • Supabase URL: ${YELLOW}${VITE_SUPABASE_URL:-Not set}${NC}"
echo -e "  • OpenAI API: ${YELLOW}$(if [ -n "$VITE_OPENAI_API_KEY" ]; then echo "Configured"; else echo "Not set"; fi)${NC}"
echo -e "  • Stripe: ${YELLOW}$(if [ -n "$VITE_STRIPE_PUBLIC_KEY" ]; then echo "Configured"; else echo "Not set"; fi)${NC}"
echo -e "  • Auth Debug: ${YELLOW}${VITE_AUTH_DEBUG:-false}${NC}"
echo -e "  • Skip Auth: ${YELLOW}${VITE_SKIP_AUTH:-false}${NC}"

# Start the application with the selected port
echo -e "${GREEN}${BOLD}Starting application server...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Run the preview server
npm run preview -- --port $PORT

# Make this script executable
chmod +x "$0"
