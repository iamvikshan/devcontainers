<div align="center">

[![wakatime](https://wakatime.com/badge/github/iamvikshan/devcontainers.svg)](https://wakatime.com/badge/github/iamvikshan/devcontainers)
[![Sync to GitLab](https://github.com/iamvikshan/devcontainers/actions/workflows/sync.yml/badge.svg)](https://github.com/iamvikshan/devcontainers/actions/workflows/sync.yml)
[![Release DevContainers](https://github.com/iamvikshan/devcontainers/actions/workflows/releases.yml/badge.svg)](https://github.com/iamvikshan/devcontainers/actions/workflows/releases.yml)
[![CLA Assistant](https://github.com/iamvikshan/devcontainers/actions/workflows/cla.yml/badge.svg)](https://github.com/iamvikshan/devcontainers/actions/workflows/cla.yml)

</div>

# DevContainer Configurations

This repository contains reusable DevContainer configurations for different development
environments.

## Available Images

### 1. GitHub Container Registry

- `ghcr.io/iamvikshan/devcontainers/bun:latest` ~ 132.64 MiB
- `ghcr.io/iamvikshan/devcontainers/bun-node:latest` ~ 225.94 MiB
- `ghcr.io/iamvikshan/devcontainers/ubuntu-bun:latest` ~ 95.97 MiB
- `ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node:latest` ~ 167.88 MiB

### 2. GitLab Container Registry

- `registry.gitlab.com/vikshan/devcontainers/bun:latest` ~ 132.64 MiB
- `registry.gitlab.com/vikshan/devcontainers/bun-node:latest` ~ 225.94 MiB
- `registry.gitlab.com/vikshan/devcontainers/ubuntu-bun:latest` ~ 95.97 MiB
- `registry.gitlab.com/vikshan/devcontainers/ubuntu-bun-node:latest` ~ 167.88 MiB

### 3. Docker Hub

- `docker.io/vikshan/bun:latest` ~ 132.64 MiB
- `docker.io/vikshan/bun-node:latest` ~ 225.94 MiB
- `docker.io/vikshan/ubuntu-bun:latest` ~ 95.97 MiB
- `docker.io/vikshan/ubuntu-bun-node:latest` ~ 167.88 MiB

## Usage

You can use any image you like from the above list. They are all largely the same, but for this
example, we will use the `bun` image from `ghcr`.

### Option 1: Reference from GitHub

Add this to your `.devcontainer/devcontainer.json`:

```json
{
  "image": "ghcr.io/iamvikshan/devcontainers/bun:latest"
}
```

### Option 2: Copy Configuration

1. Copy the desired configuration from the [`base`](./base/) directory to your project.
2. Modify as needed for your specific requirements.

### Option 3: Extend Configuration

```json
{
  "name": "My Custom Environment",
  "build": {
    "dockerfile": "./Dockerfile"
  },
  "extends": "ghcr.io/iamvikshan/devcontainers/bun:latest"
}
```

## 📚 Documentation

For comprehensive setup instructions and detailed information:

- **[Setup Guide](docs/SETUP.md)** - Complete setup instructions for all images
- **[Image Variants](docs/IMAGE_VARIANTS.md)** - Detailed comparison and use cases
- **[Build Commands](docs/BUILD_COMMANDS.md)** - Building and testing images locally
- **[Optimization Guide](docs/OPTIMIZATION_GUIDE.md)** - Performance optimization tips
- **[Sync Architecture](docs/SYNC_ARCHITECTURE.md)** - GitHub ↔ GitLab synchronization
- **[Script Optimization](docs/SCRIPT_OPTIMIZATION.md)** - Optimized scripts and architecture
- **[Version Management](docs/VERSION_MANAGEMENT.md)** - Automated version and size tracking
- **[Current Versions](versions.json)** - Latest versions, sizes, and changelogs

## Development

### Building Images Locally

The `.devcontainer` of this codespace includes Docker-in-Docker for building and testing images,
else install docker locally:

```bash
# Build all images with comprehensive testing
npm run build-all

# Build individual images
npm run build-bun
npm run build-bun-node
npm run build-ubuntu-bun
npm run build-ubuntu-bun-node

# Manual Docker commands
docker build -f base/bun/.devcontainer/Dockerfile -t devcontainers/bun:test base/bun/.devcontainer
```

See [`docs/BUILD_COMMANDS.md`](docs/BUILD_COMMANDS.md) for complete build and testing instructions.

### Publishing Updates

1. Make changes to the configuration
2. Create a [pull request](https://gitlab.com/vikshan/devcontainers/-/merge_requests/new)
3. Once merged, GitHub Actions will build and publish the updated image

## Automated Updates

This repository includes automated systems to keep the devcontainers up to date:

### 🔄 Weekly Releases

- **Automatic releases** run every Sunday at 2 AM UTC
- Rebuilds all containers with the latest base images
- Updates documentation with current image sizes

### 🔍 Base Image Monitoring

- **Daily checks** for updates to base images (`oven/bun`, `ubuntu`)
- Automatically creates issues when updates are detected
- Triggers releases when base images are updated

### 📦 Dependency Management

- **Dependabot** monitors Docker base images weekly
- **npm dependencies** checked daily
- **GitHub Actions** updated daily

### Manual Checks

You can manually check for base image updates and analyze image sizes:

```bash
# Check for base image updates
bun run check-updates

# Analyze image sizes and detect bloat
bun run analyze-sizes

# Update documentation with current sizes
bun run sync-sizes
# or bun run s
```

## Contributing

1. [Fork](https://gitlab.com/vikshan/devcontainers/-/forks/new) the repository
2. Create a feature branch
3. Submit a [pull request](https://gitlab.com/vikshan/devcontainers/-/merge_requests/new)

![Alt](https://repobeats.axiom.co/api/embed/4c4567be5d5226fd9349cc999f54ee8500605621.svg 'Repobeats analytics image')
