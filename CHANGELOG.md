# Changelog

All notable changes to this project will be documented in this file.

## [0.0.4] - 2025-12-02

### Released Versions

| Container       | Version | Date       | Registry Links                                                                                                                                                                                                              |
| --------------- | ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bun             | v0.0.6  | 2025-12-08 | [GHCR](https://ghcr.io/iamvikshan/devcontainers/bun:0.0.4) · [Docker Hub](https://hub.docker.com/r/vikshan/bun) · [GitLab](https://registry.gitlab.com/vikshan/devcontainers/bun:0.0.4)                                     |
| bun-node        | v0.0.6  | 2025-12-08 | [GHCR](https://ghcr.io/iamvikshan/devcontainers/bun-node:0.0.4) · [Docker Hub](https://hub.docker.com/r/vikshan/bun-node) · [GitLab](https://registry.gitlab.com/vikshan/devcontainers/bun-node:0.0.4)                      |
| ubuntu-bun      | v0.0.7  | 2025-12-08 | [GHCR](https://ghcr.io/iamvikshan/devcontainers/ubuntu-bun:0.0.4) · [Docker Hub](https://hub.docker.com/r/vikshan/ubuntu-bun) · [GitLab](https://registry.gitlab.com/vikshan/devcontainers/ubuntu-bun:0.0.4)                |
| ubuntu-bun-node | v0.0.7  | 2025-12-08 | [GHCR](https://ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node:0.0.4) · [Docker Hub](https://hub.docker.com/r/vikshan/ubuntu-bun-node) · [GitLab](https://registry.gitlab.com/vikshan/devcontainers/ubuntu-bun-node:0.0.4) |

---

## [0.0.3] - 2025-10-28

### Released Versions

| Container       | Version | Date       | Registry Links                                                                                                                                                                                                              |
| --------------- | ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bun             | v0.0.3  | 2025-10-28 | [GHCR](https://ghcr.io/iamvikshan/devcontainers/bun:0.0.3) · [Docker Hub](https://hub.docker.com/r/vikshan/bun) · [GitLab](https://registry.gitlab.com/vikshan/devcontainers/bun:0.0.3)                                     |
| bun-node        | v0.0.3  | 2025-10-28 | [GHCR](https://ghcr.io/iamvikshan/devcontainers/bun-node:0.0.3) · [Docker Hub](https://hub.docker.com/r/vikshan/bun-node) · [GitLab](https://registry.gitlab.com/vikshan/devcontainers/bun-node:0.0.3)                      |
| ubuntu-bun      | v0.0.3  | 2025-10-28 | [GHCR](https://ghcr.io/iamvikshan/devcontainers/ubuntu-bun:0.0.3) · [Docker Hub](https://hub.docker.com/r/vikshan/ubuntu-bun) · [GitLab](https://registry.gitlab.com/vikshan/devcontainers/ubuntu-bun:0.0.3)                |
| ubuntu-bun-node | v0.0.3  | 2025-10-28 | [GHCR](https://ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node:0.0.3) · [Docker Hub](https://hub.docker.com/r/vikshan/ubuntu-bun-node) · [GitLab](https://registry.gitlab.com/vikshan/devcontainers/ubuntu-bun-node:0.0.3) |

## Bug Fixes

- fix: consolidate version tracking and optimize release workflow
  ([fd3d8bc](https://github.com/iamvikshan/devcontainers/commit/fd3d8bce896e733879d0852f72d06494b76fd7c8))

## Other Changes

- release: 0.0.1 - roll back and implement manual release override functionality and update
  changelog format
  ([5d82204](https://github.com/iamvikshan/devcontainers/commit/5d82204a9158b2e21b7215be4ddd9fe05b400ccb))

---

## [0.0.1] - 2025-10-19

## Container Updates

- **bun**: 0.0.1 → 0.0.1 (manual release override)
- **bun-node**: 0.0.1 → 0.0.1 (manual release override)
- **ubuntu-bun**: 0.0.1 → 0.0.1 (manual release override)
- **ubuntu-bun-node**: 0.0.1 → 0.0.1 (manual release override)

## Bug Fixes

- fix: consolidate version tracking and optimize release workflow
  ([fd3d8bc](https://github.com/iamvikshan/devcontainers/commit/fd3d8bce896e733879d0852f72d06494b76fd7c8))
- fix: setup script for improved readability and consistency; update package.json dependencies;
  enhance build-all-images script with better error handling and logging; add GitHub Actions for
  building, cleaning up, and tagging container images; implement scripts for extracting tool
  versions and cleaning untagged images; ensure Docker setup verification is robust and
  user-friendly.
  ([700d7a6](https://github.com/iamvikshan/devcontainers/commit/700d7a6c933475adbb5de52aa1b26a73eb294e91))
- fix: resolve untagged images and missing Gitpod containers in documentation
  ([e9fe715](https://github.com/iamvikshan/devcontainers/commit/e9fe7155313c0123944aa9caf9e5393131d89682))

## Other Changes

- release: 0.0.1 - roll back and implement manual release override functionality and update
  changelog format
  ([5d82204](https://github.com/iamvikshan/devcontainers/commit/5d82204a9158b2e21b7215be4ddd9fe05b400ccb))

## [0.0.1] - 2025-10-18

## Container Updates

- **bun**: 2.0.0 → 0.0.1 (manual release override)
- **bun-node**: 2.0.0 → 0.0.1 (manual release override)
- **ubuntu-bun**: 2.0.0 → 0.0.1 (manual release override)
- **ubuntu-bun-node**: 2.0.0 → 0.0.1 (manual release override)

## Bug Fixes

- fix: resolve version bumping, changelog formatting, and release loop issues
  ([9aa6709](https://github.com/iamvikshan/devcontainers/commit/9aa67092335a6a9f7e0e8a96b87985d4cdd82979))
- fix: consolidate version tracking and optimize release workflow
  ([fd3d8bc](https://github.com/iamvikshan/devcontainers/commit/fd3d8bce896e733879d0852f72d06494b76fd7c8))
- fix: setup script for improved readability and consistency; update package.json dependencies;
  enhance build-all-images script with better error handling and logging; add GitHub Actions for
  building, cleaning up, and tagging container images; implement scripts for extracting tool
  versions and cleaning untagged images; ensure Docker setup verification is robust and
  user-friendly.
  ([700d7a6](https://github.com/iamvikshan/devcontainers/commit/700d7a6c933475adbb5de52aa1b26a73eb294e91))
- fix: update base images for ubuntu-bun,ubuntu-bun-node,gitpod-ubuntu-bun,gitpod-ubuntu-bun-node
  ([798074f](https://github.com/iamvikshan/devcontainers/commit/798074fda7df081ad6e7259498bbc344e620561e))
- fix: update base images for bun,bun-node,gitpod-bun,gitpod-bun-node
  ([e28d899](https://github.com/iamvikshan/devcontainers/commit/e28d89945aad9557d1ad1a56746289433c1a5d74))
- fix: update base images for ubuntu-bun,ubuntu-bun-node,gitpod-ubuntu-bun,gitpod-ubuntu-bun-node
  ([52a2747](https://github.com/iamvikshan/devcontainers/commit/52a2747fdde5cfe5b1502ec50ab7ef22b6531314))
- fix: update base images for ubuntu-bun,ubuntu-bun-node,gitpod-ubuntu-bun,gitpod-ubuntu-bun-node
  ([f1c0de4](https://github.com/iamvikshan/devcontainers/commit/f1c0de447ffe3d3131eaf1f970e20a43fe9a8e3d))
- fix: update base images for ubuntu-bun,ubuntu-bun-node,gitpod-ubuntu-bun,gitpod-ubuntu-bun-node
  ([bd9078a](https://github.com/iamvikshan/devcontainers/commit/bd9078a30b74a21604d7e3fe5325f6e3f51b23e0))
- fix: update base images for bun,bun-node,gitpod-bun,gitpod-bun-node
  ([e127627](https://github.com/iamvikshan/devcontainers/commit/e127627471cc091180e0608abb3c5b6b9f7358bb))
- fix: resolve untagged images and missing Gitpod containers in documentation
  ([e9fe715](https://github.com/iamvikshan/devcontainers/commit/e9fe7155313c0123944aa9caf9e5393131d89682))

## Other Changes

- release: 0.0.1 - roll back and implement manual release override functionality and update
  changelog format
  ([5d82204](https://github.com/iamvikshan/devcontainers/commit/5d82204a9158b2e21b7215be4ddd9fe05b400ccb))
- docs: update documentation for release v2.0.0
  ([c098a72](https://github.com/iamvikshan/devcontainers/commit/c098a723e995a56c321f416a057d328c3d303a62))
- chore: bump OpenSaucedHub/advanced-git-sync in the github-actions group (#36)
  ([07af88f](https://github.com/iamvikshan/devcontainers/commit/07af88f4cd5cf387170b70fe08d0dc62f46557a1))
- chore: streamline tool version extraction script in release workflow
  ([df3ef63](https://github.com/iamvikshan/devcontainers/commit/df3ef632841a1fded0e8133cfe1a89198417ccb4))
- chore: Refactor version management to changelog management
  ([f874a69](https://github.com/iamvikshan/devcontainers/commit/f874a69bccbc56c9f95b2b72afd9cc93eaee3128))

## Released Versions

| Container       | Current Version | Last Updated | Registry Links                                                                                                                                                                                                                  |
| --------------- | --------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bun             | v0.0.1 (latest) | 2025-10-18   | [GitHub](https://ghcr.io/iamvikshan/devcontainers/bun:latest) · [GitLab](https://registry.gitlab.com/vikshan/devcontainers/bun:latest) · [Docker Hub](https://hub.docker.com/r/vikshan/bun)                                     |
| bun-node        | v0.0.1 (latest) | 2025-10-18   | [GitHub](https://ghcr.io/iamvikshan/devcontainers/bun-node:latest) · [GitLab](https://registry.gitlab.com/vikshan/devcontainers/bun-node:latest) · [Docker Hub](https://hub.docker.com/r/vikshan/bun-node)                      |
| ubuntu-bun      | v0.0.1 (latest) | 2025-10-18   | [GitHub](https://ghcr.io/iamvikshan/devcontainers/ubuntu-bun:latest) · [GitLab](https://registry.gitlab.com/vikshan/devcontainers/ubuntu-bun:latest) · [Docker Hub](https://hub.docker.com/r/vikshan/ubuntu-bun)                |
| ubuntu-bun-node | v0.0.1 (latest) | 2025-10-18   | [GitHub](https://ghcr.io/iamvikshan/devcontainers/ubuntu-bun-node:latest) · [GitLab](https://registry.gitlab.com/vikshan/devcontainers/ubuntu-bun-node:latest) · [Docker Hub](https://hub.docker.com/r/vikshan/ubuntu-bun-node) |

> **Note:** The "(latest)" marker indicates the version currently tagged as `:latest` in all
> registries.

---

### 2025-10-23 - Base Image Updates

**Updated at:** 2025-10-23T05:10:06.095Z

**Base images updated:**

- **bun**: `oven/bun:latest`
  - Base image last updated: 10/22/2025
  - Digest: `sha256:9c5d3`
- **bun-node**: `oven/bun:latest`
  - Base image last updated: 10/22/2025
  - Digest: `sha256:9c5d3`
- **gitpod-bun**: `oven/bun:latest`
  - Base image last updated: 10/22/2025
  - Digest: `sha256:9c5d3`
- **gitpod-bun-node**: `oven/bun:latest`
  - Base image last updated: 10/22/2025
  - Digest: `sha256:9c5d3`

**Changes:**

- Updated base images to latest versions
- Security patches and bug fixes from upstream
- Improved compatibility and performance

**Impact:** Patch release - DevContainers will be rebuilt with updated base images

---

## [2.0.0] - 2025-10-18

## Container Updates

- **bun-node**: 1.0.1 → 2.0.0 (feat (breaking))
- **bun**: 1.0.1 → 2.0.0 (feat (breaking))
- **gitpod-bun-node**: 1.0.1 → 1.1.0 (feat)
- **gitpod-bun**: 1.0.1 → 1.1.0 (feat)
- **gitpod-ubuntu-bun-node**: 1.0.1 → 1.1.0 (feat)
- **gitpod-ubuntu-bun**: 1.0.1 → 1.1.0 (feat)
- **ubuntu-bun**: 1.0.1 → 2.0.0 (feat (breaking))
- **ubuntu-bun-node**: 1.0.1 → 2.0.0 (feat (breaking))

## Features

- feat: Add Gitpod-specific DevContainer images for Bun and Node.js (3a7c300)
- feat: Implement release orchestration and version management scripts (41016db)
- feat!: Implement centralized registry client for Docker Hub, GHCR, and GitLab (0b833d5)
- feat: let's start over, shall we? update release workflows to prevent redundant triggers and
  enhance sync operations (5aba3ef)

## Bug Fixes

- fix: consolidate version tracking and optimize release workflow (fd3d8bc)
- fix: setup script for improved readability and consistency; update package.json dependencies;
  enhance build-all-images script with better error handling and logging; add GitHub Actions for
  building, cleaning up, and tagging container images; implement scripts for extracting tool
  versions and cleaning untagged images; ensure Docker setup verification is robust and
  user-friendly. (700d7a6)
- fix: update base images for ubuntu-bun,ubuntu-bun-node,gitpod-ubuntu-bun,gitpod-ubuntu-bun-node
  (798074f)
- fix: update base images for bun,bun-node,gitpod-bun,gitpod-bun-node (e28d899)
- fix: update base images for ubuntu-bun,ubuntu-bun-node,gitpod-ubuntu-bun,gitpod-ubuntu-bun-node
  (52a2747)
- fix: update base images for ubuntu-bun,ubuntu-bun-node,gitpod-ubuntu-bun,gitpod-ubuntu-bun-node
  (f1c0de4)
- fix: update base images for ubuntu-bun,ubuntu-bun-node,gitpod-ubuntu-bun,gitpod-ubuntu-bun-node
  (bd9078a)
- fix: update base images for bun,bun-node,gitpod-bun,gitpod-bun-node (e127627)
- fix: resolve untagged images and missing Gitpod containers in documentation (e9fe715)
- fix: update advanced-git-sync action version and improve SSH startup script in gitpod Dockerfiles
  (6b33e3f)
- fix: update Dockerfiles to include SSH server and configure settings for improved access (ea95c30)
- fix: update base images for ubuntu-bun,ubuntu-bun-node,gitpod-ubuntu-bun,gitpod-ubuntu-bun-node
  (9296340)
- fix: add remote pull before pushing documentation changes and tags to avoid conflicts (b0e3d4c)
- fix: update base images for ubuntu-bun,ubuntu-bun-node,gitpod-ubuntu-bun,gitpod-ubuntu-bun-node
  (a717021)
- fix: update base images for bun,bun-node,gitpod-bun,gitpod-bun-node (65d85bb)
- fix: Enhance base image check and release workflows (02baa52)
- fix: update base images for bun, bun-node (f19798f)
- fix: update base images for bun, bun-node (55537b6)
- fix: update base images for ubuntu-bun, ubuntu-bun-node (6cfd75e)
- fix: update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node (ab3155f)
- fix: update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node (5bb948e)
- fix: update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node (0b5bffa)
- fix: update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node (2bf890e)
- fix: update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node (e375dd4)
- fix: update base images for bun, bun-node (abe2d81)
- fix: update image sizes in documentation and streamline action configurations (3f29d11)
- fix: update documentation commit message and streamline push process for versioning (5a90d62)
- fix: update README and action configurations to include Docker Hub support and streamline
  container registry authentication (3163fbb)
- fix: streamline Docker image build process by combining build and push steps for GitHub and GitLab
  registries (0b8c065)
- fix: update GitHub Actions for documentation updates and remove GitLab integration (ba02651)
- fix: update README files with new image sizes and enhance GitHub Actions for documentation updates
  (f47e47b)
- fix: update sync configuration and enhance release workflow steps (687909c)
- fix: implement image size updater script and update README files with new sizes (e6c2811)
- fix: update advanced-git-sync action version to v1.1.5 in sync workflow (18dda27)
- fix: update GitHub Actions workflow and dependencies; upgrade checkout action and sync action
  version. Uprade bun to v1.1.38 (10bc7cd)

## Other Changes

- chore: bump OpenSaucedHub/advanced-git-sync in the github-actions group (#36) (07af88f)
- chore: streamline tool version extraction script in release workflow (df3ef63)
- chore: Refactor version management to changelog management (f874a69)
- docs: update documentation for release v1.1.5 (3e9edd4)
- docs: update documentation for release v1.1.4 (05ccce1)
- docs: update documentation for release v1.1.3 (a13f5e6)
- docs: update documentation for release v1.1.2 (ea89dd8)
- docs: update documentation for release v1.1.1 (3ebedf3)
- docs: update documentation for release v1.1.0 (e6ea0d8)
- docs: update documentation for release v2.0.0 (1e4f542)
- chore(release): 1.1.4 [skip ci] (fc9ab4d)
- chore(release): 1.1.3 [skip ci] (efd4322)
- chore: enhance logging functionality and add silent mode support (18fefed)
- chore: bump OpenSaucedHub/advanced-git-sync in the github-actions group (#32) (b2e4933)
- chore(release): 1.1.2 [skip ci] (14dcf85)
- chore(release): 1.1.2 [skip ci] (d9ab672)
- chore: update advanced-git-sync action to version 1.4.2 (8908b95)
- chore: update setup actions to use Bun and upgrade advanced-git-sync version (67dee93)
- chore: improve pre-release check and version prediction scripts for better workflow integration
  (44920b5)
- chore: enhance release workflow with pre-release checks and version prediction (6217251)
- Release 1.1.2 [skip ci] (fd9ceca)
- Release 1.1.2 [skip ci] (58779bc)
- Release 1.1.2 [skip ci] (6454123)
- Release 1.1.2 [skip ci] (4e439b1)
- Release 1.1.2 [skip ci] (10bfd3c)
- chore: enable token persistence for checkout and improve git push handling (e39c2f9)
- Release 1.1.2 [skip ci] (d9ef26f)
- Release 1.1.2 [skip ci] (ebd0db8)
- chore: bump actions/checkout (#28) (3dcb12d)
- chore: update versions and sizes for release 1.1.2 [skip-sync] (cfa1d84)
- chore: update versions and sizes for release 1.1.2 [skip-sync] (608fdbb)
- chore: update versions and sizes for release 1.1.2 [skip-sync] (20ec840)
- chore: update versions and sizes for release 1.1.1 [skip-sync] (2ff0898)
- chore: update versions and sizes for release 1.1.1 [skip-sync] (2ba6fdd)
- chore: update versions and sizes for release 1.1.1 [skip-sync] (b17f58b)
- Release 1.1.1 [skip ci] (367a195)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (584a5af)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (860a358)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (925f1cc)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (6cabd5f)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (6e9e897)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (09c96ad)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (f4ec70a)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (4e575ce)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (f2142c6)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (e882991)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (1fc368a)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (8a63d41)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (c4de125)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (0728fcc)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (3f877b5)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (3a5687f)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (f9a043a)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (8efdb63)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (cf479f3)
- chore: migrate from versions.json to VERSIONS.md for version management (1767e05)
- chore: update workflows to trigger release with reason input and log trigger details (1d29a02)
- chore: update sync configuration and GitHub Actions workflow for improved syncing and permissions
  (7d621a6)
- chore: update Docker update schedule to daily and upgrade sync action version (445ac4d)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (e52540f)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (a3822ca)
- Release 1.1.0 [skip ci] (98bc36f)
- ✨ feat: fix GitHub Actions token issues and optimize version management (a2be3a8)
- Release 1.0.4 [skip ci] (f5cd167)
- chore(deps-dev): bump @types/node from 22.16.5 to 24.1.0 (#22) (9609880)
- Merge pull request #18 from
  iamvikshan/dependabot/npm_and_yarn/conventional-changelog-conventionalcommits-9.1.0 (8570805)
- Release 1.0.3 [skip ci] (f700fbe)
- Release 1.0.3 [skip ci] (2df4456)
- Release 1.0.2 [skip ci] (6325b60)
- Release 1.0.1 [skip ci] (3441835)
- Release 1.0.0 [skip ci] (ac0d4e4)
- Release 1.0.0 [skip ci] (56ecffd)
- Update and rename gl-sync.yml to sync.yml (4c40196)
- Update gl-sync.yml (8b8267b)
- chore: update GitHub Actions workflows and sync configuration; enhance release process and improve
  README badges (8ad8372)
- Release 1.0.0 [skip ci] (b1d0dc1)
- chore: update CLA workflow to use consistent GitHub token; refine release workflow triggers and
  update changelog (e4ab6ad)
- Release 1.0.0 [skip ci] (89fcea2)
- Release 1.0.0 [skip ci] (4b88988)
- chore: update container images and README with accurate sizes; adjust GitHub Actions for token
  consistency (e078146)
- Release 1.0.0 [skip ci] (7166661)

## [1.1.5] - 2025-09-24

## Container Updates

- **gitpod-ubuntu-bun-node**: 1.1.4 → 1.1.5 (fix)
- **gitpod-ubuntu-bun**: 1.1.4 → 1.1.5 (fix)
- **bun-node**: 1.0.3 → 1.0.4 (fix)
- **bun**: 1.0.3 → 1.0.4 (fix)
- **ubuntu-bun-node**: 1.0.3 → 1.0.4 (fix)
- **ubuntu-bun**: 1.0.3 → 1.0.4 (fix)

## Bug Fixes

- fix: update advanced-git-sync action version and improve SSH startup script in gitpod Dockerfiles
  (6b33e3f)
- fix: update Dockerfiles to include SSH server and configure settings for improved access (ea95c30)

## [1.1.4] - 2025-09-17

## Container Updates

- **bun**: 1.0.2 → 1.0.3 (fix)
- **bun-node**: 1.0.2 → 1.0.3 (fix)
- **ubuntu-bun**: 1.0.2 → 1.0.3 (fix)
- **ubuntu-bun-node**: 1.0.2 → 1.0.3 (fix)
- **gitpod-bun**: 1.1.3 → 1.1.4 (fix)
- **gitpod-bun-node**: 1.1.3 → 1.1.4 (fix)
- **gitpod-ubuntu-bun**: 1.1.3 → 1.1.4 (fix)
- **gitpod-ubuntu-bun-node**: 1.1.3 → 1.1.4 (fix)

## Bug Fixes

- fix: update base images for ubuntu-bun,ubuntu-bun-node,gitpod-ubuntu-bun,gitpod-ubuntu-bun-node
  (9296340)

## [1.1.3] - 2025-09-16

## Container Updates

- **bun**: 1.0.1 → 1.0.2 (fix)
- **bun-node**: 1.0.1 → 1.0.2 (fix)
- **ubuntu-bun**: 1.0.1 → 1.0.2 (fix)
- **ubuntu-bun-node**: 1.0.1 → 1.0.2 (fix)
- **gitpod-bun**: 1.1.2 → 1.1.3 (fix)
- **gitpod-bun-node**: 1.1.2 → 1.1.3 (fix)
- **gitpod-ubuntu-bun**: 1.1.2 → 1.1.3 (fix)
- **gitpod-ubuntu-bun-node**: 1.1.2 → 1.1.3 (fix)

## Bug Fixes

- fix: add remote pull before pushing documentation changes and tags to avoid conflicts (b0e3d4c)

## [1.1.2] - 2025-09-16

## Container Updates

- **bun**: 1.0.0 → 1.0.1 (fix)
- **bun-node**: 1.0.0 → 1.0.1 (fix)
- **ubuntu-bun**: 1.0.0 → 1.0.1 (fix)
- **ubuntu-bun-node**: 1.0.0 → 1.0.1 (fix)
- **gitpod-bun**: 1.1.1 → 1.1.2 (fix)
- **gitpod-bun-node**: 1.1.1 → 1.1.2 (fix)
- **gitpod-ubuntu-bun**: 1.1.1 → 1.1.2 (fix)
- **gitpod-ubuntu-bun-node**: 1.1.1 → 1.1.2 (fix)

## Bug Fixes

- fix: update base images for ubuntu-bun,ubuntu-bun-node,gitpod-ubuntu-bun,gitpod-ubuntu-bun-node
  (a717021)

## [1.1.1] - 2025-09-15

## Container Updates

- **bun**: 0.0.0 → 1.0.0 (fix)
- **bun-node**: 0.0.0 → 1.0.0 (fix)
- **ubuntu-bun**: 0.0.0 → 1.0.0 (fix)
- **ubuntu-bun-node**: 0.0.0 → 1.0.0 (fix)
- **gitpod-bun**: 1.1.0 → 1.1.1 (fix)
- **gitpod-bun-node**: 1.1.0 → 1.1.1 (fix)
- **gitpod-ubuntu-bun**: 1.1.0 → 1.1.1 (fix)
- **gitpod-ubuntu-bun-node**: 1.1.0 → 1.1.1 (fix)

## Bug Fixes

- fix: update base images for bun,bun-node,gitpod-bun,gitpod-bun-node (65d85bb)

## [1.1.0] - 2025-09-06

## Container Updates

- **gitpod-bun-node**: 1.0.0 → 1.1.0 (feat)
- **gitpod-bun**: 1.0.0 → 1.1.0 (feat)
- **gitpod-ubuntu-bun-node**: 1.0.0 → 1.1.0 (feat)
- **gitpod-ubuntu-bun**: 1.0.0 → 1.1.0 (feat)

## Features

- feat: Add Gitpod-specific DevContainer images for Bun and Node.js (3a7c300)

## [2.0.0] - 2025-08-28

## Container Updates

- **bun**: 1.0.0 → 2.0.0 (feat (breaking))
- **bun-node**: 1.0.0 → 2.0.0 (feat (breaking))
- **ubuntu-bun**: 1.0.0 → 2.0.0 (feat (breaking))
- **ubuntu-bun-node**: 1.0.0 → 2.0.0 (feat (breaking))

## Features

- feat: Implement release orchestration and version management scripts (41016db)
- feat!: Implement centralized registry client for Docker Hub, GHCR, and GitLab (0b833d5)
- feat: let's start over, shall we? update release workflows to prevent redundant triggers and
  enhance sync operations (5aba3ef)

## Bug Fixes

- fix: Enhance base image check and release workflows (02baa52)
- fix: update base images for bun, bun-node (f19798f)
- fix: update base images for bun, bun-node (55537b6)
- fix: update base images for ubuntu-bun, ubuntu-bun-node (6cfd75e)
- fix: update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node (ab3155f)
- fix: update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node (5bb948e)
- fix: update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node (0b5bffa)
- fix: update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node (2bf890e)
- fix: update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node (e375dd4)
- fix: update base images for bun, bun-node (abe2d81)
- fix: update image sizes in documentation and streamline action configurations (3f29d11)
- fix: update documentation commit message and streamline push process for versioning (5a90d62)
- fix: update README and action configurations to include Docker Hub support and streamline
  container registry authentication (3163fbb)
- fix: streamline Docker image build process by combining build and push steps for GitHub and GitLab
  registries (0b8c065)
- fix: update GitHub Actions for documentation updates and remove GitLab integration (ba02651)
- fix: update README files with new image sizes and enhance GitHub Actions for documentation updates
  (f47e47b)
- fix: update sync configuration and enhance release workflow steps (687909c)
- fix: implement image size updater script and update README files with new sizes (e6c2811)
- fix: update advanced-git-sync action version to v1.1.5 in sync workflow (18dda27)
- fix: update GitHub Actions workflow and dependencies; upgrade checkout action and sync action
  version. Uprade bun to v1.1.38 (10bc7cd)

## Other Changes

- chore(release): 1.1.4 [skip ci] (fc9ab4d)
- chore(release): 1.1.3 [skip ci] (efd4322)
- chore: enhance logging functionality and add silent mode support (18fefed)
- chore: bump OpenSaucedHub/advanced-git-sync in the github-actions group (#32) (b2e4933)
- chore(release): 1.1.2 [skip ci] (14dcf85)
- chore(release): 1.1.2 [skip ci] (d9ab672)
- chore: update advanced-git-sync action to version 1.4.2 (8908b95)
- chore: update setup actions to use Bun and upgrade advanced-git-sync version (67dee93)
- chore: improve pre-release check and version prediction scripts for better workflow integration
  (44920b5)
- chore: enhance release workflow with pre-release checks and version prediction (6217251)
- Release 1.1.2 [skip ci] (fd9ceca)
- Release 1.1.2 [skip ci] (58779bc)
- Release 1.1.2 [skip ci] (6454123)
- Release 1.1.2 [skip ci] (4e439b1)
- Release 1.1.2 [skip ci] (10bfd3c)
- chore: enable token persistence for checkout and improve git push handling (e39c2f9)
- Release 1.1.2 [skip ci] (d9ef26f)
- Release 1.1.2 [skip ci] (ebd0db8)
- chore: bump actions/checkout (#28) (3dcb12d)
- chore: update versions and sizes for release 1.1.2 [skip-sync] (cfa1d84)
- chore: update versions and sizes for release 1.1.2 [skip-sync] (608fdbb)
- chore: update versions and sizes for release 1.1.2 [skip-sync] (20ec840)
- chore: update versions and sizes for release 1.1.1 [skip-sync] (2ff0898)
- chore: update versions and sizes for release 1.1.1 [skip-sync] (2ba6fdd)
- chore: update versions and sizes for release 1.1.1 [skip-sync] (b17f58b)
- Release 1.1.1 [skip ci] (367a195)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (584a5af)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (860a358)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (925f1cc)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (6cabd5f)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (6e9e897)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (09c96ad)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (f4ec70a)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (4e575ce)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (f2142c6)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (e882991)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (1fc368a)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (8a63d41)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (c4de125)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (0728fcc)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (3f877b5)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (3a5687f)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (f9a043a)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (8efdb63)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (cf479f3)
- chore: migrate from versions.json to VERSIONS.md for version management (1767e05)
- chore: update workflows to trigger release with reason input and log trigger details (1d29a02)
- chore: update sync configuration and GitHub Actions workflow for improved syncing and permissions
  (7d621a6)
- chore: update Docker update schedule to daily and upgrade sync action version (445ac4d)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (e52540f)
- chore: update versions and sizes for release 1.1.0 [skip-sync] (a3822ca)
- Release 1.1.0 [skip ci] (98bc36f)
- ✨ feat: fix GitHub Actions token issues and optimize version management (a2be3a8)
- Release 1.0.4 [skip ci] (f5cd167)
- chore(deps-dev): bump @types/node from 22.16.5 to 24.1.0 (#22) (9609880)
- Merge pull request #18 from
  iamvikshan/dependabot/npm_and_yarn/conventional-changelog-conventionalcommits-9.1.0 (8570805)
- Release 1.0.3 [skip ci] (f700fbe)
- Release 1.0.3 [skip ci] (2df4456)
- Release 1.0.2 [skip ci] (6325b60)
- Release 1.0.1 [skip ci] (3441835)
- Release 1.0.0 [skip ci] (ac0d4e4)
- Release 1.0.0 [skip ci] (56ecffd)
- Update and rename gl-sync.yml to sync.yml (4c40196)
- Update gl-sync.yml (8b8267b)
- chore: update GitHub Actions workflows and sync configuration; enhance release process and improve
  README badges (8ad8372)
- Release 1.0.0 [skip ci] (b1d0dc1)
- chore: update CLA workflow to use consistent GitHub token; refine release workflow triggers and
  update changelog (e4ab6ad)
- Release 1.0.0 [skip ci] (89fcea2)
- Release 1.0.0 [skip ci] (4b88988)
- chore: update container images and README with accurate sizes; adjust GitHub Actions for token
  consistency (e078146)
- Release 1.0.0 [skip ci] (7166661)

## [1.1.4](https://github.com/iamvikshan/devcontainers/compare/v1.1.3...v1.1.4) (2025-08-27)

### Bug Fixes

- update base images for bun, bun-node
  ([f19798f](https://github.com/iamvikshan/devcontainers/commit/f19798f5d05e6e0598dc815ab0fec2b6f9184cd6))

# [v1.1.3](https://github.com/iamvikshan/devcontainers/compare/v1.1.2...v1.1.3) (2025-08-26)

## [1.1.3](https://github.com/iamvikshan/devcontainers/compare/v1.1.2...v1.1.3) (2025-08-26)

### Bug Fixes

- update base images for bun, bun-node
  ([55537b6](https://github.com/iamvikshan/devcontainers/commit/55537b6fac2452ae47ba98432f27529e0f40bf7c))

# [v1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-21)

## [1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-21)

### Bug Fixes

- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([ab3155f](https://github.com/iamvikshan/devcontainers/commit/ab3155f0535cba2de5ebbed2f44202a43e5f6860))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([5bb948e](https://github.com/iamvikshan/devcontainers/commit/5bb948e4d7b7eebb6478c767d1cd572df45cd9b9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([0b5bffa](https://github.com/iamvikshan/devcontainers/commit/0b5bfface37eabb52a922325da6a5588b689105e))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([2bf890e](https://github.com/iamvikshan/devcontainers/commit/2bf890e0c37c4dd0790e59020b96f41a6bb59ef9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([e375dd4](https://github.com/iamvikshan/devcontainers/commit/e375dd4dc9a03a7345f0983e7a1d91943d59ffb1))
- update base images for ubuntu-bun, ubuntu-bun-node
  ([6cfd75e](https://github.com/iamvikshan/devcontainers/commit/6cfd75eceb562156e6635e37ebc2907763cc826c))

# [v1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-21)

## [1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-21)

### Bug Fixes

- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([ab3155f](https://github.com/iamvikshan/devcontainers/commit/ab3155f0535cba2de5ebbed2f44202a43e5f6860))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([5bb948e](https://github.com/iamvikshan/devcontainers/commit/5bb948e4d7b7eebb6478c767d1cd572df45cd9b9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([0b5bffa](https://github.com/iamvikshan/devcontainers/commit/0b5bfface37eabb52a922325da6a5588b689105e))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([2bf890e](https://github.com/iamvikshan/devcontainers/commit/2bf890e0c37c4dd0790e59020b96f41a6bb59ef9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([e375dd4](https://github.com/iamvikshan/devcontainers/commit/e375dd4dc9a03a7345f0983e7a1d91943d59ffb1))
- update base images for ubuntu-bun, ubuntu-bun-node
  ([6cfd75e](https://github.com/iamvikshan/devcontainers/commit/6cfd75eceb562156e6635e37ebc2907763cc826c))

# [v1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-18)

## [1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-18)

### Bug Fixes

- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([ab3155f](https://github.com/iamvikshan/devcontainers/commit/ab3155f0535cba2de5ebbed2f44202a43e5f6860))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([5bb948e](https://github.com/iamvikshan/devcontainers/commit/5bb948e4d7b7eebb6478c767d1cd572df45cd9b9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([0b5bffa](https://github.com/iamvikshan/devcontainers/commit/0b5bfface37eabb52a922325da6a5588b689105e))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([2bf890e](https://github.com/iamvikshan/devcontainers/commit/2bf890e0c37c4dd0790e59020b96f41a6bb59ef9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([e375dd4](https://github.com/iamvikshan/devcontainers/commit/e375dd4dc9a03a7345f0983e7a1d91943d59ffb1))
- update base images for ubuntu-bun, ubuntu-bun-node
  ([6cfd75e](https://github.com/iamvikshan/devcontainers/commit/6cfd75eceb562156e6635e37ebc2907763cc826c))

# [v1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-17)

## [1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-17)

### Bug Fixes

- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([ab3155f](https://github.com/iamvikshan/devcontainers/commit/ab3155f0535cba2de5ebbed2f44202a43e5f6860))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([5bb948e](https://github.com/iamvikshan/devcontainers/commit/5bb948e4d7b7eebb6478c767d1cd572df45cd9b9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([0b5bffa](https://github.com/iamvikshan/devcontainers/commit/0b5bfface37eabb52a922325da6a5588b689105e))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([2bf890e](https://github.com/iamvikshan/devcontainers/commit/2bf890e0c37c4dd0790e59020b96f41a6bb59ef9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([e375dd4](https://github.com/iamvikshan/devcontainers/commit/e375dd4dc9a03a7345f0983e7a1d91943d59ffb1))

# [v1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-17)

## [1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-17)

### Bug Fixes

- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([5bb948e](https://github.com/iamvikshan/devcontainers/commit/5bb948e4d7b7eebb6478c767d1cd572df45cd9b9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([0b5bffa](https://github.com/iamvikshan/devcontainers/commit/0b5bfface37eabb52a922325da6a5588b689105e))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([2bf890e](https://github.com/iamvikshan/devcontainers/commit/2bf890e0c37c4dd0790e59020b96f41a6bb59ef9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([e375dd4](https://github.com/iamvikshan/devcontainers/commit/e375dd4dc9a03a7345f0983e7a1d91943d59ffb1))

# [v1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-16)

## [1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-16)

### Bug Fixes

- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([5bb948e](https://github.com/iamvikshan/devcontainers/commit/5bb948e4d7b7eebb6478c767d1cd572df45cd9b9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([0b5bffa](https://github.com/iamvikshan/devcontainers/commit/0b5bfface37eabb52a922325da6a5588b689105e))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([2bf890e](https://github.com/iamvikshan/devcontainers/commit/2bf890e0c37c4dd0790e59020b96f41a6bb59ef9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([e375dd4](https://github.com/iamvikshan/devcontainers/commit/e375dd4dc9a03a7345f0983e7a1d91943d59ffb1))

# [v1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-15)

## [1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-15)

### Bug Fixes

- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([0b5bffa](https://github.com/iamvikshan/devcontainers/commit/0b5bfface37eabb52a922325da6a5588b689105e))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([2bf890e](https://github.com/iamvikshan/devcontainers/commit/2bf890e0c37c4dd0790e59020b96f41a6bb59ef9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([e375dd4](https://github.com/iamvikshan/devcontainers/commit/e375dd4dc9a03a7345f0983e7a1d91943d59ffb1))

# [v1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-15)

## [1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-15)

### Bug Fixes

- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([0b5bffa](https://github.com/iamvikshan/devcontainers/commit/0b5bfface37eabb52a922325da6a5588b689105e))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([2bf890e](https://github.com/iamvikshan/devcontainers/commit/2bf890e0c37c4dd0790e59020b96f41a6bb59ef9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([e375dd4](https://github.com/iamvikshan/devcontainers/commit/e375dd4dc9a03a7345f0983e7a1d91943d59ffb1))

# [v1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-14)

## [1.1.2](https://github.com/iamvikshan/devcontainers/compare/v1.1.1...v1.1.2) (2025-08-14)

### Bug Fixes

- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([2bf890e](https://github.com/iamvikshan/devcontainers/commit/2bf890e0c37c4dd0790e59020b96f41a6bb59ef9))
- update base images for bun, bun-node, ubuntu-bun, ubuntu-bun-node
  ([e375dd4](https://github.com/iamvikshan/devcontainers/commit/e375dd4dc9a03a7345f0983e7a1d91943d59ffb1))

# [v1.1.1](https://github.com/iamvikshan/devcontainers/compare/v1.1.0...v1.1.1) (2025-08-11)

## [1.1.1](https://github.com/iamvikshan/devcontainers/compare/v1.1.0...v1.1.1) (2025-08-11)

### Bug Fixes

- update base images for bun, bun-node
  ([abe2d81](https://github.com/iamvikshan/devcontainers/commit/abe2d81c7133c98d5fb4e74617c97d7ef0b1fdfb))

# [v1.1.0](https://github.com/iamvikshan/devcontainers/compare/v1.0.4...v1.1.0) (2025-08-01)

## ✨ New Features

- [`a2be3a8`](https://github.com/iamvikshan/devcontainers/commit/a2be3a8) feat: fix GitHub Actions
  token issues and optimize version management

## [1.1.0](https://github.com/iamvikshan/devcontainers/compare/v1.0.4...v1.1.0) (2025-08-01)

### ⚠ BREAKING CHANGES

- Implement centralized registry client for Docker Hub, GHCR, and GitLab

### Features

- Implement centralized registry client for Docker Hub, GHCR, and GitLab
  ([0b833d5](https://github.com/iamvikshan/devcontainers/commit/0b833d594b9d918e5c937435309dda95f01637b9))

# [v1.0.4](https://github.com/iamvikshan/devcontainers/compare/v1.0.3...v1.0.4) (2025-07-30)

## [1.0.4](https://github.com/iamvikshan/devcontainers/compare/v1.0.3...v1.0.4) (2025-07-30)

### Bug Fixes

- update image sizes in documentation and streamline action configurations
  ([3f29d11](https://github.com/iamvikshan/devcontainers/commit/3f29d1164dfc89f350841c4f521a335f6288b2a7))

# [v1.0.3](https://github.com/iamvikshan/devcontainers/compare/v1.0.2...v1.0.3) (2024-12-08)

## [1.0.3](https://github.com/iamvikshan/devcontainers/compare/v1.0.2...v1.0.3) (2024-12-08)

### Bug Fixes

- streamline Docker image build process by combining build and push steps for GitHub and GitLab
  registries
  ([0b8c065](https://github.com/iamvikshan/devcontainers/commit/0b8c065ecb196182bd4ae218118bce00ba0b3795))
- update documentation commit message and streamline push process for versioning
  ([5a90d62](https://github.com/iamvikshan/devcontainers/commit/5a90d6274c75a7669a0d26155e9fa24172960a08))
- update README and action configurations to include Docker Hub support and streamline container
  registry authentication
  ([3163fbb](https://github.com/iamvikshan/devcontainers/commit/3163fbb4edb1d5820e82c9979789a253bc234fe8))

# [v1.0.3](https://github.com/iamvikshan/devcontainers/compare/v1.0.2...v1.0.3) (2024-12-08)

## [1.0.3](https://github.com/iamvikshan/devcontainers/compare/v1.0.2...v1.0.3) (2024-12-08)

### Bug Fixes

- streamline Docker image build process by combining build and push steps for GitHub and GitLab
  registries
  ([0b8c065](https://github.com/iamvikshan/devcontainers/commit/0b8c065ecb196182bd4ae218118bce00ba0b3795))

# [v1.0.2](https://github.com/iamvikshan/devcontainers/compare/v1.0.1...v1.0.2) (2024-12-08)

## [1.0.2](https://github.com/iamvikshan/devcontainers/compare/v1.0.1...v1.0.2) (2024-12-08)

### Bug Fixes

- update GitHub Actions for documentation updates and remove GitLab integration
  ([ba02651](https://github.com/iamvikshan/devcontainers/commit/ba02651bb04073c502f168449fb93c4d3c319fab))

# [v1.0.1](https://github.com/iamvikshan/devcontainers/compare/v1.0.0...v1.0.1) (2024-12-07)

## [1.0.1](https://github.com/iamvikshan/devcontainers/compare/v1.0.0...v1.0.1) (2024-12-07)

### Bug Fixes

- update README files with new image sizes and enhance GitHub Actions for documentation updates
  ([f47e47b](https://github.com/iamvikshan/devcontainers/commit/f47e47b31b5059a4a3015675e876a7010eeec0ac))

# v1.0.0 (2024-12-07)

## 1.0.0 (2024-12-07)

### Features

- let's start over, shall we? update release workflows to prevent redundant triggers and enhance
  sync operations
  ([5aba3ef](https://github.com/iamvikshan/devcontainers/commit/5aba3ef22af4f11d7767f4c6de4876ad3c50d147))

* DevContainer configurations for Bun and Node.js, including package management and CI workflows
* sync operations
* Remove default Gitpod bun, all now use oven/bun image. Added setup.sh.
* Remove unnecessary release scopes from semantic-release configuration
* Update configuration files and add Prettier support
* Update semantic-release configuration and add new plugins for improved versioning and release
  notes

### Bug Fixes

- implement image size updater script and update README files with new sizes
  ([e6c2811](https://github.com/iamvikshan/devcontainers/commit/e6c2811ff805e7677f67cd99144e5ff6d1a81238))
- update advanced-git-sync action version to v1.1.5 in sync workflow
  ([18dda27](https://github.com/iamvikshan/devcontainers/commit/18dda275ce6dcc8d42ecfef0e62510ad056c0fc5))
- update GitHub Actions workflow and dependencies; upgrade checkout action and sync action version.
  Uprade bun to v1.1.38
  ([10bc7cd](https://github.com/iamvikshan/devcontainers/commit/10bc7cda116360c530b2d9a5a20d74a5d5983120))
- update sync configuration and enhance release workflow steps
  ([687909c](https://github.com/iamvikshan/devcontainers/commit/687909cbbfc24578ee1f5c75ba3e0eab8427e764))

* Add GitLab plugin to semantic-release configuration and streamline CI environment handling
* Add Husky pre-commit hook and update README with image sizes
* Change default username to root in Dockerfiles for bun and ubuntu environments
* enhance branch syncing by checking for updates before pushing to GitLab and GitHub to avoid
* infinite loop
* Enhance GitLab release configuration with buildx setup and improved error handling
* enhance GitLab sync and release workflows with tag existence check and README updates
* Enhance semantic-release configuration and improve error handling in GitLab release process
* preinstall curl and open-ssh
* Refactor GitLab release configuration for improved versioning and error handling
* remove GH_TOKEN from environment setup and clean up unused GHCR visibility functions
* Remove Husky pre-commit hook and update image size handling in README
* Remove outdated GitLab sync workflows and update GitHub sync configuration
* Remove package-lock.json from .gitignore
* Replace git-sync.yml with gitlab-sync.yml for improved synchronization with GitLab
* Update DevContainer Dockerfile to use Gitpod base image and streamline environment setup
* Update Dockerfiles to install OpenSSH client and curl, and configure SSH server for TCP forwarding
* Update GitHub sync configuration and enhance semantic-release setup
* update GitHub/Gitlab sync workflow and update image size handling in release workflows
* update GitLab API endpoint and correct image sizes in README files
* Update GitLab release configuration for buildx setup and disable TLS
* update GitLab sync workflow to include GITLAB_TOKEN and enhance size retrieval for images
* update username and split long action workflow
