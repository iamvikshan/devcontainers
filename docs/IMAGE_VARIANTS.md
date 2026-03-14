# DevContainer Image Variants

This document provides detailed information about all 5 available devcontainer images.

## 📊 Images Comparison

| Feature         | bun               | bun-node               | ubuntu-bun       | ubuntu-bun-node   | ubuntu-tools          |
| --------------- | ----------------- | ---------------------- | ---------------- | ----------------- | --------------------- |
| **Base Image**  | oven/bun (Alpine) | oven/bun (Alpine)      | ubuntu:latest    | ubuntu:latest     | ubuntu:24.04          |
| **Size**        | ~133 MB           | ~227 MB                | ~94 MB           | ~166 MB           | ~80 MB                |
| **Bun Version** | 1.3.3             | 1.3.3                  | 1.3.3            | 1.3.3             | ❌                    |
| **Node.js**     | ❌                | ✅ v22.11.0            | ❌               | ✅ v24.5.0        | ❌                    |
| **npm**         | ❌                | ✅ 10.9.0              | ❌               | ✅ 11.5.1         | ❌                    |
| **Package Mgr** | Alpine (apk)      | Alpine (apk)           | Ubuntu (apt)     | Ubuntu (apt)      | Ubuntu (apt)          |
| **Best For**    | Pure Bun projects | Full-stack development | Ubuntu workflows | Ubuntu full-stack | Tools-only automation |

## 🎯 Image Selection Guide

### By Use Case

- **Pure Bun Development** → `bun` or `ubuntu-bun`
- **Full-Stack Projects** → `bun-node` or `ubuntu-bun-node`
- **Need Ubuntu Packages** → `ubuntu-bun` or `ubuntu-bun-node`
- **Need Ubuntu Tools Without JS Runtimes** → `ubuntu-tools`
- **Smallest Size** → `ubuntu-bun` (94 MB)
- **Most Features** → `bun-node` (227 MB)

## 🐳 Image Details

### 1. bun (~133 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainers/bun:latest`

**Description:** Lightweight Bun development environment based on the official Alpine-based Bun
image. Perfect for pure Bun projects that don't require Node.js compatibility.

**Key Features:**

- ⚡ **Fastest startup** - Minimal Alpine base
- 🔧 **Bun 1.3.3** - Latest Bun runtime
- 📦 **Alpine packages** - Access to apk package manager
- 🚀 **Performance optimized** - Smallest footprint for Bun

**Included Tools:**

- Bun 1.3.3
- Git, SSH client, curl
- btop (system resource monitor)
- Alpine package manager (apk)
- Basic development utilities

**Perfect For:**

- Pure Bun applications
- Bun package development
- Lightweight scripting
- Performance-critical applications
- CI/CD pipelines

**Example Configuration:**

```json
{
  "name": "Pure Bun Project",
  "image": "ghcr.io/iamvikshan/devcontainers/bun:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oven.bun-vscode", "esbenp.prettier-vscode"]
    }
  },
  "postCreateCommand": "bun install"
}
```

### 2. bun-node (~227 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainers/bun-node:latest`

**Description:** Full-featured development environment with both Bun and Node.js. Ideal for projects
that need Bun's performance with Node.js ecosystem compatibility.

**Key Features:**

- 🚀 **Best of both worlds** - Bun speed + Node.js compatibility
- 📦 **Full npm ecosystem** - Access to all npm packages
- 🔧 **Latest runtimes** - Bun 1.3.3 + Node.js v22.11.0
- 🛠️ **Development tools** - ESLint pre-installed

**Included Tools:**

- Bun 1.3.3
- Node.js v22.11.0
- npm 10.9.0
- ESLint (global)
- Git, SSH client, curl
- btop (system resource monitor)
- Alpine package manager (apk)

**Perfect For:**

- Full-stack applications
- Migration from Node.js to Bun
- Projects requiring Node.js compatibility
- Complex web applications
- Teams using both Bun and Node.js

**Example Configuration:**

```json
{
  "name": "Full-Stack Project",
  "image": "ghcr.io/iamvikshan/devcontainers/bun-node:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oven.bun-vscode", "dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
    }
  },
  "postCreateCommand": "bun install"
}
```

### 3. ubuntu-bun (~94 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainers/ubuntu-bun:latest`

**Description:** Ubuntu-based Bun environment for developers who prefer Ubuntu's package ecosystem
and tooling. The smallest image in our collection!

**Key Features:**

- 🏆 **Smallest size** - Only 94 MB!
- 🐧 **Ubuntu familiarity** - Standard Ubuntu environment
- 📦 **Ubuntu packages** - Full access to apt repositories
- 🔐 **sudo access** - Administrative privileges

**Included Tools:**

- Bun 1.3.3 (installed via script)
- Git, SSH client, curl, unzip
- btop (system resource monitor)
- sudo (administrative access)
- Ubuntu package manager (apt)
- Basic development utilities

**Perfect For:**

- Ubuntu-familiar developers
- Projects requiring Ubuntu-specific packages
- System administration scripts
- Custom toolchain requirements
- Size-conscious deployments

**Example Configuration:**

```json
{
  "name": "Ubuntu Bun Project",
  "image": "ghcr.io/iamvikshan/devcontainers/ubuntu-bun:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oven.bun-vscode", "esbenp.prettier-vscode"]
    }
  },
  "postCreateCommand": "bun install"
}
```

### 4. ubuntu-bun-node (~166 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node:latest`

**Description:** Complete Ubuntu-based development environment with Bun, Node.js, and npm. Best of
both worlds with Ubuntu's flexibility and modern JavaScript runtimes.

**Key Features:**

- 🌟 **Complete solution** - Ubuntu + Bun + Node.js
- 🔧 **Full toolchain** - Everything for full-stack development
- 📦 **Ubuntu ecosystem** - Access to vast apt repositories
- ⚖️ **Balanced size** - Feature-rich at only 166 MB

**Included Tools:**

- Bun 1.3.3 (installed via script)
- Node.js v24.5.0
- npm 11.5.1
- ESLint (global)
- Git, SSH client, curl, unzip
- btop (system resource monitor)
- sudo (administrative access)
- Ubuntu package manager (apt)

**Perfect For:**

- Full-stack development on Ubuntu
- Complex projects with system dependencies
- CI/CD pipelines requiring Ubuntu
- Development teams using Ubuntu
- Enterprise environments

**Example Configuration:**

```json
{
  "name": "Ubuntu Full-Stack Project",
  "image": "ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oven.bun-vscode", "dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
    }
  },
  "postCreateCommand": "bun install"
}
```

### 5. ubuntu-tools (~80 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainers/ubuntu-tools:latest`

**Description:** Ubuntu-based tools-only environment for automation, scripting, and utility-heavy
workflows that do not require Bun or Node.js runtimes.

**Key Features:**

- 🧰 **Tools-focused image** - Includes Python, jq, Git, curl, and btop
- 🐧 **Ubuntu base** - Standard Ubuntu package ecosystem with apt
- 🔐 **sudo access** - Administrative privileges for setup tasks
- 🚫 **No JS runtime bundle** - No Bun, Node.js, npm, or ESLint preinstalled

**Included Tools:**

- Python 3
- jq
- Git, SSH client, curl, unzip
- btop (system resource monitor)
- sudo (administrative access)
- Ubuntu package manager (apt)

**Perfect For:**

- Automation scripts and CI utilities
- Python-first tooling workflows
- JSON/data transformation tasks
- Projects requiring a minimal tools baseline

**Example Configuration:**

```json
{
  "name": "Tools Workspace",
  "image": "ghcr.io/iamvikshan/devcontainers/ubuntu-tools:latest",
  "customizations": {
    "vscode": {
      "extensions": ["ms-python.python", "esbenp.prettier-vscode"]
    }
  }
}
```

## 🎯 Choosing the Right Image

### Decision Tree

```
Do you need Bun runtime?
├─ No → ubuntu-tools
└─ Yes → Do you need Node.js compatibility?
  ├─ No → Do you prefer Ubuntu?
  │  ├─ Yes → ubuntu-bun
  │  └─ No → bun
  └─ Yes → Do you prefer Ubuntu?
    ├─ Yes → ubuntu-bun-node
    └─ No → bun-node
```

### Performance Considerations

**Smallest to Largest:**

1. **ubuntu-tools** (~80 MB) - Tools-focused baseline
2. **ubuntu-bun** (~94 MB) - Most efficient Ubuntu Bun option
3. **bun** (~133 MB) - Most efficient Bun runtime option
4. **ubuntu-bun-node** (~166 MB) - Balanced Ubuntu full-stack option
5. **bun-node** (~227 MB) - Full-featured but larger

### Compatibility Matrix

| Feature             | bun        | bun-node | ubuntu-bun | ubuntu-bun-node | ubuntu-tools |
| ------------------- | ---------- | -------- | ---------- | --------------- | ------------ |
| **Bun APIs**        | ✅ Full    | ✅ Full  | ✅ Full    | ✅ Full         | ❌           |
| **Node.js APIs**    | ⚠️ Limited | ✅ Full  | ⚠️ Limited | ✅ Full         | ❌           |
| **npm packages**    | ⚠️ Some    | ✅ All   | ⚠️ Some    | ✅ All          | ❌           |
| **Ubuntu packages** | ❌         | ❌       | ✅         | ✅              | ✅           |
| **Alpine packages** | ✅         | ✅       | ❌         | ❌              | ❌           |
| **Debian packages** | ❌         | ❌       | ❌         | ❌              | ❌           |

## 📦 Alternative Sources

While we recommend using GitHub Container Registry as the primary source, all images are available
from multiple registries:

### GitHub Container Registry (Primary)

```bash
ghcr.io/iamvikshan/devcontainers/[image]:latest
```

### GitLab Container Registry

```bash
registry.gitlab.com/vikshan/devcontainers/[image]:latest
```

### Docker Hub

```bash
docker.io/vikshan/[image]:latest
```

> **Note:** All registries contain identical images. Choose based on your preference or
> organizational requirements.

## 🔄 Update Schedule

All images are automatically updated:

- **Weekly builds** every Sunday at 2 AM UTC
- **Base image updates** trigger immediate rebuilds
- **Security patches** applied within 24 hours

## 📈 Version History

See [CHANGELOG.md](../CHANGELOG.md#released-versions) for detailed version history and changelogs.

## 🤝 Contributing

To contribute improvements to any image:

1. Fork the repository
2. Make changes to the appropriate Dockerfile
3. Test locally using [build commands](BUILD_COMMANDS.md)
4. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/iamvikshan/devcontainers/issues)
- **Discussions**: [GitHub Discussions](https://github.com/iamvikshan/devcontainers/discussions)
- **Setup Guide**: [SETUP.md](SETUP.md)
- **Build Guide**: [BUILD_COMMANDS.md](BUILD_COMMANDS.md)
