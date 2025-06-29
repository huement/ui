#!/bin/bash

# Script to optimize images in a directory for web use and rename them
# Usage: ./optimize_jpgs.sh [directory] [prefix]
# - directory: Path to directory with images (defaults to script's directory)
# - prefix: Custom prefix for output files (defaults to 'webphoto')

# Set directory (first argument or script's directory)
DIR="${1:-$(dirname "$0")}"

ANSI_BINARY="/Users/eris/Developer/hui/bin/ansi"
if [[ ! -f "$ANSI_BINARY" || ! -x "$ANSI_BINARY" ]]; then
    echo "Error: 'ansi' binary not found or not executable in $(dirname "$0")"
    exit 1
fi

# Function to print colored messages using ansi
print_msg() {
    local type="$1"
    local msg="$2"
    case "$type" in
        "info") "$ANSI_BINARY" --green "$msg" ;;
        "error") "$ANSI_BINARY" --red "$msg" ;;
        "success") "$ANSI_BINARY" --cyan "$msg" ;;
        "header") "$ANSI_BINARY" --bold --underline "$msg" ;;
    esac
}

# Check if ImageMagick is installed, install via Homebrew if not
check_imagemagick() {
    if ! command -v convert >/dev/null 2>&1; then
        print_msg "error" "ImageMagick not found. Installing via Homebrew..."
        if ! command -v brew >/dev/null 2>&1; then
            print_msg "error" "Homebrew not installed. Please install Homebrew first: https://brew.sh"
            exit 1
        fi
        brew install imagemagick
        if [[ $? -ne 0 ]]; then
            print_msg "error" "Failed to install ImageMagick. Please install it manually."
            exit 1
        fi
        print_msg "success" "ImageMagick installed successfully."
    else
        print_msg "info" "ImageMagick is already installed."
    fi
}

if [[ ! -d "$DIR" ]]; then
    print_msg "error" "Directory '$DIR' does not exist."
    exit 1
fi
# Convert to absolute path
DIR=$(realpath "$DIR")

# Set prefix (second argument or default to 'webphoto')
PREFIX="${2:-webphoto}"

# Create output directories for optimized files and thumbnails
OUTPUT_DIR="$DIR/optimized"
THUMBS_DIR="$DIR/optimized/thumbs"

mkdir -p "$OUTPUT_DIR" "$THUMBS_DIR"
if [[ $? -ne 0 ]]; then
    print_msg "error" "Failed to create output directories."
    exit 1
fi

# Print header
print_msg "header" "Optimizing images in '$DIR' with prefix '$PREFIX'"

# Check for ImageMagick
check_imagemagick

# Counter for naming files
COUNTER=0

# Store files in an array using a more compatible method
FILES=()
while IFS= read -r file; do
    FILES+=("$file")
done < <(find "$DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \))

# Process each file
for FILE in "${FILES[@]}"; do
    # Skip files already in the optimized or thumbs directories
    if [[ "$FILE" == "$OUTPUT_DIR/"* ]] || [[ "$FILE" == "$THUMBS_DIR/"* ]]; then
        continue
    fi

    BASENAME=$(basename "$FILE")
    EXTENSION="${BASENAME##*.}"
    FILENAME="${BASENAME%.*}"
    
    # Standardize JPEG extensions to .jpg
    EXTENSION_LOWER=$(echo "$EXTENSION" | tr '[:upper:]' '[:lower:]')
    if [[ "$EXTENSION_LOWER" == "jpeg" ]]; then
        EXTENSION="jpg"
    fi
    
    OUTPUT_FILE="$OUTPUT_DIR/${FILENAME}.${EXTENSION}"
    THUMB_FILE="$THUMBS_DIR/${FILENAME}.${EXTENSION}"

    print_msg "info" "Processing '$OUTPUT_DIR/${FILENAME}.${EXTENSION}'"

    # Optimize and resize main image

    if [[ "$EXTENSION_LOWER" == "png" ]]; then
        # PNG optimization
        mogrify -strip -interlace Plane -sampling-factor 4:2:0 -quality 85% "$FILE"
        # magick "$FILE" -resize 1440x\> -strip -define png:compression-level=9 -define png:compression-strategy=0 "$OUTPUT_FILE"
    else
        # JPEG optimization
        mogrify -strip -interlace Plane -sampling-factor 4:2:0 -quality 85% "$FILE"
        # magick "$FILE" -resize 1440x\> -quality 85 -strip "$OUTPUT_FILE"
    fi

    if [[ $? -eq 0 ]]; then
        print_msg "success" "Optimized '$BASENAME' to '$OUTPUT_FILE'"
        
        # Create thumbnail
        if [[ "$EXTENSION_LOWER" == "png" ]]; then
            # PNG thumbnail
            magick "$FILE" -resize 200x200\> -strip -define png:compression-level=9 -define png:compression-strategy=0 "$THUMB_FILE"
        else
            # JPEG thumbnail
            magick "$FILE" -resize 200x200\> -quality 75 -strip "$THUMB_FILE"
        fi
        
        if [[ $? -eq 0 ]]; then
            print_msg "success" "Created thumbnail '$THUMB_FILE'"
        else
            print_msg "error" "Failed to create thumbnail for '$BASENAME'"
        fi
        
        (( COUNTER++ ))
    else
        print_msg "error" "Failed to optimize '$BASENAME'"
    fi
done

# Check if any files were processed
if [[ $COUNTER -eq 0 ]]; then
    print_msg "error" "No image files found in '$DIR'."
else
    print_msg "success" "Optimization complete. Files saved in '$OUTPUT_DIR' and thumbnails in '$THUMBS_DIR'."
fi