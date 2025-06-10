#!/bin/bash

# ASCII Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ASCII Separator
SEPARATOR="================================================"

# Print header
echo -e "${BLUE}${SEPARATOR}${NC}"
echo -e "${BLUE}    Bootstrap Import Fix Script${NC}"
echo -e "${BLUE}${SEPARATOR}${NC}"

# Check if a directory parameter is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide a target directory as the first parameter.${NC}"
    echo -e "${YELLOW}Usage: $0 <target_directory>${NC}"
    exit 1
fi

# Check if the provided directory exists
if [ ! -d "$1" ]; then
    echo -e "${RED}Error: Directory '$1' does not exist.${NC}"
    exit 1
fi

# Set scriptMode based on second parameter
if [ -n "$2" ]; then
    scriptMode="noTilde"
    scriptDetails="removes any found tildes. used in dart-sass"
else
    scriptMode="tilde"
    scriptDetails="adds tildes to imports. used in vite.js"
fi

echo -e "${GREEN}Running in ${YELLOW}${scriptMode}${GREEN} mode${NC}"
echo -e "${GREEN}${scriptDetails}${NC}"
echo -e "${BLUE}${SEPARATOR}${NC}"


# Find all .scss files recursively and process them
find "$1" -type f -name "*.scss" | while read -r file; do
    echo -e "${BLUE}Processing:${NC} $file"
    
    # Check if the file contains the bootstrap import
    if grep -q "@import 'bootstrap/scss" "$file"; then
        # Create a temporary file
        temp_file=$(mktemp)
        
        # Replace the import statement based on tildeMode
        if [ "$scriptMode" = "noTilde" ]; then
            sed "s/@import 'bootstrap\/scss/@import '~bootstrap\/scss/" "$file" > "$temp_file"
        else
            sed "s/@import '~bootstrap\/scss/@import 'bootstrap\/scss/" "$file" > "$temp_file"
        fi
        
        # Move the temp file back to original
        mv "$temp_file" "$file"
        
        echo -e "${GREEN}✓ Updated:${NC} $file"
    else
        echo -e "${YELLOW}⚠ Skipped:${NC} $file (no bootstrap import found)"
    fi
done

echo -e "${BLUE}${SEPARATOR}${NC}"
echo -e "${GREEN}Processing complete.${NC}"
echo -e "${BLUE}${SEPARATOR}${NC}" 

