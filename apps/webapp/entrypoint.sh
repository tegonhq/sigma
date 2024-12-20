#!/usr/bin/env bash

# Function to create sed replacement commands
makeSedCommands() {
  printenv | \
      grep '^NEXT_PUBLIC' | \
      sed -r 's/([^=]*)=(.*)/s#PROD_\1#\2#g/'
}

# Export environment variables for Alpine compatibility
export NEXT_PUBLIC

# Set the delimiter to newlines (needed for looping over the function output)
IFS=$'\n'

# Collect sed commands
sed_commands=$(makeSedCommands)

# Ensure the target directory exists
TARGET_DIR="apps/webapp/.next"
if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: Target directory '$TARGET_DIR' does not exist."
  exit 1
fi

# For each file in the target directory
for f in $(find "$TARGET_DIR" -type f); do
  # Apply each sed command to the file
  for cmd in $sed_commands; do
    sed -i "$cmd" "$f"
  done
done

exec dumb-init node --max-old-space-size=8192 apps/webapp/server.js