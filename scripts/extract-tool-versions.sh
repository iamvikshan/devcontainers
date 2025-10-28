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

# Select TWO representative containers: one Alpine-based and one Ubuntu-based
# This ensures we get accurate versions for both base image types
ALPINE_REP=""
UBUNTU_REP=""
echo "🧠 Selecting representative containers for tool extraction..."

# Find Alpine-based representative (bun-node preferred, then bun)
for container in "${CONTAINERS[@]}"; do
  container=$(echo "$container" | xargs) # trim whitespace
  # Alpine images: bun, bun-node, gitpod-bun, gitpod-bun-node
  if [[ "$container" =~ ^(bun-node|gitpod-bun-node)$ ]]; then
    ALPINE_REP="$container"
    echo "✅ Selected '$ALPINE_REP' for Alpine-based versions (node-enabled)"
    break
  elif [[ "$container" =~ ^(bun|gitpod-bun)$ ]] && [ -z "$ALPINE_REP" ]; then
    ALPINE_REP="$container"
  fi
done

if [ -n "$ALPINE_REP" ]; then
  echo "✅ Selected '$ALPINE_REP' for Alpine-based versions"
fi

# Find Ubuntu-based representative (ubuntu-bun-node preferred, then ubuntu-bun)
for container in "${CONTAINERS[@]}"; do
  container=$(echo "$container" | xargs)
  # Ubuntu images: ubuntu-bun, ubuntu-bun-node, gitpod-ubuntu-bun, gitpod-ubuntu-bun-node
  if [[ "$container" =~ ^(ubuntu-bun-node|gitpod-ubuntu-bun-node)$ ]]; then
    UBUNTU_REP="$container"
    echo "✅ Selected '$UBUNTU_REP' for Ubuntu-based versions (node-enabled)"
    break
  elif [[ "$container" =~ ^(ubuntu-bun|gitpod-ubuntu-bun)$ ]] && [ -z "$UBUNTU_REP" ]; then
    UBUNTU_REP="$container"
  fi
done

if [ -n "$UBUNTU_REP" ]; then
  echo "✅ Selected '$UBUNTU_REP' for Ubuntu-based versions"
fi

# Fallback: if we only have one type, use first container
if [ -z "$ALPINE_REP" ] && [ -z "$UBUNTU_REP" ]; then
  ALPINE_REP=$(echo "${CONTAINERS[0]}" | xargs)
  echo "⚠️  Using '$ALPINE_REP' as fallback (first available container)"
fi

echo "📦 Extracting tool versions from representative containers:"
[ -n "$ALPINE_REP" ] && echo "  - Alpine: $ALPINE_REP"
[ -n "$UBUNTU_REP" ] && echo "  - Ubuntu: $UBUNTU_REP"

# Extract from Alpine representative
if [ -n "$ALPINE_REP" ]; then
  container="$ALPINE_REP"
  version=$(echo "$VERSION_MAP" | jq -r ".[\"$container\"] // \"latest\"")
  
  echo "📋 Extracting tool versions from $container:v$version (Alpine representative)..."
  
  if bun scripts/toolVersionExtractor.ts --registry=ghcr --containers="$container" --version="v$version" --output="temp-$container.json" --silent; then
    echo "✅ Successfully extracted Alpine-based tool versions"
    
    if [ -f "temp-$container.json" ]; then
      jq -s 'add' tool-versions.json "temp-$container.json" > merged-tool-versions.json
      mv merged-tool-versions.json tool-versions.json
      rm "temp-$container.json"
    fi
  else
    echo "⚠️  Failed to extract tool versions from Alpine container"
  fi
fi

# Extract from Ubuntu representative
if [ -n "$UBUNTU_REP" ]; then
  container="$UBUNTU_REP"
  version=$(echo "$VERSION_MAP" | jq -r ".[\"$container\"] // \"latest\"")
  
  echo "📋 Extracting tool versions from $container:v$version (Ubuntu representative)..."
  
  if bun scripts/toolVersionExtractor.ts --registry=ghcr --containers="$container" --version="v$version" --output="temp-$container.json" --silent; then
    echo "✅ Successfully extracted Ubuntu-based tool versions"
    
    if [ -f "temp-$container.json" ]; then
      jq -s 'add' tool-versions.json "temp-$container.json" > merged-tool-versions.json
      mv merged-tool-versions.json tool-versions.json
      rm "temp-$container.json"
    fi
  else
    echo "⚠️  Failed to extract tool versions from Ubuntu container"
  fi
fi

TOTAL_EXTRACTED=$(([ -n "$ALPINE_REP" ] && echo 1 || echo 0) + ([ -n "$UBUNTU_REP" ] && echo 1 || echo 0))
echo "📊 Extracted tool versions from $TOTAL_EXTRACTED representative container(s)"
echo "⚡ Versions will be applied to documentation based on base image type"
