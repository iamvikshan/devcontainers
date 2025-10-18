# DevContainer Image Variants

This document provides detailed information about all 8 available devcontainer images, including
both standard and Gitpod-optimized variants.

## 📊 Standard Images Comparison

| Feature         | bun               | bun-node               | ubuntu-bun       | ubuntu-bun-node   |
| --------------- | ----------------- | ---------------------- | ---------------- | ----------------- |
| **Base Image**  | oven/bun (Alpine) | oven/bun (Alpine)      | ubuntu:latest    | ubuntu:latest     |
| **Size**        | ~133 MB           | ~227 MB                | ~94 MB           | ~166 MB           |
| **Bun Version** | 1.2.19            | 1.2.19                 | 1.2.19           | 1.2.19            |
| **Node.js**     | ❌                | ✅ v24.5.0             | ❌               | ✅ v24.5.0        |
| **npm**         | ❌                | ✅ 11.5.1              | ❌               | ✅ 11.5.1         |
| **Package Mgr** | Alpine (apk)      | Alpine (apk)           | Ubuntu (apt)     | Ubuntu (apt)      |
| **Best For**    | Pure Bun projects | Full-stack development | Ubuntu workflows | Ubuntu full-stack |

## 📊 Gitpod-Optimized Images Comparison

| Feature         | gitpod-bun            | gitpod-bun-node       | gitpod-ubuntu-bun | gitpod-ubuntu-bun-node |
| --------------- | --------------------- | --------------------- | ----------------- | ---------------------- |
| **Base Image**  | gitpod/workspace-base | gitpod/workspace-base | ubuntu:jammy      | ubuntu:jammy           |
| **Size**        | ~220 MB               | ~340 MB               | ~180 MB           | ~285 MB                |
| **Bun Version** | 1.2.19                | 1.2.19                | 1.2.19            | 1.2.19                 |
| **Node.js**     | ❌                    | ✅ v22 (via NVM)      | ❌                | ✅ v22 (via NVM)       |
| **Gitpod User** | ✅ UID 33333          | ✅ UID 33333          | ✅ UID 33333      | ✅ UID 33333           |
| **Shell**       | Bash (forced)         | Bash (forced)         | Bash (forced)     | Bash (forced)          |
| **.bashrc.d/**  | ✅                    | ✅                    | ✅                | ✅                     |
| **Best For**    | Gitpod Bun projects   | Gitpod full-stack     | Gitpod Ubuntu Bun | Gitpod Ubuntu full     |

## 🎯 Image Selection Guide

### By Environment

- **Local DevContainers (VS Code, etc.)** → Use standard images (`bun`, `bun-node`, `ubuntu-*`)
- **Gitpod Cloud IDE** → Use gitpod-optimized images (`gitpod-*`)

### By Use Case

- **Pure Bun Development** → `bun` or `ubuntu-bun`
- **Full-Stack Projects** → `bun-node` or `ubuntu-bun-node`
- **Need Ubuntu Packages** → `ubuntu-bun` or `ubuntu-bun-node`
- **Smallest Size** → `ubuntu-bun` (94 MB)
- **Most Features** → `bun-node` (227 MB)

## 🐳 Image Details

### 1. bun (~135 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainers/bun:latest`

**Description:** Lightweight Bun development environment based on the official Alpine-based Bun
image. Perfect for pure Bun projects that don't require Node.js compatibility.

**Key Features:**

- ⚡ **Fastest startup** - Minimal Alpine base
- 🔧 **Bun 1.2.19** - Latest Bun runtime
- 📦 **Alpine packages** - Access to apk package manager
- 🚀 **Performance optimized** - Smallest footprint for Bun

**Included Tools:**

- Bun 1.2.19
- Git, SSH client, curl
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

### 2. bun-node (~228 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainers/bun-node:latest`

**Description:** Full-featured development environment with both Bun and Node.js. Ideal for projects
that need Bun's performance with Node.js ecosystem compatibility.

**Key Features:**

- 🚀 **Best of both worlds** - Bun speed + Node.js compatibility
- 📦 **Full npm ecosystem** - Access to all npm packages
- 🔧 **Latest runtimes** - Bun 1.2.19 + Node.js v24.5.0
- 🛠️ **Development tools** - ESLint pre-installed

**Included Tools:**

- Bun 1.2.19
- Node.js v24.5.0
- npm 11.5.1
- ESLint (global)
- Git, SSH client, curl
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

### 3. ubuntu-bun (~96 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainers/ubuntu-bun:latest`

**Description:** Ubuntu-based Bun environment for developers who prefer Ubuntu's package ecosystem
and tooling. The smallest image in our collection!

**Key Features:**

- 🏆 **Smallest size** - Only 94 MB!
- 🐧 **Ubuntu familiarity** - Standard Ubuntu environment
- 📦 **Ubuntu packages** - Full access to apt repositories
- 🔐 **sudo access** - Administrative privileges

**Included Tools:**

- Bun 1.2.19 (installed via script)
- Git, SSH client, curl, unzip
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

### 4. ubuntu-bun-node (~167 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node:latest`

**Description:** Complete Ubuntu-based development environment with Bun, Node.js, and npm. Best of
both worlds with Ubuntu's flexibility and modern JavaScript runtimes.

**Key Features:**

- 🌟 **Complete solution** - Ubuntu + Bun + Node.js
- 🔧 **Full toolchain** - Everything for full-stack development
- 📦 **Ubuntu ecosystem** - Access to vast apt repositories
- ⚖️ **Balanced size** - Feature-rich at only 166 MB

**Included Tools:**

- Bun 1.2.19 (installed via script)
- Node.js v24.5.0
- npm 11.5.1
- ESLint (global)
- Git, SSH client, curl, unzip
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

## 🎯 Choosing the Right Image

### Decision Tree

```
Do you need Node.js compatibility?
├─ No → Do you prefer Ubuntu?
│  ├─ Yes → ubuntu-bun
│  └─ No → bun
└─ Yes → Do you prefer Ubuntu?
   ├─ Yes → ubuntu-bun-node
   └─ No → bun-node
```

### Performance Considerations

**Smallest to Largest:**

1. **ubuntu-bun** (~131 MB) - Most efficient Ubuntu option
2. **bun** (~133 MB) - Most efficient overall
3. **ubuntu-bun-node** (~201 MB) - Balanced Ubuntu option
4. **bun-node** (~239 MB) - Full-featured but larger

### Compatibility Matrix

| Feature             | bun        | bun-node | ubuntu-bun | ubuntu-bun-node |
| ------------------- | ---------- | -------- | ---------- | --------------- |
| **Bun APIs**        | ✅ Full    | ✅ Full  | ✅ Full    | ✅ Full         |
| **Node.js APIs**    | ⚠️ Limited | ✅ Full  | ⚠️ Limited | ✅ Full         |
| **npm packages**    | ⚠️ Some    | ✅ All   | ⚠️ Some    | ✅ All          |
| **Ubuntu packages** | ❌         | ❌       | ✅         | ✅              |
| **Alpine packages** | ✅         | ✅       | ❌         | ❌              |

## � Gitpod-Optimized Images

### 5. gitpod-bun (~135 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainers/gitpod-bun:latest`

**Description:** Lightweight Bun runtime optimized for Gitpod cloud development environments.
Includes specific user configuration (UID 33333) and bash shell setup required by Gitpod.

**Key Features:**

- 🔧 **Gitpod user setup** - UID 33333 with proper permissions
- 🐚 **Bash shell forced** - Enhanced compatibility
- 📁 **.bashrc.d/** structure - Modular environment configuration
- ⚡ **Bun 1.2.19** - Latest Bun runtime
- 🎨 **Enhanced prompt** - Useful Bun aliases (bi, br, bt)

**Perfect For:** Gitpod workspaces requiring pure Bun runtime without Node.js

### 6. gitpod-bun-node (~250 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainers/gitpod-bun-node:latest`

**Description:** Full JavaScript development environment for Gitpod with Bun, Node.js v22 (via NVM),
and all major package managers.

**Key Features:**

- 🌟 **Complete Gitpod setup** - All Gitpod requirements met
- 🔧 **Bun + Node.js** - Both runtimes available
- 📦 **All package managers** - npm, yarn, pnpm
- 🎯 **TypeScript support** - Ready for TypeScript projects
- 🎨 **Shell completions** - Both Bun and Node.js

**Perfect For:** Gitpod full-stack development with maximum compatibility

### 7. gitpod-ubuntu-bun (~143 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainers/gitpod-ubuntu-bun:latest`

**Description:** Clean Ubuntu Jammy base with Bun and Gitpod-specific configuration. Maximum control
with Ubuntu ecosystem.

**Key Features:**

- 🐧 **Ubuntu Jammy base** - Clean Ubuntu foundation
- 👤 **Gitpod user configured** - UID 33333 setup
- 🔧 **Bun runtime** - Latest version installed
- 🛠️ **Essential tools** - Git, curl, development utilities
- 📁 **Gitpod environment** - Proper .bashrc.d/ structure

**Perfect For:** Gitpod projects needing Ubuntu packages with Bun

### 8. gitpod-ubuntu-bun-node (~230 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainers/gitpod-ubuntu-bun-node:latest`

**Description:** Complete Ubuntu setup for Gitpod with both Bun and Node.js v22. Full development
environment with maximum flexibility.

**Key Features:**

- 🌟 **Complete stack** - Ubuntu + Bun + Node.js + Gitpod
- 🔧 **Node.js v22 + Bun** - All JavaScript runtimes
- 📦 **All package managers** - npm, yarn, pnpm
- 🐧 **Ubuntu ecosystem** - Full apt package access
- 👤 **Gitpod optimized** - All Gitpod requirements met

**Perfect For:** Gitpod Ubuntu full-stack development with system dependencies

**Gitpod Usage Example:**

```yaml
# .gitpod.yml
image: ghcr.io/iamvikshan/devcontainers/gitpod-bun-node:latest

tasks:
  - init: bun install
    command: bun run dev

ports:
  - port: 3000
    onOpen: open-preview
```

## �📦 Alternative Sources

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
