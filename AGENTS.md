# AGENTS.md

## Project Overview

- **Repository Purpose**: Reusable DevContainer image definitions, manifests, and release automation.
- **Primary Implementation Areas**:
  - `images/*` for image Dockerfiles and shell bootstrap scripts.
  - `.devcontainer/` and `images/*/devcontainer.json` for VS Code container manifests.
  - `.github/actions/notes/update_docs.ts` and GitHub Actions workflows for release/version automation.
  - `docs/*.md` and `README.md` for user-facing documentation.

## Tooling & Runtime Environment

- **Runtime**: `bun` is the primary runtime for scripts and formatting. Node.js is not directly available; use `bun` for package management and script execution.
- **Dependency Management**: Uses Bun (`bun.lock` is present). Dependencies are installed with `bun install`.
- **Linting & Formatting**:
  - `bun run f` to write formatting using `oxfmt --write`.
  - `bun run f:check` to check formatting using `oxfmt --check`.

## Code Conventions

- **TypeScript**: ESM syntax, single quotes, no semicolons, 2-space indentation.
- **Formatting Defaults**: Formatted with `oxfmt` (using `.oxfmtrc.json` as the source of truth). Double quotes are used for JSON/YAML.

## Container-Image Conventions

- **OCI Labels**: Each Dockerfile exposes tool metadata via `devcontainer.tool.*` labels.
- **User Creation & Permissions**:
  - Non-root `USERNAME` must be validated with regex: `echo "${USERNAME}" | grep -Eq '^[a-z_][a-z0-9_-]*[$]?$'`.
  - Sudo configuration must be written to isolated file `/etc/sudoers.d/${USERNAME}` with `chmod 0440`.
  - Sudo configurations must be verified using `visudo -cf "/etc/sudoers.d/${USERNAME}"` during build.
