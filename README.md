# DevContainer Configurations

This repository contains reusable DevContainer configurations for different development environments.

## Available Configurations

### Base Configurations

- **[bun-node](./base/bun-node)**: A minimal development environment with Bun, Node.js, and Git.
- **[bun](./base/bun)**: A minimal development environment with Bun and Git.

## Usage

### Option 1: Reference from GitHub

Add this to your `.devcontainer/devcontainer.json`:

```json
{
  "image": "ghcr.io/vixshan/devcontainers/bun-node:latest"
}
```

```json
{
  "image": "ghcr.io/vixshan/devcontainers/bun:latest"
}
```

### Option 2: Copy Configuration

1. Copy the desired configuration from the `base` directory to your project.
2. Modify as needed for your specific requirements.

### Option 3: Extend Configuration

```json
{
  "name": "My Custom Environment",
  "build": {
    "dockerfile": "./Dockerfile"
  },
  "extends": "ghcr.io/vixshan/devcontainers/bun-node"
}
```

```json
{
  "name": "My Custom Environment",
  "build": {
    "dockerfile": "./Dockerfile"
  },
  "extends": "ghcr.io/vixshan/devcontainers/bun"
}
```

## Development

### Building Images Locally

```bash
# From the base/bun-node directory
docker build -t devcontainers/bun-node .
```

```bash
# From the base/bun directory
docker build -t devcontainers/bun .
```

### Publishing Updates

1. Make changes to the configuration
2. Update version in the respective README.md
3. Create a pull request
4. Once merged, GitHub Actions will build and publish the updated image

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request