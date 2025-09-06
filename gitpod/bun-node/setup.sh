#!/bin/bash

# Gitpod-specific Bun + Node.js setup script
# This script enhances the Gitpod workspace experience with both Bun and Node.js

# Configure default shell to bash (override sh preference)
if [ -z "$SHELL" ] || [ "$SHELL" = "/bin/sh" ]; then
    export SHELL="/bin/bash"
fi

# Ensure NVM is loaded
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
fi
if [ -s "$NVM_DIR/bash_completion" ]; then
    . "$NVM_DIR/bash_completion"
fi

# Ensure Bun is in PATH
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Display enhanced welcome message for Bun + Node.js in Gitpod
if [ -t 1 ] && [ ! -f "$HOME/.config/gitpod/bun-node-first-run-notice-displayed" ]; then
    echo "🚀 Gitpod Bun + Node.js Development Environment"
    echo "   • Bun: $(bun --version)"
    echo "   • Node.js: $(node --version 2>/dev/null || echo 'Not found in PATH')"
    echo "   • npm: $(npm --version 2>/dev/null || echo 'Not found in PATH')"
    echo "   • yarn: $(yarn --version 2>/dev/null || echo 'Not found in PATH')"
    echo "   • pnpm: $(pnpm --version 2>/dev/null || echo 'Not found in PATH')"
    echo "   • Shell: $SHELL (forced to bash for better compatibility)"
    echo "   • Workspace: ${GITPOD_WORKSPACE_URL:-local}"
    echo ""
    echo "💡 Tips:"
    echo "   • Use 'bun install' for faster installs"
    echo "   • Use 'bun run' for faster script execution"
    echo "   • Switch Node versions with 'nvm use <version>'"
    echo "   • Both Bun and Node.js package managers are available"
    echo ""
    mkdir -p "$HOME/.config/gitpod"
    touch "$HOME/.config/gitpod/bun-node-first-run-notice-displayed"
fi

# Enhanced shell configuration for better Gitpod experience
if [[ $- == *i* ]]; then
    # Set up bash completion for Bun if available
    if command -v bun >/dev/null 2>&1; then
        # Enable Bun shell completions
        eval "$(bun completions bash 2>/dev/null || true)"
    fi
    
    # Add some useful aliases for development
    alias bi='bun install'
    alias br='bun run'
    alias bt='bun test'
    alias bd='bun run dev'
    alias bb='bun build'
    alias bx='bunx'
    
    # Node.js aliases
    alias ni='npm install'
    alias nr='npm run'
    alias nt='npm test'
    alias ns='npm start'
    
    # Yarn aliases
    alias yi='yarn install'
    alias yr='yarn run'
    alias yt='yarn test'
    alias ys='yarn start'
    
    # pnpm aliases
    alias pi='pnpm install'
    alias pr='pnpm run'
    alias pt='pnpm test'
    alias ps='pnpm start'
fi
