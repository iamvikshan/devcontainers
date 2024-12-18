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

- `ghcr.io/iamvikshan/devcontainers/bun:latest` ~ 126.86 MiB
- `ghcr.io/iamvikshan/devcontainers/bun-node:latest` ~ 227.40 MiB
- `ghcr.io/iamvikshan/devcontainers/ubuntu-bun:latest` ~ 120.79 MiB
- `ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node:latest` ~ 189.09 MiB

### 2. GitLab Container Registry

- `registry.gitlab.com/vikshan/devcontainers/bun:latest` ~ 204.13 MiB
- `registry.gitlab.com/vikshan/devcontainers/bun-node:latest` ~ 505.76 MiB
- `registry.gitlab.com/vikshan/devcontainers/ubuntu-bun:latest` ~ 305.64 MiB
- `registry.gitlab.com/vikshan/devcontainers/ubuntu-bun-node:latest` ~ 510.51 MiB

### 3. Docker Hub

- `docker.io/vikshan/bun:latest` ~ 126.86 MiB
- `docker.io/vikshan/bun-node:latest` ~ 227.40 MiB
- `docker.io/vikshan/ubuntu-bun:latest` ~ 120.79 MiB
- `docker.io/vikshan/ubuntu-bun-node:latest` ~ 189.09 MiB

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

## Development

### Building Images Locally

```bash
# From the base/bun directory
docker build -t devcontainers/bun .
```

### Publishing Updates

1. Make changes to the configuration
2. Create a [pull request](https://gitlab.com/vikshan/devcontainers/-/merge_requests/new)
3. Once merged, GitHub Actions will build and publish the updated image

## Contributing

1. [Fork](https://gitlab.com/vikshan/devcontainers/-/forks/new) the repository
2. Create a feature branch
3. Submit a [pull request](https://gitlab.com/vikshan/devcontainers/-/merge_requests/new)

![Alt](https://repobeats.axiom.co/api/embed/4c4567be5d5226fd9349cc999f54ee8500605621.svg 'Repobeats analytics image')
