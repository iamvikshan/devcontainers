#!/bin/bash

# Docker Setup Verification Script
# Verifies that Docker is properly installed and working in the devcontainer

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🐳 Verifying Docker setup in devcontainer..."
echo

# Check if Docker CLI is installed
print_status "Checking Docker CLI installation..."
if command -v docker &> /dev/null; then
  DOCKER_VERSION=$(docker --version)
  print_success "✅ Docker CLI found: $DOCKER_VERSION"
else
  print_error "❌ Docker CLI not found"
  exit 1
fi

# Check if Docker daemon is running
print_status "Checking Docker daemon..."
if docker info &> /dev/null; then
  print_success "✅ Docker daemon is running"
else
  print_error "❌ Docker daemon is not running"
  print_status "Attempting to start Docker daemon..."

  # Try to start Docker service
  if sudo service docker start &> /dev/null; then
    sleep 3
    if docker info &> /dev/null; then
      print_success "✅ Docker daemon started successfully"
    else
      print_error "❌ Failed to start Docker daemon"
      exit 1
    fi
  else
    print_error "❌ Failed to start Docker service"
    exit 1
  fi
fi

# Check Docker Buildx
print_status "Checking Docker Buildx..."
if docker buildx version &> /dev/null; then
  BUILDX_VERSION=$(docker buildx version)
  print_success "✅ Docker Buildx found: $BUILDX_VERSION"
else
  print_warning "⚠️  Docker Buildx not found (optional)"
fi

# Check Docker Compose
print_status "Checking Docker Compose..."
if docker compose version &> /dev/null; then
  COMPOSE_VERSION=$(docker compose version)
  print_success "✅ Docker Compose found: $COMPOSE_VERSION"
else
  print_warning "⚠️  Docker Compose not found (optional)"
fi

# Test basic Docker functionality
print_status "Testing basic Docker functionality..."
if docker run --rm hello-world &> /dev/null; then
  print_success "✅ Docker can run containers successfully"
else
  print_error "❌ Docker failed to run test container"
  exit 1
fi

# Check available space
print_status "Checking available disk space..."
AVAILABLE_SPACE=$(df -h /var/lib/docker 2> /dev/null | awk 'NR==2 {print $4}' || echo "Unknown")
print_success "✅ Available space for Docker: $AVAILABLE_SPACE"

# Test image building capability
print_status "Testing Docker build capability..."
cat > /tmp/test-dockerfile << 'EOF'
FROM alpine:latest
RUN echo "Docker build test successful"
CMD ["echo", "Hello from test container"]
EOF

if docker build -t test-build-capability -f /tmp/test-dockerfile /tmp &> /dev/null; then
  print_success "✅ Docker can build images successfully"

  # Test running the built image
  if docker run --rm test-build-capability &> /dev/null; then
    print_success "✅ Built image runs successfully"
  else
    print_warning "⚠️  Built image failed to run"
  fi

  # Clean up test image
  docker rmi test-build-capability &> /dev/null || true
else
  print_error "❌ Docker failed to build test image"
  exit 1
fi

# Clean up test dockerfile
rm -f /tmp/test-dockerfile

echo
print_success "🎉 Docker setup verification complete!"
print_status "Docker is ready for building devcontainer images."
echo
print_status "💡 You can now run:"
echo "  - npm run build-all    # Build all devcontainer images"
echo "  - npm run build-bun    # Build individual images"
echo "  - docker images        # List available images"
echo "  - docker ps            # List running containers"
