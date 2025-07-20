#!/bin/bash

# Bible Character Chat - Application Health Check Script
# This script checks essential aspects of the application to ensure it's healthy

# Color codes for prettier output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Define commonly used ports
COMMON_PORTS=(5173 5174 5175 5176 5177 5178 5179 3000 8080)

# Key service files to check for dual export pattern
SERVICE_FILES=(
  "src/services/openai.js"
  "src/services/stripe.js"
)

# Display header
echo -e "${PURPLE}=== Bible Character Chat - Health Check ===${NC}"
echo -e "${CYAN}Running essential health checks...${NC}"
echo

# Function to check for running servers on common ports
check_running_servers() {
  echo -e "${BLUE}Checking for running app instances...${NC}"
  local found_servers=false
  
  for port in "${COMMON_PORTS[@]}"; do
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
      found_servers=true
      local command=$(ps -p $pid -o command= 2>/dev/null)
      echo -e "${YELLOW}  • Port $port is in use by PID $pid${NC} ($command)"
    fi
  done
  
  if [ "$found_servers" = false ]; then
    echo -e "${GREEN}  ✓ No app instances running on common ports.${NC}"
  else
    echo -e "${YELLOW}  ⚠ Some ports are in use. You may need to kill these processes before starting the app.${NC}"
    echo -e "${YELLOW}    Use: kill -9 [PID] to terminate a process${NC}"
  fi
  echo
}

# Function to check service files for dual export pattern
check_service_files() {
  echo -e "${BLUE}Checking service files for dual export pattern...${NC}"
  
  local missing_files=()
  local missing_pattern=()
  
  for file in "${SERVICE_FILES[@]}"; do
    if [ ! -f "$file" ]; then
      missing_files+=("$file")
    else
      echo -e "${GREEN}  ✓ $file exists${NC}"
      
      # Check for dual export pattern
      if grep -q "typeof module" "$file" && grep -q "export {" "$file"; then
        echo -e "${GREEN}    ✓ Has proper dual export pattern${NC}"
      else
        echo -e "${RED}    ✗ Missing dual export pattern${NC}"
        missing_pattern+=("$file")
      fi
    fi
  done
  
  if [ ${#missing_files[@]} -ne 0 ]; then
    echo -e "${RED}  ✗ Missing service files: ${missing_files[*]}${NC}"
  fi
  
  if [ ${#missing_pattern[@]} -ne 0 ]; then
    echo -e "${RED}  ✗ Files missing dual export pattern: ${missing_pattern[*]}${NC}"
    echo -e "${YELLOW}  ⚠ These files need to be updated with the hybrid module format.${NC}"
  fi
  echo
}

# Function to check startup script
check_startup_script() {
  echo -e "${BLUE}Checking startup script...${NC}"
  
  if [ ! -f "start-react-app.sh" ]; then
    echo -e "${RED}  ✗ start-react-app.sh not found${NC}"
  else
    echo -e "${GREEN}  ✓ start-react-app.sh exists${NC}"
    
    # Check if executable
    if [ -x "start-react-app.sh" ]; then
      echo -e "${GREEN}    ✓ start-react-app.sh is executable${NC}"
    else
      echo -e "${YELLOW}    ⚠ start-react-app.sh is not executable. Running: chmod +x start-react-app.sh${NC}"
      chmod +x start-react-app.sh
      if [ -x "start-react-app.sh" ]; then
        echo -e "${GREEN}    ✓ Fixed permissions, start-react-app.sh is now executable${NC}"
      else
        echo -e "${RED}    ✗ Failed to make start-react-app.sh executable${NC}"
      fi
    fi
    
    # Check for port management in script
    if grep -q "kill_port_process" "start-react-app.sh"; then
      echo -e "${GREEN}    ✓ Script includes port management functionality${NC}"
    else
      echo -e "${YELLOW}    ⚠ Script may not have port conflict management${NC}"
    fi
  fi
  echo
}

# Function to provide a summary
summarize_health() {
  echo -e "${PURPLE}=== Health Check Summary ===${NC}"
  
  # Initialize here
  local found_issues=false
  
  # Check for critical issues
  if [ ${#missing_files[@]} -gt 0 ] || [ ${#missing_pattern[@]} -gt 0 ]; then
    found_issues=true
    echo -e "${RED}  ✗ Service file issues detected${NC}"
  fi
  
  if [ ! -f "start-react-app.sh" ] || [ ! -x "start-react-app.sh" ]; then
    found_issues=true
    echo -e "${RED}  ✗ Startup script issues detected${NC}"
  fi
  
  if [ "$found_issues" = false ]; then
    echo -e "${GREEN}  ✓ No critical issues detected!${NC}"
    echo -e "${GREEN}  ✓ App appears to be ready to run.${NC}"
    echo
    echo -e "${CYAN}To start the app, run:${NC}"
    echo -e "${YELLOW}  ./start-react-app.sh --skip-auth --port 5179${NC}"
  else
    echo -e "${YELLOW}  ⚠ Some issues were detected. Please review the details above.${NC}"
  fi
  echo
}

# Main execution
check_running_servers
check_service_files
check_startup_script
summarize_health

echo -e "${CYAN}Health check completed!${NC}"
