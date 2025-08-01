# Bun + Node.js DevContainer

A minimal development container configuration with Bun, Node.js, and Git.

## Images

1. `ghcr.io/iamvikshan/devcontainers/bun-node:latest` ~ 225.94 MiB
2. `registry.gitlab.com/vikshan/devcontainers/bun-node:latest` ~ 225.94 MiB
3. `docker.io/vikshan/bun-node:latest` ~ 225.94 MiB

## Contents

- Bun (latest)
- Node.js (latest)
- Git
- Eslint

## Usage

### Direct Usage

Copy the `.devcontainer` directory to your project:

```bash
curl -fsSL https://raw.githubusercontent.com/iamvikshan/devcontainers/main/base/bun-node/.devcontainer/devcontainer.json -o .devcontainer/devcontainer.json
curl -fsSL https://raw.githubusercontent.com/iamvikshan/devcontainers/main/base/bun-node/.devcontainer/Dockerfile -o .devcontainer/Dockerfile
```

### Container Registry

#### 1. GitHub Container Registry

```json
{
  "image": "ghcr.io/iamvikshan/devcontainers/bun-node:latest"
}
```

#### 2. GitLab Container Registry

```json
{
  "image": "registry.gitlab.com/vikshan/devcontainers/bun-node:latest"
}
```

### Extending

```json
{
  "name": "Custom Environment",
  "extends": "ghcr.io/iamvikshan/devcontainers/bun-node",
  "features": {
    // Add additional features
  }
}
```

## Installed Extensions

- ESLint
- GitHub Copilot
- Prettier
- GitLens
- Bun
