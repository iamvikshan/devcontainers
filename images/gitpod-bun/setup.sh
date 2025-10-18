#!/bin/bash

# Gitpod-specific Bun setup script
# This script enhances the Gitpod workspace experience with Bun

# Configure default shell to bash (override sh preference)
if [ -z "$SHELL" ] || [ "$SHELL" = "/bin/sh" ]; then
  export SHELL="/bin/bash"
fi

# Ensure Bun is in PATH
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Display enhanced welcome message for Bun in Gitpod
if [ -t 1 ] && [ ! -f "$HOME/.config/gitpod/bun-first-run-notice-displayed" ]; then
  echo "🚀 Gitpod Bun Development Environment"
  echo "   • Bun: $(bun --version)"
  echo "   • Shell: $SHELL (forced to bash for better compatibility)"
  echo "   • Workspace: ${GITPOD_WORKSPACE_URL:-local}"
  echo ""
  echo "💡 Tips:"
  echo "   • Run 'bun init' to create a new project"
  echo "   • Use 'bun install' instead of 'npm install'"
  echo "   • Run scripts with 'bun run <script>'"
  echo ""
  mkdir -p "$HOME/.config/gitpod"
  touch "$HOME/.config/gitpod/bun-first-run-notice-displayed"
fi

# Enhanced shell configuration for better Gitpod experience
if [[ $- == *i* ]]; then
  # Set up bash completion for Bun if available
  if command -v bun > /dev/null 2>&1; then
    # Enable Bun shell completions
    eval "$(bun completions bash 2> /dev/null || true)"
  fi

  # Add some useful aliases for Bun development
  alias bi='bun install'
  alias br='bun run'
  alias bt='bun test'
  alias bd='bun run dev'
  alias bb='bun build'
  alias bx='bunx'
fi
