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



# Loop through all directories in the target directory
for dir in */; do
    # Check if the item is a directory
    if [ -d "$dir" ]; then
        # Get the directory name without leading underscores
        new_name=$(echo "$dir" | sed 's/^_*//')
        
        # Remove trailing slash for renaming
        dir_name="${dir%/}"
        new_name="${new_name%/}"
        
        # Check if the new name is different (i.e., underscores were removed)
        if [ "$dir_name" != "$new_name" ]; then
            # Rename the directory
            mv "$dir_name" "$new_name" && {
                echo "Renamed: $dir_name -> $new_name"
            } || {
                echo "Error: Failed to rename $dir_name to $new_name"
            }
        else
            echo "Skipped: $dir_name (no leading underscores or already processed)"
        fi
    fi
done

echo "Processing complete."
