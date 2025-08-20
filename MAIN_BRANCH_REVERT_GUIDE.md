# Main Branch Revert Guide

## Problem Description

You want to revert your main branch to a specific commit, but the commit appears to be "orphaned" or not belonging to any branch. This typically happens when:

1. The repository history was rewritten (rebased, squashed, etc.)
2. Commits were made directly to detached HEAD
3. Branches were force-pushed with different history

## Current Situation Analysis

Based on the repository analysis:

- **Remote main branch** exists at commit: `719a525424a695c1931b72a55a7197fa177e6707`
- **Current HEAD** (remote): `719a525424a695c1931b72a55a7197fa177e6707`
- **Status**: The commit is marked as "grafted" indicating history manipulation
- **Local state**: Currently on copilot branch with additional commits

## Solution Options

### Option 1: Quick Revert Using the Script

Use the provided `revert_main_branch.sh` script for a guided revert:

```bash
# Check current status
./revert_main_branch.sh --status

# Show recent commits to identify target
./revert_main_branch.sh --commits

# Revert main to specific commit (example with current main)
./revert_main_branch.sh 719a525424a695c1931b72a55a7197fa177e6707

# Or revert to a different commit if that's not the target
./revert_main_branch.sh <your_target_commit>
```

### Option 2: Manual Git Commands

If you prefer manual control:

```bash
# 1. Switch to main branch (create if needed)
git checkout main || git checkout -b main

# 2. Create a backup branch first
git branch backup-main-$(date +%Y%m%d-%H%M%S)

# 3. Hard reset to target commit
git reset --hard <target_commit_hash>

# 4. Force push to remote (CAREFUL: This overwrites history!)
git push --force-with-lease origin main
```

### Option 3: Safe History-Preserving Revert

If you want to preserve history instead of rewriting it:

```bash
# 1. Switch to main branch
git checkout main

# 2. Create revert commits for unwanted changes
git revert <commit_range>

# 3. Push normally (no force needed)
git push origin main
```

## Important Notes

⚠️ **Before You Proceed:**

1. **Create backups** - The script automatically creates backup branches
2. **Coordinate with team** - Force pushes affect all team members
3. **Check dependencies** - Ensure no CI/CD or other systems depend on current commits

⚠️ **Force Push Warning:**

Using `git reset --hard` followed by `git push --force` will:
- **Permanently delete** commits from the main branch
- **Affect all team members** who have the repository cloned
- **Potentially break** any systems that reference the deleted commits

## Recovery Options

If something goes wrong:

1. **Use backup branches** created by the script
2. **Check git reflog** for recent operations: `git reflog`
3. **Restore from remote** if you haven't pushed yet

## Commit Hash Reference

From the repository analysis, here are the relevant commits:

- **Current remote main**: `719a525424a695c1931b72a55a7197fa177e6707` (Release 1.1.2)
- **Current copilot HEAD**: `3dfca62e78891ffed0ef9475e813b600d1a0c079` (Initial plan)

## Next Steps

1. **Identify the exact commit** you want to revert to
2. **Run the analysis script** to confirm current state
3. **Execute the revert** using your preferred method
4. **Verify the result** and update your team

## Need Help?

If you're unsure about any step:
1. Run `./revert_main_branch.sh --help` for detailed options
2. Use `git log --oneline --graph` to visualize commit history
3. Test the operation on a fork or branch first