# Gitpod DevContainer Images

This directory contains Gitpod-optimized DevContainer images designed to work seamlessly with
Gitpod's cloud development environment. These images address Gitpod's specific requirements and
preferences.

## Why Gitpod-Specific Images?

Gitpod has several unique requirements that differ from standard DevContainers:

1. **User Requirements**: Gitpod requires a specific user setup with UID 33333 and username `gitpod`
2. **Shell Preference**: Gitpod environments tend to default to `sh`, but these images force `bash`
   for better compatibility
3. **Environment Structure**: Uses `.bashrc.d/` directory structure for modular environment setup
4. **Path Management**: Specific PATH and environment variable requirements for optimal performance

## Available Images

### 1. `bun/` - Gitpod Bun Image

**Base**: `gitpod/workspace-base:latest` **Purpose**: Lightweight Bun runtime for Gitpod workspaces

**Features**:

- Bun runtime with latest version
- Gitpod-optimized environment
- Bash shell forced for compatibility
- Enhanced shell prompt
- Useful Bun aliases (`bi`, `br`, `bt`, etc.)

**Usage in `.gitpod.yml`**:

```yaml
image:
  file: .gitpod.Dockerfile
# In your .gitpod.Dockerfile:
# FROM your-registry/gitpod-bun:latest
```

### 2. `bun-node/` - Gitpod Bun + Node.js Image

**Base**: `gitpod/workspace-base:latest` **Purpose**: Full JavaScript development environment with
both Bun and Node.js

**Features**:

- Bun runtime (latest)
- Node.js v22 via NVM
- npm, yarn, pnpm package managers
- TypeScript support
- Enhanced development aliases
- Both Bun and Node.js completions

**Usage in `.gitpod.yml`**:

```yaml
image:
  file: .gitpod.Dockerfile
# In your .gitpod.Dockerfile:
# FROM your-registry/gitpod-bun-node:latest
```

### 3. `ubuntu-bun/` - Ubuntu-based Bun Image

**Base**: `ubuntu:jammy` **Purpose**: Minimal Ubuntu setup with Bun for maximum control

**Features**:

- Clean Ubuntu Jammy base
- Gitpod user setup (UID 33333)
- Bun runtime
- Essential development tools
- Gitpod-specific environment configuration

### 4. `ubuntu-bun-node/` - Ubuntu-based Bun + Node.js Image

**Base**: `ubuntu:jammy` **Purpose**: Full Ubuntu setup with both Bun and Node.js

**Features**:

- Clean Ubuntu Jammy base
- Gitpod user setup (UID 33333)
- Node.js v22 + Bun
- All JavaScript package managers
- Complete development environment

## Key Gitpod Optimizations

### Shell Configuration

All images force the use of `bash` instead of `sh`:

```bash
# Override sh preference in Gitpod
if [ -z "$SHELL" ] || [ "$SHELL" = "/bin/sh" ]; then
  export SHELL="/bin/bash"
fi
```

### Environment Structure

Uses Gitpod's preferred `.bashrc.d/` pattern:

```bash
# Modular environment setup
echo 'export BUN_INSTALL="$HOME/.bun"' >> /home/gitpod/.bashrc.d/100-bun
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> /home/gitpod/.bashrc.d/100-bun
```

### Enhanced Welcome Messages

First-run notices provide useful information:

- Tool versions
- Available commands
- Workspace context
- Helpful tips

### User Setup

Proper Gitpod user configuration:

```dockerfile
# Create gitpod user with correct UID
RUN useradd -l -u 33333 -G sudo -md /home/gitpod -s /bin/bash -p gitpod gitpod
```

## Building the Images

Each image directory contains:

- `Dockerfile` - The image definition
- `setup.sh` - Environment setup script

To build locally:

```bash
cd gitpod/bun
docker build -t gitpod-bun .

cd ../bun-node
docker build -t gitpod-bun-node .

cd ../ubuntu-bun
docker build -t gitpod-ubuntu-bun .

cd ../ubuntu-bun-node
docker build -t gitpod-ubuntu-bun-node .
```

## Usage Recommendations

### For New Projects

Start with `gitpod/bun/` for pure Bun projects or `gitpod/bun-node/` for mixed environments.

### For Existing Projects

If you need maximum compatibility with existing Node.js tooling, use `gitpod/bun-node/`.

### For Custom Requirements

Use the Ubuntu-based images (`ubuntu-bun/` or `ubuntu-bun-node/`) if you need to add additional
system packages or have specific OS requirements.

## Environment Variables

All images set up these Gitpod-specific variables:

- `GITPOD_WORKSPACE_ID` - Workspace identifier
- `GITPOD_WORKSPACE_URL` - Workspace URL
- `GITPOD_REPO_ROOT` - Repository root (defaults to `/workspace`)
- `SHELL` - Forced to `/bin/bash`

## Troubleshooting

### Shell Issues

If you encounter shell-related problems, these images force bash usage to avoid common `sh`
compatibility issues in Gitpod.

### Path Problems

The images set up proper PATH configurations in `.bashrc.d/` files. If tools aren't found, check
that the environment is properly sourced.

### Permission Issues

All images use the proper `gitpod` user (UID 33333) required by Gitpod environments.

## Contributing

When modifying these images:

1. Maintain Gitpod user requirements (UID 33333)
2. Use `.bashrc.d/` pattern for environment setup
3. Force bash shell usage
4. Test in actual Gitpod workspaces
5. Update version tracking in tool-versions.txt
