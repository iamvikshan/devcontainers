# DevContainer Versions

This file tracks base image updates and releases for our DevContainer configurations.

## Current Release

**Version:** 1.1.0  
**Release Date:** 2025-08-07  
**Last Updated:** 2025-08-07T06:15:27.203Z

## Container Images

### 🚀 bun

- **Base Image:** `oven/bun:latest`
- **Base Image Digest:** `sha256:31f25ad4c661322a3dc9d9d98fbf34989502b1ea588a2ca629da98c8e5a2d116`
- **Tools:** Bun 1.2.19, Git 2.39.5
- **Size:** ~0.00 MB
- **Registries:**
  - GitHub: `ghcr.io/iamvikshan/devcontainers/bun:latest`
  - GitLab: `registry.gitlab.com/vikshan/devcontainers/bun:latest`
  - Docker Hub: `docker.io/vikshan/bun:latest`

### 🚀 bun-node

- **Base Image:** `oven/bun:latest`
- **Base Image Digest:** `sha256:31f25ad4c661322a3dc9d9d98fbf34989502b1ea588a2ca629da98c8e5a2d116`
- **Tools:** Bun 1.2.19, Node.js v24.5.0, npm 11.5.1, ESLint (global), Git 2.39.5
- **Size:** ~0.00 MB
- **Registries:**
  - GitHub: `ghcr.io/iamvikshan/devcontainers/bun-node:latest`
  - GitLab: `registry.gitlab.com/vikshan/devcontainers/bun-node:latest`
  - Docker Hub: `docker.io/vikshan/bun-node:latest`

### 🐧 ubuntu-bun

- **Base Image:** `ubuntu:latest`
- **Base Image Digest:** `sha256:a08e551cb33850e4740772b38217fc1796a66da2506d312abe51acda354ff061`
- **Tools:** Bun 1.2.19, Git 2.43.0
- **Size:** ~0.00 MB
- **Registries:**
  - GitHub: `ghcr.io/iamvikshan/devcontainers/ubuntu-bun:latest`
  - GitLab: `registry.gitlab.com/vikshan/devcontainers/ubuntu-bun:latest`
  - Docker Hub: `docker.io/vikshan/ubuntu-bun:latest`

### 🐧 ubuntu-bun-node

- **Base Image:** `ubuntu:latest`
- **Base Image Digest:** `sha256:a08e551cb33850e4740772b38217fc1796a66da2506d312abe51acda354ff061`
- **Tools:** Bun 1.2.19, Node.js v24.5.0, npm 11.5.1, ESLint (non-root), Git 2.43.0
- **Size:** ~0.00 MB
- **Registries:**
  - GitHub: `ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node:latest`
  - GitLab: `registry.gitlab.com/vikshan/devcontainers/ubuntu-bun-node:latest`
  - Docker Hub: `docker.io/vikshan/ubuntu-bun-node:latest`

## Automation

### 🔄 Weekly Releases

- **Schedule:** Every Sunday at 2 AM UTC
- **Workflow:** `.github/workflows/releases.yml`
- **Purpose:** Automated releases with latest base images and documentation updates

### 🔍 Base Image Monitoring

- **Schedule:** Daily at 6 AM UTC
- **Workflow:** `.github/workflows/check-base-images.yml`
- **Purpose:** Monitor base images (`oven/bun`, `ubuntu`) for updates and trigger patch releases

### 📦 Sync Operations

- **GitHub → GitLab:** Every 6 hours via `.github/workflows/sync.yml`
- **GitLab → GitHub:** On push/MR events via `.gitlab/gh-sync.yml`

## Latest Updates

### 2025-08-07 - Release 1.1.0

**Changes:**
- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-07 - Release 1.1.0

**Changes:**
- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-06 - Release 1.1.0

**Changes:**
- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-03 - Release 1.1.0

**Changes:**

- Optimized Dockerfile layers for smaller image sizes
- Added comprehensive cleanup in single RUN commands
- Improved build caching and layer structure
- Fixed Bun symlinks for root user compatibility
- Combined package installations to reduce layers
- Added npm cache cleanup to reduce image sizes

**Impact:** Minor release with significant optimizations and fixes

---

## Release History

### 1.1.0 (2025-08-03)

- Major Dockerfile optimizations
- Improved layer caching
- Fixed root user compatibility issues
- Reduced image sizes across all variants

### 1.0.x (Previous releases)

- Initial DevContainer configurations
- Basic Bun and Node.js setups
- Multi-registry publishing
- Automated CI/CD workflows

## Next Release

**Estimated Date:** 2025-08-10T02:00:00.000Z
**Planned Changes:**

- Update to latest base images
- Security patches and updates
- Documentation improvements

---

_This file is automatically updated by our CI/CD workflows. For manual updates, please edit via pull
request._
