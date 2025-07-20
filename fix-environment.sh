#!/bin/bash

# Bible Character Chat - Environment Setup Script
# This script helps set up the required environment variables for the application.
# It checks for a .env file, creates one from .env.example if needed, and prompts for API keys.

# Color codes for prettier output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Display header
echo -e "${PURPLE}=== Bible Character Chat - Environment Setup ===${NC}"
echo -e "${CYAN}This script will help you set up your environment variables.${NC}"
echo

# Check if .env file exists
if [ -f ".env" ]; then
  echo -e "${YELLOW}Existing .env file found.${NC}"
  read -p "Do you want to update it? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Keeping existing .env file. Checking for missing variables...${NC}"
    UPDATE_MODE=true
  else
    echo -e "${BLUE}Updating existing .env file...${NC}"
    # Back up the existing file
    cp .env .env.backup.$(date +%Y%m%d%H%M%S)
    echo -e "${GREEN}Backup created: .env.backup.$(date +%Y%m%d%H%M%S)${NC}"
    UPDATE_MODE=true
  fi
else
  echo -e "${YELLOW}No .env file found.${NC}"
  
  # Check if .env.example exists
  if [ -f ".env.example" ]; then
    echo -e "${GREEN}Creating new .env file from .env.example...${NC}"
    cp .env.example .env
    UPDATE_MODE=false
  else
    echo -e "${RED}No .env.example file found. Creating a new .env file from scratch...${NC}"
    touch .env
    UPDATE_MODE=false
  fi
fi

# Function to validate OpenAI API key format
validate_openai_key() {
  local key=$1
  if [[ $key == sk-* && ${#key} -gt 20 ]]; then
    return 0
  else
    return 1
  fi
}

# Function to validate Stripe public key format
validate_stripe_key() {
  local key=$1
  if [[ ($key == pk_test_* || $key == pk_live_*) && ${#key} -gt 20 ]]; then
    return 0
  else
    return 1
  fi
}

# Function to validate Stripe price ID format
validate_price_id() {
  local id=$1
  if [[ $id == price_* && ${#id} -gt 10 ]]; then
    return 0
  else
    return 1
  fi
}

# Function to update a variable in the .env file
update_env_var() {
  local var_name=$1
  local var_value=$2
  local var_description=$3
  local validation_func=$4
  
  # Check if the variable already exists in the file
  local current_value=""
  if grep -q "^$var_name=" .env; then
    current_value=$(grep "^$var_name=" .env | cut -d= -f2)
    if [ -n "$current_value" ] && [ "$current_value" != "your_${var_name}_here" ] && [ "$UPDATE_MODE" = true ]; then
      echo -e "${BLUE}Current $var_name: ${YELLOW}$current_value${NC}"
      read -p "Do you want to update this value? (y/n) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}Keeping existing value.${NC}"
        return
      fi
    fi
  fi
  
  # Prompt for the value
  local valid=false
  while [ "$valid" = false ]; do
    echo -e "${CYAN}$var_description${NC}"
    read -p "$var_name: " input_value
    
    # Use default if empty and there's a current value
    if [ -z "$input_value" ] && [ -n "$current_value" ]; then
      input_value=$current_value
      echo -e "${YELLOW}Using existing value.${NC}"
    fi
    
    # Skip validation if the function is not provided
    if [ -z "$validation_func" ]; then
      valid=true
    else
      if $validation_func "$input_value"; then
        valid=true
      else
        echo -e "${RED}Invalid format. Please try again.${NC}"
      fi
    fi
  done
  
  # Update the .env file
  if grep -q "^$var_name=" .env; then
    # Replace existing line
    sed -i.bak "s|^$var_name=.*|$var_name=$input_value|" .env && rm .env.bak
  else
    # Add new line
    echo "$var_name=$input_value" >> .env
  fi
  
  echo -e "${GREEN}✓ $var_name updated successfully.${NC}"
  echo
}

# Update OpenAI API key
update_env_var "VITE_OPENAI_API_KEY" "" "Enter your OpenAI API key (starts with sk-)" validate_openai_key

# Update Stripe public key
update_env_var "VITE_STRIPE_PUBLIC_KEY" "" "Enter your Stripe public key (starts with pk_test_ or pk_live_)" validate_stripe_key

# Update Stripe price IDs
update_env_var "VITE_STRIPE_PRICE_MONTHLY" "" "Enter your Stripe monthly price ID (starts with price_)" validate_price_id
update_env_var "VITE_STRIPE_PRICE_YEARLY" "" "Enter your Stripe yearly price ID (starts with price_)" validate_price_id

# Update Supabase project reference
update_env_var "VITE_SUPABASE_PROJECT_REF" "" "Enter your Supabase project reference (alphanumeric ID)" ""

# Optional: Update Supabase Edge Function URL
echo -e "${CYAN}Do you want to configure the Supabase Edge Function URL?${NC}"
read -p "This is optional but recommended for Stripe integration. (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Get the project ref first to help construct the URL
  project_ref=$(grep "^VITE_SUPABASE_PROJECT_REF=" .env | cut -d= -f2)
  default_url=""
  if [ -n "$project_ref" ]; then
    default_url="https://$project_ref.functions.supabase.co/create-checkout-session"
    echo -e "${YELLOW}Suggested URL based on your project ref: $default_url${NC}"
  fi
  
  read -p "Enter Supabase Edge Function URL [$default_url]: " edge_url
  edge_url=${edge_url:-$default_url}
  
  if grep -q "^VITE_SUPABASE_EDGE_FUNCTION_URL=" .env; then
    sed -i.bak "s|^VITE_SUPABASE_EDGE_FUNCTION_URL=.*|VITE_SUPABASE_EDGE_FUNCTION_URL=$edge_url|" .env && rm .env.bak
  else
    echo "VITE_SUPABASE_EDGE_FUNCTION_URL=$edge_url" >> .env
  fi
  
  echo -e "${GREEN}✓ VITE_SUPABASE_EDGE_FUNCTION_URL updated successfully.${NC}"
  echo
fi

# Verify the .env file
echo -e "${BLUE}Verifying .env file...${NC}"
if [ -f ".env" ]; then
  echo -e "${GREEN}✓ .env file exists${NC}"
  
  # Check for required variables
  missing_vars=()
  
  for var in "VITE_OPENAI_API_KEY" "VITE_STRIPE_PUBLIC_KEY" "VITE_STRIPE_PRICE_MONTHLY" "VITE_STRIPE_PRICE_YEARLY" "VITE_SUPABASE_PROJECT_REF"; do
    if ! grep -q "^$var=" .env || [ -z "$(grep "^$var=" .env | cut -d= -f2)" ]; then
      missing_vars+=("$var")
    fi
  done
  
  if [ ${#missing_vars[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All required variables are set${NC}"
  else
    echo -e "${RED}✗ Missing required variables: ${missing_vars[*]}${NC}"
    echo -e "${YELLOW}Please run this script again to set the missing variables.${NC}"
  fi
else
  echo -e "${RED}✗ .env file not found${NC}"
  echo -e "${YELLOW}Something went wrong. Please try again.${NC}"
fi

echo
echo -e "${PURPLE}=== Environment Setup Complete ===${NC}"
echo -e "${CYAN}You can now build and run the application:${NC}"
echo -e "${YELLOW}  npm run build${NC}"
echo -e "${YELLOW}  npx http-server dist -p 5179${NC}"
echo
echo -e "${CYAN}If you encounter any issues, run:${NC}"
echo -e "${YELLOW}  ./check-app-health.sh${NC}"
echo

# Make the script executable
chmod +x check-app-health.sh 2>/dev/null

echo -e "${GREEN}Happy chatting with Bible characters!${NC}"
