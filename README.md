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

| Image               | Size    | Base   | Bun | Node.js | Best For                  |
| ------------------- | ------- | ------ | --- | ------- | ------------------------- |
| **bun**             | ~64 MB  | Alpine | ✅  | ❌      | Pure Bun projects         |
| **bun-node**        | ~96 MB  | Alpine | ✅  | ✅      | Full-stack development    |
| **ubuntu-bun**      | ~65 MB  | Ubuntu | ✅  | ❌      | Ubuntu-based Bun projects |
| **ubuntu-bun-node** | ~135 MB | Ubuntu | ✅  | ✅      | Ubuntu full-stack         |

### 🎯 Choose Your Image

```
Need Node.js?
├─ Yes → Need Ubuntu base?
│  ├─ Yes → ubuntu-bun-node
│  └─ No  → bun-node
└─ No  → Need Ubuntu base?
   ├─ Yes → ubuntu-bun
   └─ No  → bun
```

### 📦 Quick Start

```bash
docker pull ghcr.io/iamvikshan/devcontainers/bun:latest
docker pull ghcr.io/iamvikshan/devcontainers/bun-node:latest
docker pull ghcr.io/iamvikshan/devcontainers/ubuntu-bun:latest
docker pull ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node:latest
```

> **Alternative Sources:** All images are also available on
> [GitLab Container Registry](https://gitlab.com/vikshan/devcontainers/container_registry) and
> [Docker Hub](https://hub.docker.com/u/vikshan)

## Usage

### DevContainer Configuration

Add your chosen image to `.devcontainer/devcontainer.json`:

```json
{
  "name": "My Bun Project",
  "image": "ghcr.io/iamvikshan/devcontainers/bun:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oven.bun-vscode", "esbenp.prettier-vscode"]
    }
  },
  "postCreateCommand": "bun install"
}
```

### Docker Run

```bash
# Interactive development
docker run -it --rm \
  -v $(pwd):/workspace \
  -w /workspace \
  ghcr.io/iamvikshan/devcontainers/bun:latest \
  bash

# Run commands directly
docker run --rm \
  -v $(pwd):/workspace \
  -w /workspace \
  ghcr.io/iamvikshan/devcontainers/bun:latest \
  bun install
```

### Docker Compose

```yaml
version: '3.8'
services:
  dev:
    image: ghcr.io/iamvikshan/devcontainers/bun:latest
    volumes:
      - .:/workspace
    working_dir: /workspace
    command: sleep infinity
```

## 📚 Documentation

For comprehensive setup instructions and detailed information:

- **[Setup Guide](docs/SETUP.md)** - Complete setup instructions for all images
- **[Image Variants](docs/IMAGE_VARIANTS.md)** - Detailed comparison and use cases
- **[Build Commands](docs/BUILD_COMMANDS.md)** - Building and testing images locally
- **[Current Versions](CHANGELOG.md#released-versions)** - Latest versions, sizes, and changelogs

## Image Details

### What's Included

All images include:

- **Git** - Version control
- **SSH client** - Secure connections
- **curl** - HTTP requests
- **Basic development utilities**

#### Alpine-based Images (`bun`, `bun-node`)

- **Bun** 1.3.3 - Fast JavaScript runtime
- **Node.js** v22.11.0 _(bun-node only)_
- **npm** 10.9.0 _(bun-node only)_
- **ESLint** _(bun-node only)_

#### Ubuntu-based Images (`ubuntu-bun`, `ubuntu-bun-node`)

- **Bun** 1.3.3 - Installed via script
- **Node.js** v25.2.0 _(ubuntu-bun-node only)_
- **npm** 11.6.2 _(ubuntu-bun-node only)_
- **sudo** - Administrative access
- **Ubuntu package manager** (apt)

### Building Locally

Want to build or customize these images? See [`docs/BUILD_COMMANDS.md`](docs/BUILD_COMMANDS.md) for
complete instructions.

## Automated Updates

This repository includes automated systems to keep the devcontainers up to date:

### 🔄 Smart Release System

- **Independent container versioning** - each container has its own semantic version
- **Semantic commit analysis** - automatic version bumping based on conventional commits
- **Push-triggered releases** - releases created when changes are pushed to main
- **Weekly scheduled releases** - every Sunday at 2 AM UTC for base image updates

### 🔍 Base Image Monitoring

- **Weekly checks** for updates to base images (`oven/bun`, `ubuntu`)
- **Granular rebuilds** - only affected containers are rebuilt
- **Automatic issue creation** when builds fail
- **Tool version extraction** during build process

### 📦 Multi-Registry Support

- **GitHub Container Registry** (ghcr.io) - primary registry
- **GitLab Container Registry** (registry.gitlab.com) - mirror
- **Docker Hub** (docker.io) - public access
- **GitHub Actions** updated daily

### Image Management

Monitor and manage the images:

```bash
# Check for base image updates
bun run check-updates

# Analyze image sizes across all registries
bun run analyze-sizes

# Update documentation with current sizes
bun run sync-sizes
```

## Contributing

1. [Fork](https://gitlab.com/vikshan/devcontainers/-/forks/new) the repository
2. Create a feature branch
3. Submit a [pull request](https://gitlab.com/vikshan/devcontainers/-/merge_requests/new)

![Alt](https://repobeats.axiom.co/api/embed/8d282a5449c103e135703ea0472d24444b60d064.svg 'Repobeats analytics image')
