#!/bin/bash
set -e

# Script to extract tool versions from built containers
# OPTIMIZED: Extracts from ONE representative container instead of all
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

# Select representative container with most complete toolset
# Priority: 1) *-node containers, 2) ubuntu-* containers, 3) first container
REPRESENTATIVE=""
echo "🧠 Selecting representative container for tool extraction..."

# First pass: Look for *-node containers (have most tools)
for container in "${CONTAINERS[@]}"; do
  container=$(echo "$container" | xargs) # trim whitespace
  if [[ "$container" == *"-node" ]]; then
    REPRESENTATIVE="$container"
    echo "✅ Selected '$REPRESENTATIVE' (node-based container with full toolset)"
    break
  fi
done

# Second pass: If no node container, look for ubuntu-* containers
if [ -z "$REPRESENTATIVE" ]; then
  for container in "${CONTAINERS[@]}"; do
    container=$(echo "$container" | xargs)
    if [[ "$container" == ubuntu-* || "$container" == *-ubuntu-* ]]; then
      REPRESENTATIVE="$container"
      echo "✅ Selected '$REPRESENTATIVE' (Ubuntu-based container)"
      break
    fi
  done
fi

# Final fallback: Use first container
if [ -z "$REPRESENTATIVE" ]; then
  REPRESENTATIVE=$(echo "${CONTAINERS[0]}" | xargs)
  echo "✅ Selected '$REPRESENTATIVE' (first available container)"
fi

echo "📦 Extracting tool versions from: $REPRESENTATIVE"
echo "ℹ️  These versions will be used for all ${#CONTAINERS[@]} containers in this release"

# Extract only from the representative container
container="$REPRESENTATIVE"
version=$(echo "$VERSION_MAP" | jq -r ".[\"$container\"] // \"latest\"")

version=$(echo "$VERSION_MAP" | jq -r ".[\"$container\"] // \"latest\"")

echo "📋 Extracting tool versions from $container:v$version (representative)..."

# Extract tool versions for this specific container and version
if bun scripts/toolVersionExtractor.ts --registry=ghcr --containers="$container" --version="v$version" --output="temp-$container.json" --silent; then
  echo "✅ Successfully extracted tool versions from representative container"
  echo "📊 Tool versions will be applied to all containers in this release"

  # Merge the results into the main tool-versions.json file
  if [ -f "temp-$container.json" ]; then
    # Merge the new results with existing results
    jq -s 'add' tool-versions.json "temp-$container.json" > merged-tool-versions.json
    mv merged-tool-versions.json tool-versions.json
    rm "temp-$container.json"
  fi
else
  echo "⚠️  Failed to extract tool versions from $container:v$version"
  echo "ℹ️  Release will continue without tool version updates"
fi

echo "📊 Extracted tool versions from 1 representative container (instead of ${#CONTAINERS[@]})"
echo "⚡ Time saved: ~$((${#CONTAINERS[@]} - 1)) container pulls"
