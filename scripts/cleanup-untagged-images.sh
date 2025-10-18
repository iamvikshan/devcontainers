#!/bin/bash
set -e

# Script to clean up untagged container images from GitHub Container Registry
# Usage: ./cleanup-untagged-images.sh

GITHUB_TOKEN="${GITHUB_TOKEN}"
AFFECTED_CONTAINERS="${AFFECTED_CONTAINERS}"
REPOSITORY_NAME="${REPOSITORY_NAME}"

if [ -z "$AFFECTED_CONTAINERS" ]; then
  echo "ℹ️  No containers to clean up"
  exit 0
fi

echo "🧹 Cleaning up any untagged images..."

IFS=',' read -ra CONTAINERS <<< "$AFFECTED_CONTAINERS"

for container in "${CONTAINERS[@]}"; do
  container=$(echo "$container" | xargs) # trim whitespace

  echo "🔍 Checking for untagged images for $container..."

  # Clean up untagged images in GitHub Container Registry
  # Note: This uses GitHub API to delete untagged package versions
  curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/user/packages/container/${REPOSITORY_NAME}%2F${container}/versions" \
    | jq -r '.[] | select(.metadata.container.tags | length == 0) | .id' \
    | while read version_id; do
      if [ -n "$version_id" ]; then
        echo "🗑️  Deleting untagged version $version_id for $container"
        curl -s -X DELETE \
          -H "Authorization: Bearer $GITHUB_TOKEN" \
          -H "Accept: application/vnd.github.v3+json" \
          "https://api.github.com/user/packages/container/${REPOSITORY_NAME}%2F${container}/versions/$version_id" || true
      fi
    done
done

echo "✅ Cleanup completed"
