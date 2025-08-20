#!/bin/bash

# Find Orphaned Commits Script
# This script helps identify commits that might appear "orphaned" or disconnected

set -e

echo "🔍 Orphaned Commit Finder"
echo "=========================="

# Function to show commits not reachable from any branch
find_orphaned_commits() {
    echo "📝 Checking for potentially orphaned commits..."
    echo ""
    
    # Get all commits reachable from branches
    branch_commits=$(git rev-list --all 2>/dev/null || echo "")
    
    # Get all commits from reflog
    reflog_commits=$(git reflog --all --pretty=format:"%H" 2>/dev/null | sort -u || echo "")
    
    if [ -z "$reflog_commits" ]; then
        echo "ℹ️  No commits found in reflog"
        return
    fi
    
    echo "🌿 Commits reachable from branches:"
    if [ -n "$branch_commits" ]; then
        echo "$branch_commits" | head -10 | while read commit; do
            if [ -n "$commit" ]; then
                echo "   $commit $(git log --oneline -1 "$commit" 2>/dev/null || echo 'Unknown')"
            fi
        done
        echo ""
    else
        echo "   None found"
        echo ""
    fi
    
    echo "📋 All commits from reflog (recent activity):"
    echo "$reflog_commits" | head -10 | while read commit; do
        if [ -n "$commit" ]; then
            # Check if commit is reachable from any branch
            if echo "$branch_commits" | grep -q "$commit" 2>/dev/null; then
                status="✅ on branch"
            else
                status="⚠️  potentially orphaned"
            fi
            echo "   $commit $(git log --oneline -1 "$commit" 2>/dev/null || echo 'Unknown') - $status"
        fi
    done
    echo ""
}

# Function to show detailed commit information
show_commit_details() {
    local commit="$1"
    
    if [ -z "$commit" ]; then
        echo "❌ Error: No commit specified"
        return 1
    fi
    
    echo "🔍 Detailed information for commit: $commit"
    echo "========================================"
    echo ""
    
    # Verify commit exists
    if ! git rev-parse --verify "$commit" >/dev/null 2>&1; then
        echo "❌ Error: Commit $commit does not exist"
        return 1
    fi
    
    # Show commit details
    echo "📝 Commit Information:"
    git log --oneline -1 "$commit"
    echo ""
    
    echo "📊 Full Details:"
    git show --stat "$commit"
    echo ""
    
    # Check which branches contain this commit
    echo "🌿 Branches containing this commit:"
    branches=$(git branch --contains "$commit" 2>/dev/null || echo "")
    if [ -n "$branches" ]; then
        echo "$branches"
    else
        echo "   ⚠️  No branches contain this commit (orphaned)"
    fi
    echo ""
    
    # Check remote branches
    echo "🌐 Remote branches containing this commit:"
    remote_branches=$(git branch -r --contains "$commit" 2>/dev/null || echo "")
    if [ -n "$remote_branches" ]; then
        echo "$remote_branches"
    else
        echo "   ⚠️  No remote branches contain this commit"
    fi
    echo ""
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTIONS] [COMMIT_HASH]"
    echo ""
    echo "Options:"
    echo "  --find-orphaned    Find potentially orphaned commits"
    echo "  --details COMMIT   Show detailed information about a specific commit"
    echo "  --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --find-orphaned              # Find orphaned commits"
    echo "  $0 --details 719a525            # Show details for specific commit"
    echo "  $0 719a525                      # Same as --details"
    echo ""
}

# Main script logic
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --find-orphaned|-f)
        find_orphaned_commits
        exit 0
        ;;
    --details|-d)
        if [ -n "$2" ]; then
            show_commit_details "$2"
        else
            echo "❌ Error: --details requires a commit hash"
            show_help
            exit 1
        fi
        exit 0
        ;;
    "")
        echo "🔍 Orphaned Commit Analysis"
        echo ""
        find_orphaned_commits
        echo ""
        echo "💡 For detailed commit analysis, run:"
        echo "   $0 --details <commit_hash>"
        echo ""
        echo "💡 For help, run:"
        echo "   $0 --help"
        exit 0
        ;;
    *)
        show_commit_details "$1"
        ;;
esac