# syntax=docker/dockerfile:1
ARG VARIANT=alpine
FROM oven/bun:${VARIANT}

ARG VARIANT
ARG USERNAME=root

# 1. Install packages, global NPM tools, generate versions, and install Antigravity
RUN --mount=type=cache,target=/var/cache/apk \
    --mount=type=cache,target=/root/.npm \
    apk add --no-cache \
    zsh git sudo curl jq python3 btop tree tmux bash nodejs npm \
    && npm install -g eslint \
    && mkdir -p /usr/local/share \
    && { \
        echo "# DevContainer Tool Versions"; \
        echo "build_date=$(date -u +%Y-%m-%dT%H:%M:%SZ)"; \
        echo "base_image=oven/bun:${VARIANT}"; \
        echo "bun_version=$(bun --version)"; \
        echo "zsh_version=$(zsh --version | cut -d' ' -f2)"; \
        echo "node_version=$(node --version)"; \
        echo "npm_version=$(npm --version)"; \
        echo "eslint_version=$(eslint --version)"; \
        echo "alpine_version=$(cat /etc/alpine-release)"; \
        echo "git_version=$(git --version | cut -d' ' -f3)"; \
        echo "curl_version=$(curl --version | head -n1 | cut -d' ' -f2)"; \
        echo "jq_version=$(jq --version | cut -d'-' -f2)"; \
        echo "python_version=$(python3 --version | cut -d' ' -f2)"; \
        echo "btop_version=$(btop --version | head -n1)"; \
        echo "tree_version=$(tree --version | cut -d' ' -f2)"; \
        echo "tmux_version=$(tmux -V | cut -d' ' -f2)"; \
    } > /usr/local/share/tool-versions.txt \
    && curl -fsSL https://antigravity.google/cli/install.sh | bash \
    && mv /root/.local/bin/agy /usr/local/bin/agy \
    && rm -rf /root/.local /root/.cache

# 2. Consolidated User, Remote ZSH configuration, and Tmux setup
RUN if [ "${USERNAME}" != "root" ]; then \
        adduser -D -s /bin/zsh "${USERNAME}" && \
        addgroup "${USERNAME}" wheel && \
        echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers && \
        HOME_DIR="/home/${USERNAME}"; \
    else \
        HOME_DIR="/root"; \
    fi && \
    mkdir -p "${HOME_DIR}" && \
    git clone --depth=1 https://github.com/ohmyzsh/ohmyzsh.git "${HOME_DIR}/.oh-my-zsh" && \
    git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions "${HOME_DIR}/.oh-my-zsh/custom/plugins/zsh-autosuggestions" && \
    git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting "${HOME_DIR}/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting" && \
    curl -fsSL https://raw.githubusercontent.com/iamvikshan/.github/refs/heads/main/scripts/universal.zshrc -o "${HOME_DIR}/.zshrc" && \
    echo 'set-option -g default-shell /bin/zsh' > "${HOME_DIR}/.tmux.conf" && \
    if [ "${USERNAME}" != "root" ]; then \
        chown -R "${USERNAME}:${USERNAME}" "${HOME_DIR}"; \
    fi

USER ${USERNAME}
CMD ["sleep", "infinity"]