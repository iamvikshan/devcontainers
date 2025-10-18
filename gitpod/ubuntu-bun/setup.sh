#!/bin/bash

# Gitpod-specific environment setup script
# This script is sourced from .bashrc.d to provide a consistent environment

# Set USER environment variable if not set
if [ -z "${USER}" ]; then
  export USER=$(whoami)
fi

# Update PATH to include common directories
export PATH="$HOME/.local/bin:$PATH"

# Gitpod-specific environment variables
export GITPOD_WORKSPACE_ID="${GITPOD_WORKSPACE_ID:-}"
export GITPOD_WORKSPACE_URL="${GITPOD_WORKSPACE_URL:-}"
export GITPOD_REPO_ROOT="${GITPOD_REPO_ROOT:-/workspace}"

# Configure default shell to bash (override sh preference)
if [ -z "$SHELL" ] || [ "$SHELL" = "/bin/sh" ]; then
  export SHELL="/bin/bash"
fi

# Set the default git editor if not already set
if [ -z "$(git config --get core.editor)" ] && [ -z "${GIT_EDITOR}" ]; then
  if [ "${TERM_PROGRAM}" = "vscode" ]; then
    if [[ -n $(command -v code-insiders) && -z $(command -v code) ]]; then
      export GIT_EDITOR="code-insiders --wait"
    else
      export GIT_EDITOR="code --wait"
    fi
  fi
fi

# Enhanced bash theme optimized for Gitpod
__gitpod_bash_prompt() {
  local userpart='`export XIT=$? \
        && [ ! -z "${GITHUB_USER:-}" ] && echo -n "\[\033[0;32m\]@${GITHUB_USER:-} " || echo -n "\[\033[0;32m\]\u " \
        && [ "$XIT" -ne "0" ] && echo -n "\[\033[1;31m\]➜" || echo -n "\[\033[0m\]➜"`'
  local gitbranch='`\
        if [ "$(git config --get devcontainers-theme.hide-status 2>/dev/null)" != 1 ] && [ "$(git config --get codespaces-theme.hide-status 2>/dev/null)" != 1 ]; then \
            export BRANCH="$(git --no-optional-locks symbolic-ref --short HEAD 2>/dev/null || git --no-optional-locks rev-parse --short HEAD 2>/dev/null)"; \
            if [ "${BRANCH:-}" != "" ]; then \
                echo -n "\[\033[0;36m\](\[\033[1;31m\]${BRANCH:-}" \
                && if [ "$(git config --get devcontainers-theme.show-dirty 2>/dev/null)" = 1 ] && \
                    git --no-optional-locks ls-files --error-unmatch -m --directory --no-empty-directory -o --exclude-standard ":/*" > /dev/null 2>&1; then \
                        echo -n " \[\033[1;33m\]✗"; \
                fi \
                && echo -n "\[\033[0;36m\]) "; \
            fi; \
        fi`'
  local lightblue='\[\033[1;34m\]'
  local removecolor='\[\033[0m\]'
  PS1="${userpart} ${lightblue}\w ${gitbranch}${removecolor}\$ "
  unset -f __gitpod_bash_prompt
}

# Only set custom prompt if in an interactive shell and PS1 is not already customized
if [[ $- == *i* ]] && [[ "${PS1}" == *"\\$"* ]] && [[ ! "${PS1}" == *"➜"* ]]; then
  __gitpod_bash_prompt
fi

# Display Gitpod-specific welcome message if this is the first time
if [ -t 1 ] && [ ! -f "$HOME/.config/gitpod/first-run-notice-displayed" ]; then
  echo "🚀 Welcome to your Gitpod workspace with Bun!"
  echo "   • Bun: $(bun --version)"
  echo "   • Shell: $SHELL"
  echo "   • Working directory: $(pwd)"
  echo ""
  mkdir -p "$HOME/.config/gitpod"
  touch "$HOME/.config/gitpod/first-run-notice-displayed"
fi

# Ensure bash completion is available
if [ -f /usr/share/bash-completion/bash_completion ]; then
  . /usr/share/bash-completion/bash_completion
fi
