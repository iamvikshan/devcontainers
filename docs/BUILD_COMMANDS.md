# Docker Build Commands Reference

## 🐳 Docker Setup

The devcontainer includes Docker-in-Docker for building and testing images locally.

### Verify Docker Setup

```bash
# Check that Docker is properly installed and working
docker version
```

## 🚀 Quick Build Commands

### Build All Images (Recommended)

```bash
# Build every image from the repository root
set -e

for image in bun bun-node ubuntu-bun ubuntu-bun-node ubuntu-tools; do
  docker build -t "devcontainers/${image}:test" "images/${image}"
done
```

### Build Individual Images

```bash
# Build bun image
docker build -t devcontainers/bun:test images/bun

# Build bun-node image
docker build -t devcontainers/bun-node:test images/bun-node

# Build ubuntu-bun image
docker build -t devcontainers/ubuntu-bun:test images/ubuntu-bun

# Build ubuntu-bun-node image
docker build -t devcontainers/ubuntu-bun-node:test images/ubuntu-bun-node

# Build ubuntu-tools image
docker build -t devcontainers/ubuntu-tools:test images/ubuntu-tools
```

## 🔧 Manual Docker Commands

### Bun Image

```bash
docker build -t devcontainers/bun:test images/bun
```

### Bun-Node Image

```bash
docker build -t devcontainers/bun-node:test images/bun-node
```

### Ubuntu-Bun Image

```bash
docker build -t devcontainers/ubuntu-bun:test images/ubuntu-bun
```

### Ubuntu-Bun-Node Image

```bash
docker build -t devcontainers/ubuntu-bun-node:test images/ubuntu-bun-node
```

### Ubuntu-Tools Image

```bash
docker build -t devcontainers/ubuntu-tools:test images/ubuntu-tools
```

## 🧪 Testing Built Images

### Test Image Runs

```bash
# Test bun image
docker run --rm devcontainers/bun:test echo "Hello from Bun!"

# Test bun-node image
docker run --rm devcontainers/bun-node:test echo "Hello from Bun+Node!"

# Test ubuntu-bun image
docker run --rm devcontainers/ubuntu-bun:test echo "Hello from Ubuntu+Bun!"

# Test ubuntu-bun-node image
docker run --rm devcontainers/ubuntu-bun-node:test echo "Hello from Ubuntu+Bun+Node!"

# Test ubuntu-tools image
docker run --rm devcontainers/ubuntu-tools:test echo "Hello from Ubuntu tools!"
```

### Test Installed Tools

```bash
# Test Bun installation
docker run --rm devcontainers/bun:test bun --version

# Test Node.js installation (in node images)
docker run --rm devcontainers/bun-node:test node --version
docker run --rm devcontainers/bun-node:test npm --version

# Test Git installation (all images)
docker run --rm devcontainers/bun:test git --version

# Test Python and jq installation (ubuntu-tools image)
docker run --rm devcontainers/ubuntu-tools:test python3 --version
docker run --rm devcontainers/ubuntu-tools:test jq --version
```

### Interactive Testing

```bash
# Start interactive shell in any image
docker run -it --rm devcontainers/bun:test zsh
docker run -it --rm devcontainers/bun-node:test zsh
docker run -it --rm devcontainers/ubuntu-bun:test zsh
docker run -it --rm devcontainers/ubuntu-bun-node:test zsh
docker run -it --rm devcontainers/ubuntu-tools:test zsh
```

## 📊 Image Inspection

### View Image Details

```bash
# List all built images
docker images --filter=reference='devcontainers/*'

# View image history (layers)
docker history devcontainers/bun:test

# Inspect image configuration
docker inspect devcontainers/bun:test
```

### Size Analysis

```bash
# Compare image sizes
docker images --filter=reference='devcontainers/*' --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Detailed size analysis
docker system df -v
```

## 🧹 Cleanup

### Remove Test Images

```bash
# Remove all test images
docker rmi $(docker images --filter=reference='devcontainers/*:test' -q)

# Remove specific test image
docker rmi devcontainers/bun:test
```

### Clean Docker System

```bash
# Remove unused images, containers, networks
docker system prune

# Remove everything (be careful!)
docker system prune -a
```

## 🐛 Troubleshooting

### Common Issues

1. **Docker not found**

   ```bash
   # Install Docker Desktop or Docker Engine
   # Make sure Docker daemon is running
   docker --version
   ```

2. **Permission denied**

   ```bash
   # Add user to docker group (Linux)
   sudo usermod -aG docker $USER
   # Then logout and login again
   ```

3. **Build context too large**

   ```bash
   # Check .dockerignore file exists
   # Make sure unnecessary files are excluded
   ```

4. **Out of disk space**
   ```bash
   # Clean up Docker system
   docker system prune -a
   ```

### Build Debugging

```bash
# Build with verbose output
docker build --progress=plain -t devcontainers/bun:test images/bun

# Build without cache
docker build --no-cache -t devcontainers/bun:test images/bun
```

## 🎯 Image Optimization Tips

### Best Practices for Smaller Images

1. **Combine RUN commands** to reduce layers:

   ```dockerfile
   RUN apt-get update && apt-get install -y \
     package1 \
     package2 \
     && rm -rf /var/lib/apt/lists/* \
     && apt-get clean
   ```

2. **Clean up in the same layer**:

   ```dockerfile
   RUN install-something \
     && rm -rf /var/lib/apt/lists/* \
     && apt-get clean \
     && rm -rf /tmp/* /var/tmp/*
   ```

3. **Use .dockerignore** to exclude unnecessary files from build context

4. **Monitor image sizes** after changes:

   ```bash
   # Check current sizes across local test images
   docker images --filter=reference='devcontainers/*' --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
   
   # Review Docker disk usage
   docker system df -v
   ```

## 📝 Notes

- All test images are tagged with `:test` to avoid conflicts
- The examples tag images with `:test` to keep cleanup straightforward
- Use `docker logs <container_id>` to debug container issues
- Check Dockerfile changes with `docker build --progress=plain` to inspect the full output
- Images are automatically updated weekly and when base images change
