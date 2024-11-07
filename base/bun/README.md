# Bun DevContainer

A minimal development container configuration with Bun and Git.

## Contents

- Bun (latest)
- Git
- Essential VS Code extensions for JavaScript/TypeScript development

## Usage

### Direct Usage

Copy the `.devcontainer` directory to your project:

```bash
curl -fsSL https://raw.githubusercontent.com/vixshan/devcontainers/main/base/bun/.devcontainer/devcontainer.json -o .devcontainer/devcontainer.json
curl -fsSL https://raw.githubusercontent.com/vixshan/devcontainers/main/base/bun/.devcontainer/Dockerfile -o .devcontainer/Dockerfile
```

### Container Registry

```json
{
  "image": "ghcr.io/vixshan/devcontainers/bun:latest"
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
- Astro
- GitHub Copilot
- MDX
- Tailwind CSS
- Prettier
- GitLens
- Bun

## Customizing

1. Fork the repository
2. Modify the configuration files
3. Build your custom image:
   ```bash
   docker build -t my-custom-devcontainer .
   ```

## Version History

- **1.0.0** - Initial release
  - Bun (latest)
  - Git
  - Essential VS Code extensions