# DevContainer Image Variants

This document provides detailed information about all available devcontainer images.

## 📊 Image Comparison

| Feature         | bun               | bun-node               | ubuntu-bun       | ubuntu-bun-node   |
| --------------- | ----------------- | ---------------------- | ---------------- | ----------------- |
| **Base Image**  | oven/bun:latest   | oven/bun:latest        | ubuntu:latest    | ubuntu:latest     |
| **Bun Version** | 1.2.19            | 1.2.19                 | 1.2.19           | 1.2.19            |
| **Node.js**     | ❌                | ✅ v24.5.0             | ❌               | ✅ v24.5.0        |
| **npm**         | ❌                | ✅ 11.5.1              | ❌               | ✅ 11.5.1         |
| **Git**         | ✅                | ✅                     | ✅               | ✅                |
| **Size (GHCR)** | ~133 MB           | ~239 MB                | ~131 MB          | ~201 MB           |
| **Layers**      | 27                | 27                     | 20               | 22                |
| **Best For**    | Bun-only projects | Full-stack development | Ubuntu-based Bun | Ubuntu full-stack |

## 🐳 Image Details

### 1. bun

**Registry Paths:**

- `ghcr.io/iamvikshan/devcontainers/bun:latest`
- `registry.gitlab.com/vikshan/devcontainers/bun:latest`
- `docker.io/vikshan/bun:latest`

**Description:** Lightweight Bun development environment based on the official Bun image. Perfect
for Bun-only projects that don't require Node.js compatibility.

**Included Tools:**

- Bun 1.2.19
- Git
- SSH client
- curl
- Basic development utilities

**Use Cases:**

- Pure Bun applications
- Bun package development
- Lightweight scripting
- Performance-critical applications

**Example devcontainer.json:**

```json
{
  "name": "Bun Project",
  "image": "ghcr.io/iamvikshan/devcontainers/bun:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oven.bun-vscode", "esbenp.prettier-vscode"]
    }
  },
  "postCreateCommand": "bun install"
}
```

### 2. bun-node

**Registry Paths:**

- `ghcr.io/iamvikshan/devcontainers/bun-node:latest`
- `registry.gitlab.com/vikshan/devcontainers/bun-node:latest`
- `docker.io/vikshan/bun-node:latest`

**Description:** Full-featured development environment with both Bun and Node.js. Ideal for projects
that need Bun's performance with Node.js ecosystem compatibility.

**Included Tools:**

- Bun 1.2.19
- Node.js v24.5.0
- npm 11.5.1
- ESLint (global)
- Git
- SSH client
- curl

**Use Cases:**

- Full-stack applications
- Migration from Node.js to Bun
- Projects requiring Node.js compatibility
- Complex web applications

**Example devcontainer.json:**

```json
{
  "name": "Bun + Node.js Project",
  "image": "ghcr.io/iamvikshan/devcontainers/bun-node:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oven.bun-vscode", "dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
    }
  },
  "postCreateCommand": "bun install"
}
```

### 3. ubuntu-bun

**Registry Paths:**

- `ghcr.io/iamvikshan/devcontainers/ubuntu-bun:latest`
- `registry.gitlab.com/vikshan/devcontainers/ubuntu-bun:latest`
- `docker.io/vikshan/ubuntu-bun:latest`

**Description:** Ubuntu-based Bun environment for developers who prefer Ubuntu's package ecosystem
and tooling. More familiar environment for Ubuntu users.

**Included Tools:**

- Bun 1.2.19 (installed via script)
- Git
- sudo
- curl, unzip
- Ubuntu package manager (apt)

**Use Cases:**

- Ubuntu-familiar developers
- Projects requiring Ubuntu-specific packages
- System administration scripts
- Custom toolchain requirements

**Example devcontainer.json:**

```json
{
  "name": "Ubuntu + Bun Project",
  "image": "ghcr.io/iamvikshan/devcontainers/ubuntu-bun:latest",
  "customizations": {
    "vscode": {
      "extensions": ["oven.bun-vscode", "esbenp.prettier-vscode"]
    }
  },
  "postCreateCommand": "bun install"
}
```

### 4. ubuntu-bun-node

**Registry Paths:**

- `ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node:latest`
- `registry.gitlab.com/vikshan/devcontainers/ubuntu-bun-node:latest`
- `docker.io/vikshan/ubuntu-bun-node:latest`

**Description:** Complete Ubuntu-based development environment with Bun, Node.js, and npm. Best of
both worlds with Ubuntu's flexibility and modern JavaScript runtimes.

**Included Tools:**

- Bun 1.2.19 (installed via script)
- Node.js v24.5.0
- npm 11.5.1
- ESLint (global, if non-root user)
- Git
- sudo
- curl, unzip
- Ubuntu package manager (apt)

**Use Cases:**

- Full-stack development on Ubuntu
- Complex projects with system dependencies
- CI/CD pipelines requiring Ubuntu
- Development teams using Ubuntu

**Example devcontainer.json:**

```json
{
  "name": "Ubuntu + Bun + Node.js Project",
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

## 🔄 Update Schedule

All images are automatically updated:

- **Weekly builds** every Sunday at 2 AM UTC
- **Base image updates** trigger immediate rebuilds
- **Security patches** applied within 24 hours

## 📈 Version History

See [VERSIONS.md](../VERSIONS.md) for detailed version history and changelogs.

## 🤝 Contributing

To contribute improvements to any image:

1. Fork the repository
2. Make changes to the appropriate Dockerfile
3. Test locally using [build commands](BUILD_COMMANDS.md)
4. Submit a pull request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/iamvikshan/devcontainers/issues)
- **Discussions**: [GitHub Discussions](https://github.com/iamvikshan/devcontainers/discussions)
- **Documentation**: [Setup Guide](SETUP.md)
