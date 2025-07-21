#!/bin/bash

# Bible Character Chat - Server Restart Script
# This script kills any existing server on port 8001 and starts a new one

# Display header
echo "====================================================="
echo "    Bible Character Chat - Server Restart Script"
echo "====================================================="

# Navigate to the application directory
cd /Users/brian/bible-character-chat || {
    echo "ERROR: Could not navigate to application directory"
    exit 1
}

# Find and kill any process using port 8001
echo "Checking for processes using port 8001..."
PID=$(lsof -ti:8001)

if [ -n "$PID" ]; then
    echo "Found process $PID using port 8001. Terminating..."
    kill -9 $PID
    sleep 1
    echo "Process terminated."
else
    echo "No process found using port 8001."
fi

# Start the HTTP server
echo "Starting HTTP server on port 8001..."
echo "Serving files from: $(pwd)"
echo "====================================================="
echo "Recommended (full-feature build):"
echo "  => http://localhost:8001/public/character-chat.html"
echo ""
echo "Legacy fallback:"
echo "  => http://localhost:8001/public/standalone-chat-improved.html"
echo "====================================================="
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python3 -m http.server 8001

# This code will only execute if the server stops
echo "Server has stopped."
