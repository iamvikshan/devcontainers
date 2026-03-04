## Plan: Set Up ESLint & Fix Type Errors

Set up ESLint v10 flat config and tsconfig.json for the project, then fix all existing TypeScript
type errors (primarily unsafe `catch` blocks) so `bun check` passes cleanly.

**Phase Count Rationale:**

- Phase 1 creates configs so we can see real errors from `tsc --noEmit` and `eslint`
- Phase 2 fixes all discovered type errors
- Two phases needed because actual error list depends on config strictness

**Phases: 2**

1. **✅ Phase 1: Create tsconfig.json and eslint.config.js**
   - **Objective:** Add both config files + install deps so `bun check` can run
   - **Files/Functions to Modify/Create:**
     - `tsconfig.json` — strict, ESNext/NodeNext, include scripts/\*_/_.ts
     - `eslint.config.js` — ESLint v10 flat config with typescript-eslint
   - **Tests to Write:** N/A (config files)
   - **Steps:**
     1. Install typescript-eslint and @eslint/js
     2. Create tsconfig.json
     3. Create eslint.config.js
     4. Run `bun check` to capture all errors for Phase 2

2. **✅ Phase 2: Fix all TypeScript type errors**
   - **Objective:** Fix all catch blocks and type errors so `bun check` passes cleanly
   - **Files/Functions to Modify:**
     - scripts/issueManager.ts — 6 unsafe catch blocks
     - scripts/registryClient.ts — 5 unsafe catch blocks + 1 empty catch
     - scripts/toolVersionExtractor.ts — 3 unsafe catch blocks
     - scripts/versionManager.ts — 1 empty catch + 3 catch (error: any) blocks
     - scripts/changelogManager.ts — 2 catch (error: any) blocks
     - scripts/imageOperations.ts — 6 catch blocks (may need narrowing)
     - scripts/releaseOrchestrator.ts — 4 catch blocks
     - scripts/changeDetector.ts — 1 catch block
   - **Tests to Write:** N/A (infrastructure scripts)
   - **Steps:**
     1. Fix all unsafe error.message accesses with proper type narrowing
     2. Replace catch (error: any) with catch (error: unknown) + narrowing
     3. Fix any other tsc/eslint errors discovered
     4. Run `bun check` to verify 0 errors

**Open Questions:** None — proceeding with implementation.
