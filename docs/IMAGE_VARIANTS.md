# DevContainer Image Variants

This document provides detailed information about all 5 available devcontainer
images.

## 📊 Images Comparison

| Feature         | bun               | bun-node               | ubuntu-bun       | ubuntu-bun-node   | agents            | ubuntu-tools          |
| --------------- | ----------------- | ---------------------- | ---------------- | ----------------- | ----------------- | --------------------- |
| **Base Image**  | oven/bun (Alpine) | oven/bun (Alpine)      | ubuntu:latest    | ubuntu:latest     | ubuntu:latest     | ubuntu:latest         |
| **Size**        | ~57 MB | ~82 MB | ~117 MB | ~173 MB | ~2283 MB | ~82 MB |
| **Bun Version** | 1.3.14 | 1.3.14 | 1.3.14 | 1.3.14 | 1.3.14 | ❌ |
| **Node.js**     | ❌ | ✅ v22.11.0 | ❌ | ✅ v24.18.0 | ✅ v24.18.0 | ❌ |
| **npm**         | ❌                | ✅ 10.9.0              | ❌               | ✅ 10.9.0         | ❌                | ❌                    |
| **Package Mgr** | Alpine (apk)      | Alpine (apk)           | Ubuntu (apt)     | Ubuntu (apt)      | Ubuntu (apt)      | Ubuntu (apt)          |
| **Best For**    | Pure Bun projects | Full-stack development | Ubuntu workflows | Ubuntu full-stack | AI & custom tools | Tools-only automation |

## 🎯 Image Selection Guide

### By Use Case

- **Pure Bun Development** → `bun` or `ubuntu-bun`
- **Full-Stack Projects** → `bun-node` or `ubuntu-bun-node`
- **Need Ubuntu Packages** → `ubuntu-bun` or `ubuntu-bun-node`
- **Need Ubuntu Tools Without JS Runtimes** → `ubuntu-tools`
- **Smallest Size** → `ubuntu-bun` (117 MB)
- **Most Features** → `bun-node` (82 MB)

## 🐳 Image Details

### 1. bun (~57 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainer/bun:latest`

**Description:** Lightweight Bun development environment based on the official
Alpine-based Bun image. Perfect for pure Bun projects that don't require Node.js
compatibility.

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
  "image": "ghcr.io/iamvikshan/devcontainer/bun:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oven.bun-vscode", "oxc.oxc-vscode"]
    }
  },
  "postCreateCommand": "bun install"
}
```

### 2. bun-node (~82 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainer/bun-node:latest`

**Description:** Full-featured development environment with both Bun and
Node.js. Ideal for projects that need Bun's performance with Node.js ecosystem
compatibility.

**Key Features:**

- 🚀 **Best of both worlds** - Bun speed + Node.js compatibility
- 📦 **Full npm ecosystem** - Access to all npm packages
- 🔧 **Latest runtimes** - Bun and Node.js

**Included Tools:**

- Bun 1.3.3
- Node.js
- npm
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
  "image": "ghcr.io/iamvikshan/devcontainer/bun-node:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oven.bun-vscode", "oxc.oxc-vscode"]
    }
  },
  "postCreateCommand": "bun install"
}
```

### 3. ubuntu-bun (~117 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainer/ubuntu-bun:latest`

**Description:** Ubuntu-based Bun environment for developers who prefer Ubuntu's
package ecosystem and tooling. The smallest image in our collection!

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
  "image": "ghcr.io/iamvikshan/devcontainer/ubuntu-bun:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oven.bun-vscode", "oxc.oxc-vscode"]
    }
  },
  "postCreateCommand": "bun install"
}
```

### 4. ubuntu-bun-node (~173 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainer/ubuntu-bun-node:latest`

**Description:** Complete Ubuntu-based development environment with Bun,
Node.js, and npm. Best of both worlds with Ubuntu's flexibility and modern
JavaScript runtimes.

**Key Features:**

- 🌟 **Complete solution** - Ubuntu + Bun + Node.js
- 🔧 **Full toolchain** - Everything for full-stack development
- 📦 **Ubuntu ecosystem** - Access to vast apt repositories
- ⚖️ **Balanced size** - Feature-rich at only 166 MB

**Included Tools:**

- Bun 1.3.3 (installed via script)
- Node.js v22.11.0
- npm 10.9.0
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
  "image": "ghcr.io/iamvikshan/devcontainer/ubuntu-bun-node:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oven.bun-vscode", "oxc.oxc-vscode"]
    }
  },
  "postCreateCommand": "bun install"
}
```

### 5. agents (~2283 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainer/agents:latest`

**Description:** Ubuntu-based Bun environment configured for personal AI development, complete with coderabbit CLI and antigravity CLI (agy). It also routes Node.js command execution to Bun.

**Key Features:**

- 🤖 **AI-augmented** - Built-in coderabbit CLI and antigravity CLI
- ⚡ **Node Checkmate** - Seamlessly redirects node commands to bun
- 📦 **Ubuntu packages** - Full access to apt repositories
- 🔐 **sudo access** - Administrative privileges

**Included Tools:**

- Bun (glibc build)
- CodeRabbit CLI
- Antigravity CLI (agy)
- Node.js command compatibility redirection
- Git, SSH client, curl, unzip
- btop (system resource monitor)
- sudo (administrative access)

**Perfect For:**

- Personal AI assistant coding workflows
- Projects using CodeRabbit & Antigravity tools
- General Ubuntu-based Bun development

**Example Configuration:**

```json
{
  "name": "AI Bun Workspace",
  "image": "ghcr.io/iamvikshan/devcontainer/agents:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oven.bun-vscode", "oxc.oxc-vscode", "coderabbit.coderabbit-vscode"]
    }
  }
}
```

### 6. ubuntu-tools (~82 MB)

**Primary Image:** `ghcr.io/iamvikshan/devcontainer/ubuntu-tools:latest`

**Description:** Ubuntu-based tools-only environment for automation, scripting,
and utility-heavy workflows that do not require Bun or Node.js runtimes.

**Key Features:**

- 🧰 **Tools-focused image** - Includes jq, Git, curl, and btop
- 🐧 **Ubuntu base** - Standard Ubuntu package ecosystem with apt
- 🔐 **sudo access** - Administrative privileges for setup tasks
- 🚫 **No JS runtime bundle** - No Bun, Node.js, or npm preinstalled

**Included Tools:**

- jq
- Git, SSH client, curl, unzip
- btop (system resource monitor)
- sudo (administrative access)
- Ubuntu package manager (apt)

**Perfect For:**

- Automation scripts and CI utilities
- JSON/data transformation tasks
- Projects requiring a minimal tools baseline

**Example Configuration:**

```json
{
  "name": "Tools Workspace",
  "image": "ghcr.io/iamvikshan/devcontainer/ubuntu-tools:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oxc.oxc-vscode"]
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

1. **ubuntu-tools** (~82 MB) - Tools-focused baseline
2. **ubuntu-bun** (~117 MB) - Most efficient Ubuntu Bun option
3. **bun** (~57 MB) - Most efficient Bun runtime option
4. **ubuntu-bun-node** (~173 MB) - Balanced Ubuntu full-stack option
5. **bun-node** (~82 MB) - Full-featured but larger

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

While we recommend using GitHub Container Registry as the primary source, all
images are available from multiple registries:

### GitHub Container Registry (Primary)

```bash
ghcr.io/iamvikshan/devcontainer/[image]:latest
```

### GitLab Container Registry

```bash
registry.gitlab.com/vikshan/devcontainers/devcontainer/[image]:latest
```

### Docker Hub

```bash
docker.io/vikshan/[image]:latest
```

> **Note:** All registries contain identical images. Choose based on your
> preference or organizational requirements.

## 🔄 Update Schedule

All images are automatically updated:

- **Weekly builds** every Sunday at 2 AM UTC
- **Base image updates** trigger immediate rebuilds
- **Security patches** applied within 24 hours

## 📈 Version History

See [CHANGELOG.md](../CHANGELOG.md#released-versions) for detailed version
history and changelogs.

## 🤝 Contributing

To contribute improvements to any image:

1. Fork the repository
2. Make changes to the appropriate Dockerfile
3. Test locally using [build commands](BUILD_COMMANDS.md)
4. Submit a pull request

## 📞 Support

- **Issues**:
  [GitHub Issues](https://github.com/iamvikshan/devcontainers/issues)
- **Discussions**:
  [GitHub Discussions](https://github.com/iamvikshan/devcontainers/discussions)
- **Setup Guide**: [SETUP.md](SETUP.md)
- **Build Guide**: [BUILD_COMMANDS.md](BUILD_COMMANDS.md)
