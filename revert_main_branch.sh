#!/bin/bash

# Main Branch Revert Script
# This script helps revert the main branch to a specific commit safely

set -e

echo "🔍 Main Branch Revert Helper"
echo "================================"

# Function to display current repository state
show_current_state() {
    echo "📊 Current Repository State:"
    echo "Current branch: $(git branch --show-current)"
    echo "Current commit: $(git rev-parse HEAD)"
    echo "Current commit message: $(git log --oneline -1)"
    echo ""
}

# Function to show available commits
show_recent_commits() {
    echo "📝 Recent Commits (last 10):"
    git log --oneline --decorate -10
    echo ""
}

# Function to show remote branches
show_remote_info() {
    echo "🌐 Remote Branch Information:"
    echo "Remote main commit: $(git ls-remote origin main | cut -f1)"
    echo "Remote HEAD: $(git ls-remote origin HEAD | cut -f1)"
    echo ""
}

# Function to create backup before revert
create_backup() {
    local backup_branch="backup-main-$(date +%Y%m%d-%H%M%S)"
    echo "💾 Creating backup branch: $backup_branch"
    git branch "$backup_branch"
    echo "✅ Backup created at: $backup_branch"
    echo ""
}

# Function to safely revert main to a specific commit
revert_main_to_commit() {
    local target_commit="$1"
    
    if [ -z "$target_commit" ]; then
        echo "❌ Error: No target commit specified"
        return 1
    fi
    
    echo "🎯 Target commit: $target_commit"
    echo "Target commit info: $(git log --oneline -1 "$target_commit" 2>/dev/null || echo 'Commit not found')"
    echo ""
    
    # Verify commit exists
    if ! git rev-parse --verify "$target_commit" >/dev/null 2>&1; then
        echo "❌ Error: Commit $target_commit does not exist"
        return 1
    fi
    
    # Check if we're on main branch
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        echo "⚠️  Warning: Not on main branch (currently on: $current_branch)"
        echo "🔄 Switching to main branch..."
        
        # Try to checkout main, create if it doesn't exist
        if ! git checkout main 2>/dev/null; then
            echo "📝 Creating main branch from current commit..."
            git checkout -b main
        fi
    fi
    
    # Create backup before revert
    create_backup
    
    # Show what will happen
    echo "📋 Revert Plan:"
    echo "   • Current main: $(git rev-parse HEAD)"
    echo "   • Target commit: $target_commit"
    echo "   • Operation: Hard reset to target commit"
    echo ""
    
    read -p "❓ Proceed with revert? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "❌ Revert cancelled"
        return 1
    fi
    
    # Perform the revert
    echo "🔄 Reverting main to $target_commit..."
    git reset --hard "$target_commit"
    
    echo "✅ Main branch reverted successfully!"
    echo "📊 New main state:"
    show_current_state
    
    # Ask about pushing to remote
    echo "🚀 Push changes to remote main?"
    echo "⚠️  WARNING: This will force-push and overwrite remote main history!"
    read -p "❓ Push to remote? (y/N): " push_confirm
    
    if [ "$push_confirm" = "y" ] || [ "$push_confirm" = "Y" ]; then
        echo "📤 Pushing to remote main..."
        git push --force-with-lease origin main
        echo "✅ Remote main updated successfully!"
    else
        echo "ℹ️  Local main reverted. Use 'git push --force-with-lease origin main' to update remote."
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMIT_HASH]"
    echo ""
    echo "Options:"
    echo "  COMMIT_HASH    The commit hash to revert main branch to"
    echo "  --help         Show this help message"
    echo "  --status       Show current repository status"
    echo "  --commits      Show recent commits"
    echo ""
    echo "Examples:"
    echo "  $0 719a525                    # Revert main to specific commit"
    echo "  $0 HEAD~3                     # Revert main to 3 commits ago"
    echo "  $0 --status                   # Show repository status"
    echo ""
}

# Main script logic
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --status|-s)
        show_current_state
        show_remote_info
        exit 0
        ;;
    --commits|-c)
        show_recent_commits
        exit 0
        ;;
    "")
        echo "🔍 Repository Analysis Mode"
        echo ""
        show_current_state
        show_remote_info
        show_recent_commits
        echo ""
        echo "💡 To revert main to a specific commit, run:"
        echo "   $0 <commit_hash>"
        echo ""
        echo "💡 For help, run:"
        echo "   $0 --help"
        exit 0
        ;;
    *)
        revert_main_to_commit "$1"
        ;;
esac