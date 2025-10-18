#!/bin/bash
set -e

# Script to build and push containers to all registries
# Usage: ./build-containers.sh

VERSION_MAP="${VERSION_MAP}"
AFFECTED_CONTAINERS="${AFFECTED_CONTAINERS}"
GITHUB_REGISTRY="${GITHUB_REGISTRY}"
GITLAB_REGISTRY="${GITLAB_REGISTRY}"
GL_USERNAME="${GL_USERNAME}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY}"
REPOSITORY_NAME="${REPOSITORY_NAME}"

if [ -z "$AFFECTED_CONTAINERS" ]; then
  echo "ℹ️  No containers to build"
  exit 0
fi

IFS=',' read -ra CONTAINERS <<< "$AFFECTED_CONTAINERS"

for container in "${CONTAINERS[@]}"; do
  container=$(echo "$container" | xargs) # trim whitespace
  version=$(echo "$VERSION_MAP" | jq -r ".[\"$container\"] // \"latest\"")

  echo "🔨 Building $container:$version..."

  # Determine dockerfile path - all images are now in images/ directory
  dockerfile_path="images/$container/Dockerfile"
  context_dir="images/$container"

  if [ -f "$dockerfile_path" ]; then
    echo "🔨 Building $container:$version locally first..."

    # Build image locally first (no push) with optimizations
    docker buildx build \
      --file "$dockerfile_path" \
      --load \
      --platform linux/amd64 \
      --provenance=false \
      --compress \
      --tag "local-${container}:${version}" \
      "$context_dir"

    # Tag for all registries first
    echo "🏷️  Tagging image for all registries..."
    docker tag "local-${container}:${version}" "${GITHUB_REGISTRY}/${GITHUB_REPOSITORY}/${container}:v${version}"
    docker tag "local-${container}:${version}" "${GITLAB_REGISTRY}/${GL_USERNAME}/${REPOSITORY_NAME}/${container}:v${version}"
    docker tag "local-${container}:${version}" "${GL_USERNAME}/${container}:v${version}"

    # Also tag as latest
    docker tag "local-${container}:${version}" "${GITHUB_REGISTRY}/${GITHUB_REPOSITORY}/${container}:latest"
    docker tag "local-${container}:${version}" "${GITLAB_REGISTRY}/${GL_USERNAME}/${REPOSITORY_NAME}/${container}:latest"
    docker tag "local-${container}:${version}" "${GL_USERNAME}/${container}:latest"

    # Push to all registries in parallel for faster deployment
    echo "📦 Pushing to all registries in parallel..."
    (
      echo "📦 Pushing to GitHub Container Registry..."
      docker push "${GITHUB_REGISTRY}/${GITHUB_REPOSITORY}/${container}:v${version}" \
        && docker push "${GITHUB_REGISTRY}/${GITHUB_REPOSITORY}/${container}:latest" \
        && echo "✅ GitHub Container Registry push completed"
    ) &

    (
      echo "📦 Pushing to GitLab Container Registry..."
      docker push "${GITLAB_REGISTRY}/${GL_USERNAME}/${REPOSITORY_NAME}/${container}:v${version}" \
        && docker push "${GITLAB_REGISTRY}/${GL_USERNAME}/${REPOSITORY_NAME}/${container}:latest" \
        && echo "✅ GitLab Container Registry push completed"
    ) &

    (
      echo "📦 Pushing to Docker Hub..."
      docker push "${GL_USERNAME}/${container}:v${version}" \
        && docker push "${GL_USERNAME}/${container}:latest" \
        && echo "✅ Docker Hub push completed"
    ) &

    # Wait for all pushes to complete
    wait

    # Clean up local image and unused tags
    echo "🧹 Cleaning up local images..."
    docker rmi "local-${container}:${version}" \
      "${GITHUB_REGISTRY}/${GITHUB_REPOSITORY}/${container}:v${version}" \
      "${GITHUB_REGISTRY}/${GITHUB_REPOSITORY}/${container}:latest" \
      "${GITLAB_REGISTRY}/${GL_USERNAME}/${REPOSITORY_NAME}/${container}:v${version}" \
      "${GITLAB_REGISTRY}/${GL_USERNAME}/${REPOSITORY_NAME}/${container}:latest" \
      "${GL_USERNAME}/${container}:v${version}" \
      "${GL_USERNAME}/${container}:latest" || true

    echo "✅ Built and pushed $container:$version"

    # Close any existing build failure issues
    if command -v bun &> /dev/null; then
      bun scripts/issueManager.ts --close-success --container="$container" --version="$version" --silent || true
    fi
  else
    echo "❌ Dockerfile not found: $dockerfile_path"

    # Create build failure issue
    if command -v bun &> /dev/null; then
      bun scripts/issueManager.ts \
        --container="$container" \
        --version="$version" \
        --error="Dockerfile not found: $dockerfile_path" \
        --workflow="${GITHUB_WORKFLOW}" \
        --run-id="${GITHUB_RUN_ID}" \
        --silent || true
    fi

    exit 1
  fi
done

echo "✅ All containers built and pushed successfully"
