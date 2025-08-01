#!/bin/bash

# Build All DevContainer Images Script
# This script builds all devcontainer images locally for testing

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to build an image
build_image() {
    local dockerfile_path=$1
    local image_name=$2
    local context_dir=$3
    
    print_status "Building $image_name..."
    echo "  Dockerfile: $dockerfile_path"
    echo "  Context: $context_dir"
    
    if docker build -f "$dockerfile_path" -t "devcontainers/$image_name:test" "$context_dir"; then
        print_success "✅ $image_name built successfully"
        
        # Get image size
        local size=$(docker images "devcontainers/$image_name:test" --format "table {{.Size}}" | tail -n 1)
        echo "  📊 Size: $size"
        
        # Get layer count
        local layers=$(docker history "devcontainers/$image_name:test" --quiet | wc -l)
        echo "  📦 Layers: $layers"
        
        return 0
    else
        print_error "❌ Failed to build $image_name"
        return 1
    fi
}

# Function to test an image
test_image() {
    local image_name=$1
    
    print_status "Testing $image_name..."
    
    # Test that the image can run
    if docker run --rm "devcontainers/$image_name:test" echo "Container test successful"; then
        print_success "✅ $image_name runs successfully"
    else
        print_error "❌ $image_name failed to run"
        return 1
    fi
    
    # Test specific tools based on image type
    case $image_name in
        *bun*)
            print_status "Testing Bun installation..."
            if docker run --rm "devcontainers/$image_name:test" bun --version; then
                print_success "✅ Bun is working"
            else
                print_error "❌ Bun is not working"
                return 1
            fi
            ;;
    esac
    
    case $image_name in
        *node*)
            print_status "Testing Node.js installation..."
            if docker run --rm "devcontainers/$image_name:test" node --version; then
                print_success "✅ Node.js is working"
            else
                print_error "❌ Node.js is not working"
                return 1
            fi
            
            print_status "Testing npm installation..."
            if docker run --rm "devcontainers/$image_name:test" npm --version; then
                print_success "✅ npm is working"
            else
                print_error "❌ npm is not working"
                return 1
            fi
            ;;
    esac
    
    # Test Git (should be in all images)
    print_status "Testing Git installation..."
    if docker run --rm "devcontainers/$image_name:test" git --version; then
        print_success "✅ Git is working"
    else
        print_error "❌ Git is not working"
        return 1
    fi
}

# Main build process
main() {
    print_status "🚀 Starting DevContainer image builds..."
    echo
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
    
    local failed_builds=()
    local successful_builds=()
    
    # Build bun image
    echo "==================== BUN IMAGE ===================="
    if build_image "base/bun/.devcontainer/Dockerfile" "bun" "base/bun/.devcontainer"; then
        if test_image "bun"; then
            successful_builds+=("bun")
        else
            failed_builds+=("bun (test failed)")
        fi
    else
        failed_builds+=("bun (build failed)")
    fi
    echo
    
    # Build bun-node image
    echo "================== BUN-NODE IMAGE =================="
    if build_image "base/bun-node/.devcontainer/Dockerfile" "bun-node" "base/bun-node/.devcontainer"; then
        if test_image "bun-node"; then
            successful_builds+=("bun-node")
        else
            failed_builds+=("bun-node (test failed)")
        fi
    else
        failed_builds+=("bun-node (build failed)")
    fi
    echo
    
    # Build ubuntu-bun image
    echo "================= UBUNTU-BUN IMAGE ================="
    if build_image "base/ubuntu/bun/Dockerfile" "ubuntu-bun" "base/ubuntu/bun"; then
        if test_image "ubuntu-bun"; then
            successful_builds+=("ubuntu-bun")
        else
            failed_builds+=("ubuntu-bun (test failed)")
        fi
    else
        failed_builds+=("ubuntu-bun (build failed)")
    fi
    echo
    
    # Build ubuntu-bun-node image
    echo "============== UBUNTU-BUN-NODE IMAGE ==============="
    if build_image "base/ubuntu/bun-node/Dockerfile" "ubuntu-bun-node" "base/ubuntu/bun-node"; then
        if test_image "ubuntu-bun-node"; then
            successful_builds+=("ubuntu-bun-node")
        else
            failed_builds+=("ubuntu-bun-node (test failed)")
        fi
    else
        failed_builds+=("ubuntu-bun-node (build failed)")
    fi
    echo
    
    # Summary
    echo "==================== SUMMARY ===================="
    
    if [ ${#successful_builds[@]} -gt 0 ]; then
        print_success "✅ Successful builds (${#successful_builds[@]}):"
        for build in "${successful_builds[@]}"; do
            echo "  - $build"
        done
    fi
    
    if [ ${#failed_builds[@]} -gt 0 ]; then
        print_error "❌ Failed builds (${#failed_builds[@]}):"
        for build in "${failed_builds[@]}"; do
            echo "  - $build"
        done
        echo
        print_error "Some builds failed. Please check the output above for details."
        exit 1
    else
        print_success "🎉 All images built and tested successfully!"
        echo
        print_status "📋 Built images:"
        docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | grep "devcontainers/"
    fi
}

# Cleanup function
cleanup() {
    print_status "🧹 Cleaning up test images..."
    docker rmi $(docker images "devcontainers/*:test" -q) 2>/dev/null || true
    print_success "Cleanup complete"
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"
