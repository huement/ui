#!/bin/bash

# Check if a directory parameter is provided
if [ -z "$1" ]; then
    echo "Error: Please provide a target directory as the first parameter."
    echo "Usage: $0 <target_directory>"
    exit 1
fi

# Check if the provided directory exists
if [ ! -d "$1" ]; then
    echo "Error: Directory '$1' does not exist."
    exit 1
fi

# Move to the target directory
cd "$1" || {
    echo "Error: Could not change to directory '$1'."
    exit 1
}

# Find all .scss files that don't start with underscore
find . -type f -name "*.scss" | while read -r file; do
    # Get the filename without path
    filename=$(basename "$file")
    
    # Check if the filename doesn't start with underscore
    if [[ ! "$filename" =~ ^_ ]]; then
        # Get the directory path
        dirpath=$(dirname "$file")
        # Create new filename with underscore prefix
        new_filename="_$filename"
        # Create the full new path
        new_path="$dirpath/$new_filename"
        
        # Rename the file
        mv "$file" "$new_path" && {
            echo "Renamed: $file -> $new_path"
        } || {
            echo "Error: Failed to rename $file to $new_path"
        }
    else
        echo "Skipped: $file (already has underscore prefix)"
    fi
done

echo "Processing complete." 