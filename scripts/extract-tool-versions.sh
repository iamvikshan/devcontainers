#!/bin/bash
set -e

# Script to extract tool versions from built containers
# Usage: ./extract-tool-versions.sh

VERSION_MAP="${VERSION_MAP}"
AFFECTED_CONTAINERS="${AFFECTED_CONTAINERS}"

if [ -z "$AFFECTED_CONTAINERS" ]; then
  echo "ℹ️  No containers to extract tool versions from"
  exit 0
fi

echo "⏳ Waiting for images to be available across all registries..."
sleep 30

echo "🔍 Extracting tool versions from built containers..."
echo "🔍 Extracting from GitHub Container Registry images..."

# Initialize empty results array
echo "[]" > tool-versions.json

IFS=',' read -ra CONTAINERS <<< "$AFFECTED_CONTAINERS"

for container in "${CONTAINERS[@]}"; do
  container=$(echo "$container" | xargs) # trim whitespace
  version=$(echo "$VERSION_MAP" | jq -r ".[\"$container\"] // \"latest\"")

  echo "📋 Extracting tool versions from $container:v$version..."

  # Extract tool versions for this specific container and version
  if bun scripts/toolVersionExtractor.ts --registry=ghcr --containers="$container" --version="v$version" --output="temp-$container.json" --silent; then
    echo "✅ Successfully extracted tool versions from $container:v$version"

    # Merge the results into the main tool-versions.json file
    if [ -f "temp-$container.json" ]; then
      # Merge the new results with existing results
      jq -s 'add' tool-versions.json "temp-$container.json" > merged-tool-versions.json
      mv merged-tool-versions.json tool-versions.json
      rm "temp-$container.json"
    fi
  else
    echo "⚠️  Failed to extract tool versions from $container:v$version, continuing with other containers..."
  fi
done

echo "📊 Extracted tool versions from $(jq length tool-versions.json) containers"
