# Bun DevContainer

A minimal development container configuration with Bun and Git.

## Contents

- Bun (latest)
- Git

## Images

1. `ghcr.io/iamvikshan/devcontainers/bun:latest` ~ 132.64 MiB
2. `registry.gitlab.com/vikshan/devcontainers/bun:latest` ~ 132.64 MiB
3. `docker.io/vikshan/bun:latest` ~ 132.64 MiB

## Usage

### Direct Usage

Copy the `.devcontainer` directory to your project:

```bash
curl -fsSL https://raw.githubusercontent.com/iamvikshan/devcontainers/main/base/bun/.devcontainer/devcontainer.json -o .devcontainer/devcontainer.json
curl -fsSL https://raw.githubusercontent.com/iamvikshan/devcontainers/main/base/bun/.devcontainer/Dockerfile -o .devcontainer/Dockerfile
```

### Container Registry

#### 1. GitHub Container Registry

```json
{
  "image": "ghcr.io/iamvikshan/devcontainers/bun:latest"
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
  "extends": "ghcr.io/iamvikshan/devcontainers/bun",
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
