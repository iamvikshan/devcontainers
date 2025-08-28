# DevContainer Setup Guide

This guide provides comprehensive setup instructions for all devcontainer images in this repository.

## 🚀 Quick Start

### 1. Choose Your Image

| Image               | Base     | Tools                  | Size    | Use Case                      |
| ------------------- | -------- | ---------------------- | ------- | ----------------------------- |
| **bun**             | oven/bun | Bun, Git               | ~133 MB | Bun-only projects             |
| **bun-node**        | oven/bun | Bun, Node.js, npm, Git | ~239 MB | Full-stack with Bun + Node.js |
| **ubuntu-bun**      | Ubuntu   | Bun, Git               | ~131 MB | Ubuntu-based Bun development  |
| **ubuntu-bun-node** | Ubuntu   | Bun, Node.js, npm, Git | ~201 MB | Ubuntu-based full-stack       |

### 2. Registry Options

Choose your preferred registry:

```bash
# GitHub Container Registry (Recommended)
ghcr.io/iamvikshan/devcontainers/[image]:latest

# GitLab Container Registry
registry.gitlab.com/vikshan/devcontainers/[image]:latest

# Docker Hub
docker.io/vikshan/[image]:latest
```

## 🛠️ Setup Methods

### Method 1: VS Code DevContainer (Recommended)

1. **Install VS Code Extensions:**
   - Dev Containers
   - Docker (optional, for GUI management)

2. **Create `.devcontainer/devcontainer.json`:**

   ```json
   {
     "name": "My Project",
     "image": "ghcr.io/iamvikshan/devcontainers/bun:latest",
     "customizations": {
       "vscode": {
         "extensions": ["oven.bun-vscode", "esbenp.prettier-vscode", "dbaeumer.vscode-eslint"]
       }
     },
     "postCreateCommand": "bun install",
     "remoteUser": "root"
   }
   ```

3. **Open in Container:**
   - `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"

### Method 2: Docker Run

```bash
# Interactive development
docker run -it --rm \
  -v $(pwd):/workspace \
  -w /workspace \
  ghcr.io/iamvikshan/devcontainers/bun:latest \
  bash

# Run specific commands
docker run --rm \
  -v $(pwd):/workspace \
  -w /workspace \
  ghcr.io/iamvikshan/devcontainers/bun:latest \
  bun install
```

### Method 3: Docker Compose

```yaml
version: '3.8'
services:
  dev:
    image: ghcr.io/iamvikshan/devcontainers/bun:latest
    volumes:
      - .:/workspace
    working_dir: /workspace
    command: sleep infinity
    stdin_open: true
    tty: true
```

## 🔧 Configuration

### Environment Variables

Common environment variables you might want to set:

```bash
# Bun configuration
BUN_INSTALL_CACHE_DIR=/tmp/bun-cache
BUN_INSTALL_BIN_DIR=/usr/local/bin

# Node.js configuration (for *-node images)
NODE_ENV=development
NPM_CONFIG_CACHE=/tmp/npm-cache

# Git configuration
GIT_AUTHOR_NAME="Your Name"
GIT_AUTHOR_EMAIL="your.email@example.com"
```

### VS Code Extensions

Recommended extensions for each image type:

#### All Images

- `esbenp.prettier-vscode` - Code formatting
- `eamodio.gitlens` - Git integration
- `GitHub.copilot` - AI assistance

#### Bun Images

- `oven.bun-vscode` - Bun support
- `dbaeumer.vscode-eslint` - JavaScript linting

#### Node Images (bun-node, ubuntu-bun-node)

- `ms-vscode.vscode-typescript-next` - TypeScript support
- `bradlc.vscode-tailwindcss` - Tailwind CSS support

### Port Forwarding

Common ports you might need to forward:

```json
{
  "forwardPorts": [3000, 5173, 8080],
  "portsAttributes": {
    "3000": {
      "label": "App Server"
    },
    "5173": {
      "label": "Vite Dev Server"
    }
  }
}
```

## 📦 Package Management

### Bun Commands

```bash
# Install dependencies
bun install

# Add packages
bun add package-name
bun add -d dev-package-name

# Run scripts
bun run dev
bun run build

# Execute files
bun run script.ts
```

### npm Commands (Node images only)

```bash
# Install dependencies
npm install

# Add packages
npm install package-name
npm install -D dev-package-name

# Run scripts
npm run dev
npm run build
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Permission Issues

```bash
# Fix ownership (run inside container)
chown -R $(whoami) /workspace
```

#### 2. Bun Not Found

```bash
# Check if Bun is in PATH
which bun
echo $PATH

# Manual symlink (if needed)
ln -s /root/.bun/bin/bun /usr/local/bin/bun
```

#### 3. Git Configuration

```bash
# Set up Git identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### 4. Node.js Issues (Node images)

```bash
# Check Node.js version
node --version
npm --version

# Clear npm cache
npm cache clean --force
```

### Performance Tips

1. **Use .dockerignore** to exclude unnecessary files
2. **Mount node_modules as volume** for better performance:
   ```json
   {
     "mounts": ["source=node_modules,target=/workspace/node_modules,type=volume"]
   }
   ```
3. **Use specific image tags** instead of `latest` for consistency

## 🔄 Updates

Images are automatically updated:

- **Weekly releases** every Sunday
- **Base image updates** trigger new builds
- **Security patches** applied automatically

Check the [versions file](../VERSIONS.md) for current versions and changelog.

## 📚 Additional Resources

- [Build Commands](BUILD_COMMANDS.md) - Building images locally
- [Image Variants](IMAGE_VARIANTS.md) - Detailed image descriptions
- [GitHub Repository](https://github.com/iamvikshan/devcontainers)
- [GitLab Repository](https://gitlab.com/vikshan/devcontainers)
