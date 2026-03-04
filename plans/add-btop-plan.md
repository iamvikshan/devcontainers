## Plan: Add btop to DevContainer Images

Add `btop` (a modern resource monitor) to all 4 Docker images and update documentation to list it
alongside the other included tools.

**Phase Count Rationale:**

- Single contained change: adding one package across 4 Dockerfiles + docs
- No architectural risk, no migrations, no unknowns
- All changes are independent and low-risk

**Phases: 1**

1. **✅ Phase 1: Add btop to all images and documentation**
   - **Objective:** Install btop in all 4 Dockerfiles, add version extraction, and update all
     documentation
   - **Files/Functions to Modify/Create:**
     - `images/bun/Dockerfile` — add `btop` to `apk add` + version extraction
     - `images/bun-node/Dockerfile` — add `btop` to `apk add` + version extraction
     - `images/ubuntu-bun/Dockerfile` — add `btop` to `apt-get install` + version extraction
     - `images/ubuntu-bun-node/Dockerfile` — add `btop` to `apt-get install` + version extraction
     - `scripts/toolVersionExtractor.ts` — add btop to manual fallback extraction commands
     - `docs/IMAGE_VARIANTS.md` — add btop to "Included Tools" for all 4 images
     - `README.md` — add btop to "What's Included" section
   - **Tests to Write:** N/A (infrastructure/Dockerfiles, no unit tests applicable)
   - **Steps:**
     1. Add `btop` package to all 4 Dockerfiles' install commands
     2. Add `btop_version` extraction to tool-versions.txt blocks in each Dockerfile
     3. Update `toolVersionExtractor.ts` manual fallback to include btop
     4. Update `IMAGE_VARIANTS.md` included tools lists for all 4 image sections
     5. Update `README.md` "What's Included" section to mention btop

**Open Questions:**

1. btop version output format — will use `btop --version | head -n1` for safe extraction
