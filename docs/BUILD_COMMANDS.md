# Docker Build Commands Reference

## 🐳 Docker Setup

The devcontainer includes Docker-in-Docker for building and testing images locally.

### Verify Docker Setup

```bash
# Check that Docker is properly installed and working
npm run verify-docker
```

## 🚀 Quick Build Commands

### Build All Images (Recommended)

```bash
# Run the comprehensive build script
npm run build-all
# or
./scripts/build-all-images.sh
```

### Build Individual Images

```bash
# Build bun image
npm run build-bun

# Build bun-node image
npm run build-bun-node

# Build ubuntu-bun image
npm run build-ubuntu-bun

# Build ubuntu-bun-node image
npm run build-ubuntu-bun-node
```

## 🔧 Manual Docker Commands

### Bun Image

```bash
cd base/bun/.devcontainer
docker build -t devcontainers/bun:test .
```

### Bun-Node Image

```bash
cd base/bun-node/.devcontainer
docker build -t devcontainers/bun-node:test .
```

### Ubuntu-Bun Image

```bash
cd base/ubuntu/bun
docker build -t devcontainers/ubuntu-bun:test .
```

### Ubuntu-Bun-Node Image

```bash
cd base/ubuntu/bun-node
docker build -t devcontainers/ubuntu-bun-node:test .
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
```

### Interactive Testing

```bash
# Start interactive shell in any image
docker run -it --rm devcontainers/bun:test bash
docker run -it --rm devcontainers/bun-node:test bash
docker run -it --rm devcontainers/ubuntu-bun:test bash
docker run -it --rm devcontainers/ubuntu-bun-node:test bash
```

## 📊 Image Inspection

### View Image Details

```bash
# List all built images
docker images devcontainers/*

# View image history (layers)
docker history devcontainers/bun:test

# Inspect image configuration
docker inspect devcontainers/bun:test
```

### Size Analysis

```bash
# Compare image sizes
docker images devcontainers/* --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Detailed size analysis
docker system df -v
```

## 🧹 Cleanup

### Remove Test Images

```bash
# Remove all test images
docker rmi $(docker images "devcontainers/*:test" -q)

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
docker build --progress=plain -t devcontainers/bun:test base/bun/.devcontainer

# Build without cache
docker build --no-cache -t devcontainers/bun:test base/bun/.devcontainer
```

## 📝 Notes

- All test images are tagged with `:test` to avoid conflicts
- The build script automatically cleans up test images when done
- Use `docker logs <container_id>` to debug container issues
- Check Dockerfile syntax with `docker build --dry-run` (if available)
