# DevContainer Versions

This file tracks base image updates and releases for our DevContainer configurations.

## Current Release

**Version:** 1.1.4  
**Release Date:** 2025-09-17  
**Last Updated:** 2025-09-17T05:18:10.309Z

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

### 🔄 Smart Release System

- **Schedule:** Push-triggered + Weekly on Sundays at 2 AM UTC
- **Workflow:** `.github/workflows/releases.yml`
- **Features:**
  - Independent container versioning
  - Semantic commit analysis
  - Granular container rebuilds
  - Tool version extraction
  - Automatic issue creation for failed builds

### 🔍 Base Image Monitoring

- **Schedule:** Weekly on Sundays at 6 AM UTC
- **Workflow:** `.github/workflows/check-base-images.yml`
- **Purpose:** Monitor base images (`oven/bun`, `ubuntu`) for updates and trigger patch releases

### 📦 Sync Operations

- **GitHub → GitLab:** Every 6 hours via `.github/workflows/sync.yml`
- **GitLab → GitHub:** On push/MR events via `.gitlab/gh-sync.yml`

## Latest Updates

### 2025-09-17 - Release 1.1.4

**Changes:**
- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-09-17 - Base Image Updates

**Updated at:** 2025-09-17T05:10:16.926Z

**Base images updated:**
- **ubuntu-bun**: `library/ubuntu:latest`
  - Base image last updated: 9/16/2025
  - Digest: `sha256:35367`
- **ubuntu-bun-node**: `library/ubuntu:latest`
  - Base image last updated: 9/16/2025
  - Digest: `sha256:35367`
- **gitpod-ubuntu-bun**: `library/ubuntu:latest`
  - Base image last updated: 9/16/2025
  - Digest: `sha256:35367`
- **gitpod-ubuntu-bun-node**: `library/ubuntu:latest`
  - Base image last updated: 9/16/2025
  - Digest: `sha256:35367`

**Changes:**
- Updated base images to latest versions
- Security patches and bug fixes from upstream
- Improved compatibility and performance

**Impact:** Patch release - DevContainers will be rebuilt with updated base images

---

### 2025-09-16 - Release 1.1.3

**Changes:**
- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-09-16 - Release 1.1.2

**Changes:**
- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-09-16 - Base Image Updates

**Updated at:** 2025-09-16T05:10:11.321Z

**Base images updated:**
- **ubuntu-bun**: `library/ubuntu:latest`
  - Base image last updated: 9/15/2025
  - Digest: `sha256:590e5`
- **ubuntu-bun-node**: `library/ubuntu:latest`
  - Base image last updated: 9/15/2025
  - Digest: `sha256:590e5`
- **gitpod-ubuntu-bun**: `library/ubuntu:latest`
  - Base image last updated: 9/15/2025
  - Digest: `sha256:590e5`
- **gitpod-ubuntu-bun-node**: `library/ubuntu:latest`
  - Base image last updated: 9/15/2025
  - Digest: `sha256:590e5`

**Changes:**
- Updated base images to latest versions
- Security patches and bug fixes from upstream
- Improved compatibility and performance

**Impact:** Patch release - DevContainers will be rebuilt with updated base images

---

### 2025-09-15 - Release 1.1.1

**Changes:**
- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-09-15 - Base Image Updates

**Updated at:** 2025-09-15T05:10:25.995Z

**Base images updated:**
- **bun**: `oven/bun:latest`
  - Base image last updated: 9/14/2025
  - Digest: `sha256:66ba6`
- **bun-node**: `oven/bun:latest`
  - Base image last updated: 9/14/2025
  - Digest: `sha256:66ba6`
- **gitpod-bun**: `oven/bun:latest`
  - Base image last updated: 9/14/2025
  - Digest: `sha256:66ba6`
- **gitpod-bun-node**: `oven/bun:latest`
  - Base image last updated: 9/14/2025
  - Digest: `sha256:66ba6`

**Changes:**
- Updated base images to latest versions
- Security patches and bug fixes from upstream
- Improved compatibility and performance

**Impact:** Patch release - DevContainers will be rebuilt with updated base images

---

### 2025-09-06 - Release 1.1.0

**Changes:**
- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-28 - Release 2.0.0

**Changes:**
- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Major release

---

### 2025-08-27 - Release 1.1.4

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-08-27 - Base Image Updates

**Updated at:** 2025-08-27T06:07:53.121Z

**Base images updated:**

- **bun**: `oven/bun:latest`
  - Base image last updated: 8/25/2025
  - Digest: `sha256:5a201`
- **bun-node**: `oven/bun:latest`
  - Base image last updated: 8/25/2025
  - Digest: `sha256:5a201`

**Changes:**

- Updated base images to latest versions
- Security patches and bug fixes from upstream
- Improved compatibility and performance

**Impact:** Patch release - DevContainers will be rebuilt with updated base images

---

### 2025-08-26 - Release 1.1.3

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-08-26 - Base Image Updates

**Updated at:** 2025-08-26T06:08:35.181Z

**Base images updated:**

- **bun**: `oven/bun:latest`
  - Base image last updated: 8/25/2025
  - Digest: `sha256:5a201`
- **bun-node**: `oven/bun:latest`
  - Base image last updated: 8/25/2025
  - Digest: `sha256:5a201`

**Changes:**

- Updated base images to latest versions
- Security patches and bug fixes from upstream
- Improved compatibility and performance

**Impact:** Patch release - DevContainers will be rebuilt with updated base images

---

### 2025-08-21 - Release 1.1.2

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-08-21 - Release 1.1.2

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-08-18 - Base Image Updates

**Updated at:** 2025-08-18T06:09:22.918Z

**Base images updated:**

- **ubuntu-bun**: `library/ubuntu:latest`
  - Base image last updated: 8/12/2025
  - Digest: `sha256:7c06e`
- **ubuntu-bun-node**: `library/ubuntu:latest`
  - Base image last updated: 8/12/2025
  - Digest: `sha256:7c06e`

**Changes:**

- Updated base images to latest versions
- Security patches and bug fixes from upstream
- Improved compatibility and performance

**Impact:** Patch release - DevContainers will be rebuilt with updated base images

---

### 2025-08-17 - Base Image Updates

**Updated at:** 2025-08-17T06:07:38.540Z

**Base images updated:**

- **bun**: `oven/bun:latest`
  - Base image last updated: 8/10/2025
  - Digest: `sha256:78f46`
- **bun-node**: `oven/bun:latest`
  - Base image last updated: 8/10/2025
  - Digest: `sha256:78f46`
- **ubuntu-bun**: `library/ubuntu:latest`
  - Base image last updated: 8/12/2025
  - Digest: `sha256:7c06e`
- **ubuntu-bun-node**: `library/ubuntu:latest`
  - Base image last updated: 8/12/2025
  - Digest: `sha256:7c06e`

**Changes:**

- Updated base images to latest versions
- Security patches and bug fixes from upstream
- Improved compatibility and performance

**Impact:** Patch release - DevContainers will be rebuilt with updated base images

---

### 2025-08-16 - Base Image Updates

**Updated at:** 2025-08-16T06:07:27.562Z

**Base images updated:**

- **bun**: `oven/bun:latest`
  - Base image last updated: 8/10/2025
  - Digest: `sha256:78f46`
- **bun-node**: `oven/bun:latest`
  - Base image last updated: 8/10/2025
  - Digest: `sha256:78f46`
- **ubuntu-bun**: `library/ubuntu:latest`
  - Base image last updated: 8/12/2025
  - Digest: `sha256:7c06e`
- **ubuntu-bun-node**: `library/ubuntu:latest`
  - Base image last updated: 8/12/2025
  - Digest: `sha256:7c06e`

**Changes:**

- Updated base images to latest versions
- Security patches and bug fixes from upstream
- Improved compatibility and performance

**Impact:** Patch release - DevContainers will be rebuilt with updated base images

---

### 2025-08-15 - Base Image Updates

**Updated at:** 2025-08-15T06:08:26.865Z

**Base images updated:**

- **bun**: `oven/bun:latest`
  - Base image last updated: 8/10/2025
  - Digest: `sha256:78f46`
- **bun-node**: `oven/bun:latest`
  - Base image last updated: 8/10/2025
  - Digest: `sha256:78f46`
- **ubuntu-bun**: `library/ubuntu:latest`
  - Base image last updated: 8/12/2025
  - Digest: `sha256:7c06e`
- **ubuntu-bun-node**: `library/ubuntu:latest`
  - Base image last updated: 8/12/2025
  - Digest: `sha256:7c06e`

**Changes:**

- Updated base images to latest versions
- Security patches and bug fixes from upstream
- Improved compatibility and performance

**Impact:** Patch release - DevContainers will be rebuilt with updated base images

---

### 2025-08-14 - Base Image Updates

**Updated at:** 2025-08-14T06:08:39.479Z

**Base images updated:**

- **bun**: `oven/bun:latest`
  - Base image last updated: 8/10/2025
  - Digest: `sha256:78f46`
- **bun-node**: `oven/bun:latest`
  - Base image last updated: 8/10/2025
  - Digest: `sha256:78f46`
- **ubuntu-bun**: `library/ubuntu:latest`
  - Base image last updated: 8/12/2025
  - Digest: `sha256:7c06e`
- **ubuntu-bun-node**: `library/ubuntu:latest`
  - Base image last updated: 8/12/2025
  - Digest: `sha256:7c06e`

**Changes:**

- Updated base images to latest versions
- Security patches and bug fixes from upstream
- Improved compatibility and performance

**Impact:** Patch release - DevContainers will be rebuilt with updated base images

---

### 2025-08-13 - Base Image Updates

**Updated at:** 2025-08-13T06:08:51.121Z

**Base images updated:**

- **bun**: `oven/bun:latest`
  - Base image last updated: 8/10/2025
  - Digest: `sha256:78f46`
- **bun-node**: `oven/bun:latest`
  - Base image last updated: 8/10/2025
  - Digest: `sha256:78f46`
- **ubuntu-bun**: `library/ubuntu:latest`
  - Base image last updated: 8/12/2025
  - Digest: `sha256:7c06e`
- **ubuntu-bun-node**: `library/ubuntu:latest`
  - Base image last updated: 8/12/2025
  - Digest: `sha256:7c06e`

**Changes:**

- Updated base images to latest versions
- Security patches and bug fixes from upstream
- Improved compatibility and performance

**Impact:** Patch release - DevContainers will be rebuilt with updated base images

---

### 2025-08-13 - Release 1.1.2

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-08-12 - Release 1.1.2

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-08-12 - Release 1.1.2

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-08-12 - Release 1.1.1

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-08-11 - Release 1.1.1

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-08-11 - Release 1.1.1

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Patch release

---

### 2025-08-11 - Base Image Updates

**Updated at:** 2025-08-11T06:09:34.240Z

**Base images updated:**

- **bun**: `oven/bun:latest`
  - Base image last updated: 8/10/2025
  - Digest: `sha256:78f46`
- **bun-node**: `oven/bun:latest`
  - Base image last updated: 8/10/2025
  - Digest: `sha256:78f46`

**Changes:**

- Updated base images to latest versions
- Security patches and bug fixes from upstream
- Improved compatibility and performance

**Impact:** Patch release - DevContainers will be rebuilt with updated base images

---

### 2025-08-11 - Release 1.1.0

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-10 - Release 1.1.0

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-10 - Release 1.1.0

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-10 - Release 1.1.0

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-10 - Release 1.1.0

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-10 - Release 1.1.0

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-09 - Release 1.1.0

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-09 - Release 1.1.0

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-09 - Release 1.1.0

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-09 - Release 1.1.0

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-08 - Release 1.1.0

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-08 - Release 1.1.0

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-08 - Release 1.1.0

**Changes:**

- Automated release with latest base images
- Security patches and updates
- Documentation improvements

**Impact:** Minor release

---

### 2025-08-08 - Release 1.1.0

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

**Estimated Date:** 2025-09-21T02:00:00.000Z

- Update to latest base images
- Security patches and updates
- Documentation improvements

---

_This file is automatically updated by our CI/CD workflows. For manual updates, please edit via pull
request._
