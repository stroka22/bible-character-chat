#!/usr/bin/env bash

# Banner image processor for FaithTalkAI
# Crops and resizes source banner to web-optimized hero assets
# Usage: ./process_banner.sh [input_image_path]

# Strict error handling
set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default input and output paths
INPUT_PATH="${1:-public/images/source-banner.jpg}"
OUTPUT_DIR="public/images/sales/variants"
PRIMARY_OUTPUT="public/images/complete-bible.jpg"
VARIANT_OUTPUT="${OUTPUT_DIR}/banner-1920x1080.jpg"

# Temp files
TEMP_DIR="/tmp/banner-processing"
TEMP_NORMALIZED="${TEMP_DIR}/normalized.jpg"

echo -e "${BLUE}FaithTalkAI Banner Processor${NC}"
echo "============================="

# Check if input file exists
if [ ! -f "$INPUT_PATH" ]; then
  echo "Error: Input file not found at $INPUT_PATH"
  exit 1
fi

# Create output directories
mkdir -p "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

echo "Processing source image: $INPUT_PATH"

# Normalize color profile and convert to JPEG
echo "→ Normalizing color profile..."
sips --setProperty format jpeg --setProperty formatOptions 90 "$INPUT_PATH" --out "$TEMP_NORMALIZED"

# Generate 2400x1350 primary hero (16:9)
echo "→ Creating 2400×1350 primary hero..."
# First scale to maintain aspect ratio while ensuring one dimension is large enough
sips -Z 2400 "$TEMP_NORMALIZED" --out "${TEMP_DIR}/scaled-2400.jpg"
# Then center crop to exact dimensions
sips -c 1350 2400 "${TEMP_DIR}/scaled-2400.jpg" --out "$PRIMARY_OUTPUT"

# Generate 1920x1080 variant (16:9)
echo "→ Creating 1920×1080 variant..."
# First scale to maintain aspect ratio while ensuring one dimension is large enough
sips -Z 1920 "$TEMP_NORMALIZED" --out "${TEMP_DIR}/scaled-1920.jpg"
# Then center crop to exact dimensions
sips -c 1080 1920 "${TEMP_DIR}/scaled-1920.jpg" --out "$VARIANT_OUTPUT"

# Clean up temp files
rm -rf "$TEMP_DIR"

# Get file sizes
PRIMARY_SIZE=$(du -h "$PRIMARY_OUTPUT" | cut -f1)
VARIANT_SIZE=$(du -h "$VARIANT_OUTPUT" | cut -f1)

echo -e "\n${GREEN}✓ Processing complete!${NC}"
echo "Primary hero: $PRIMARY_OUTPUT ($PRIMARY_SIZE)"
echo "Variant: $VARIANT_OUTPUT ($VARIANT_SIZE)"
echo -e "\nNext steps:"
echo "1. Verify images look good"
echo "2. git add public/images/"
echo "3. git commit -m \"Add sales banner images\""
echo "4. git push origin main"
