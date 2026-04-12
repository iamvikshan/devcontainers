if [[ -z "${USER}" ]]; then
  export USER="$(whoami)"
fi

if [[ "${PATH}" != *"$HOME/.local/bin"* ]]; then
  export PATH="${PATH}:$HOME/.local/bin"
fi

if [[ -t 1 && ("${TERM_PROGRAM}" == 'vscode' || "${TERM_PROGRAM}" == 'codespaces') && ! -f "$HOME/.config/vscode-dev-containers/first-run-notice-already-displayed" ]]; then
  if [[ -f '/usr/local/etc/vscode-dev-containers/first-run-notice.txt' ]]; then
    cat '/usr/local/etc/vscode-dev-containers/first-run-notice.txt'
  elif [[ -f '/workspaces/.codespaces/shared/first-run-notice.txt' ]]; then
    cat '/workspaces/.codespaces/shared/first-run-notice.txt'
  fi
  mkdir -p "$HOME/.config/vscode-dev-containers"
  (sleep 10s; touch "$HOME/.config/vscode-dev-containers/first-run-notice-already-displayed") &!
fi

if [[ -z "$(git config --get core.editor)" && -z "${GIT_EDITOR}" ]]; then
  if [[ "${TERM_PROGRAM}" == 'vscode' ]]; then
    if [[ -n "$(command -v code-insiders)" && -z "$(command -v code)" ]]; then
      export GIT_EDITOR='code-insiders --wait'
    else
      export GIT_EDITOR='code --wait'
    fi
  fi
fi

export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME=""
plugins=(git bun zsh-autosuggestions zsh-syntax-highlighting)
source $ZSH/oh-my-zsh.sh

setopt PROMPT_SUBST

__git_info() {
    if [[ "$(git config --get devcontainers-theme.hide-status 2>/dev/null)" == "1" ]] || [[ "$(git config --get codespaces-theme.hide-status 2>/dev/null)" == "1" ]]; then
        return
    fi
    local branch
    branch=$(git --no-optional-locks symbolic-ref --short HEAD 2>/dev/null || git --no-optional-locks rev-parse --short HEAD 2>/dev/null)
    if [[ -n "${branch}" ]]; then
        local dirty_flag=""
        if [[ "$(git config --get devcontainers-theme.show-dirty 2>/dev/null)" == "1" ]]; then
            if git --no-optional-locks ls-files --error-unmatch -m --directory --no-empty-directory -o --exclude-standard ":/*" > /dev/null 2>&1; then
                dirty_flag=" %F{yellow}✗"
            fi
        fi
        echo "%F{cyan}(%F{red}${branch}${dirty_flag}%F{cyan}) "
    fi
}

PROMPT='%(?.%F{green}.%F{red})➜%f %F{green}${GITHUB_USER:-%n}%f %F{blue}%4~%f $(__git_info)%f$ '

if [[ "$TERM" == "xterm" || "$TERM" == "xterm-256color" || "$TERM_PROGRAM" == "vscode" ]]; then
    preexec() { print -Pn "\e]0;%n@%m: $1\a" }
    precmd() { print -Pn "\e]0;%n@%m: zsh\a" }
fi