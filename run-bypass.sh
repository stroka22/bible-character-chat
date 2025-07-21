#!/bin/bash
echo "Creating bypass version"
mkdir -p dist-bypass
cp -r dist/* dist-bypass/
echo "<!DOCTYPE html><html><head><title>Bypass Version</title></head><body><h1>Simplified Version</h1><p>This is a simplified version that bypasses API dependencies.</p></body></html>" > dist-bypass/index.html
npx http-server dist-bypass -p 5179
