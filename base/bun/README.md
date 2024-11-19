# Bun DevContainer

A minimal development container configuration with Bun and Git.

## Contents

- Bun (latest)
- Git

## Images

1. `ghcr.io/vixshan/devcontainers/bun:latest` ~ 129.79 MiB

2. `registry.gitlab.com/vikshan/devcontainers/bun:latest` ~ 211.91 MiB

## Usage

### Direct Usage

Copy the `.devcontainer` directory to your project:

```bash
curl -fsSL https://raw.githubusercontent.com/vixshan/devcontainers/main/base/bun/.devcontainer/devcontainer.json -o .devcontainer/devcontainer.json
curl -fsSL https://raw.githubusercontent.com/vixshan/devcontainers/main/base/bun/.devcontainer/Dockerfile -o .devcontainer/Dockerfile
```

### Container Registry

#### 1. GitHub Container Registry

```json
{
  "image": "ghcr.io/vixshan/devcontainers/bun:latest"
}
```

#### 2. GitLab Container Registry

```json
{
  "image": "registry.gitlab.com/vikshan/devcontainers/bun:latest"
}
```

### Extending

```json
{
  "name": "Custom Environment",
  "extends": "ghcr.io/vixshan/devcontainers/bun",
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
