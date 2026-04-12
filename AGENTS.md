# AGENTS.md

## Project overview

- Repository purpose: reusable DevContainer image definitions, manifests, and release automation.
- Primary implementation areas:
  - `images/*` for image Dockerfiles and shell bootstrap scripts
  - `.devcontainer/` and `images/*/devcontainer.json` for VS Code container manifests
  - `scripts/*.ts` for release/version automation
  - `docs/*.md` and `README.md` for user-facing documentation

## Tooling

- Package manager: `bun` (`bun.lock` present).
- Install deps: `bun install`.
- Typecheck + lint: `bun run check`.
- Format changed files: `bun run f`.

## Code conventions

- TypeScript uses ESM syntax, single quotes, no semicolons, 2-space indentation.
- ESLint targets `scripts/**/*.ts` with `typescript-eslint` recommended config.
- Prettier is authoritative for JSON, Markdown, and shell formatting.
- Prettier defaults: `printWidth: 80`, `singleQuote: true`, `semi: false`, `tabWidth: 2`.
- JSON/YAML overrides use double quotes and `printWidth: 130`.
- Markdown overrides use `printWidth: 100`.
- Shell files use 2-space indentation and LF line endings.

## Container-image conventions

- Each image Dockerfile writes `/usr/local/share/tool-versions.txt` during build.
- When tool availability changes in an image, keep the tool version extraction block accurate.
- Preserve non-root user handling (`USERNAME`) and passwordless sudo behavior where already
  implemented.
- Keep image changes small and avoid reformatting unrelated Dockerfile sections.

## Planning notes for Atlas

- Store Atlas plans under `.atlas/plans/`.
- Existing historical plans under `plans/` are reference material only.
- Before changing image behavior, search for related references such as setup script filenames,
  shell startup files, and devcontainer customizations.
