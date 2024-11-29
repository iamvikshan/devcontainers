# Ubuntu DevContainer

A minimal development container configuration for bun and bun w/ node based on an Ubuntu image.
There is no much difference between this image and the bun image image used in the base directory,
well, maybe the size, and wider compatibility with other tools as this is a standard Ubuntu image.

## Contents

- Ubuntu (latest LTS)
- Git
- Bun (latest)
- Node.js, eslint (latest) (only in the ubuntu-bun-node image)

## Images

### 1. GitHub Container Registry

<<<<<<< HEAD

1. `ghcr.io/iamvikshan/devcontainers/ubuntu-bun:latest` ~ 120.68 MiB
2. # `ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node:latest` ~ 188.64 MiB
3. `ghcr.io/iamvikshan/devcontainers/ubuntu-bun:latest` ~ 120.68 MiB
4. `ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node:latest` ~ 188.64 MiB
   > > > > > > > origin/main

### 2. GitLab Container Registry

1. `registry.gitlab.com/vikshan/devcontainers/ubuntu-bun:latest` ~ 120.68 MiB
2. `registry.gitlab.com/vikshan/devcontainers/ubuntu-bun-node:latest` ~ 188.64 MiB

## Installed Extensions

- ESLint
- GitHub Copilot
- Prettier
- GitLens
- Bun

## Usage

### 1. Direct Usage

we will use the ubuntu-bun image in this example, but you can replace it with ubuntu-bun-node if you
need Node.js.

Copy the `.devcontainer` directory to your project:

```bash
    curl -fsSL https://raw.githubusercontent.com/iamvikshan/devcontainers/main/base/ubuntu/bun/.devcontainer/devcontainer.json -o .devcontainer/devcontainer.json
    curl -fsSL https://raw.githubusercontent.com/iamvikshan/devcontainers/main/base/ubuntu/bun/.devcontainer/Dockerfile -o .devcontainer/Dockerfile
```

### 2. Container Registry

We will use the GitHub Container Registry in this example, but you can replace it with the GitLab
Container Registry if you prefer.

```json
{
  "image": "ghcr.io/iamvikshan/devcontainers/ubuntu-bun:latest"
}
```

### 3. Extending

```json
{
  "name": "Custom Environment",
  "extends": "ghcr.io/iamvikshan/devcontainers/ubuntu-bun",
  "features": {
    // Add additional features
  }
}
```
