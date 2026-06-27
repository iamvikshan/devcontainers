# syntax=docker/dockerfile:1
ARG VARIANT=latest
FROM ubuntu:${VARIANT}

ARG VARIANT
ARG USERNAME=root
ARG NPM_GLOBAL=/usr/local/share/npm-global

# Add NPM global to PATH and set noninteractive frontend
ENV PATH=${NPM_GLOBAL}/bin:/usr/local/bun/bin:${PATH}
ENV DEBIAN_FRONTEND=noninteractive

# 1. Consolidated User Creation & Permissions
RUN if [ "${USERNAME}" != "root" ] && ! id -u ${USERNAME} > /dev/null 2>&1; then \
        useradd -m -s /bin/zsh ${USERNAME} \
        && usermod -aG sudo ${USERNAME} \
        && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers; \
    fi

# 2. Multi-stage Bun install (Instant copy, no curl/unzip)
COPY --from=oven/bun:latest /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx

# 3. Packages, Node.js, Global NPM, Antigravity, and Version Tracking
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    --mount=type=cache,target=/root/.npm \
    apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates zsh git sudo curl unzip jq python3 btop tree tmux bash \
    && curl -fsSL https://deb.nodesource.com/setup_current.x | bash - \
    && apt-get install -y nodejs \
    && mkdir -p ${NPM_GLOBAL} \
    && npm config set prefix ${NPM_GLOBAL} \
    && npm install -g eslint \
    && curl -fsSL https://antigravity.google/cli/install.sh | bash \
    && mv /root/.local/bin/agy /usr/local/bin/agy \
    && rm -rf /root/.local \
    && mkdir -p /usr/local/share \
    && { \
        echo "# DevContainer Tool Versions"; \
        echo "build_date=$(date -u +%Y-%m-%dT%H:%M:%SZ)"; \
        echo "base_image=ubuntu:${VARIANT}"; \
        echo "ubuntu_version=$(cat /etc/os-release | grep VERSION_ID | cut -d'=' -f2 | tr -d '\"')"; \
        echo "bun_version=$(bun --version)"; \
        echo "node_version=$(node --version)"; \
        echo "npm_version=$(npm --version)"; \
        echo "eslint_version=$(eslint --version)"; \
        echo "zsh_version=$(zsh --version | cut -d' ' -f2)"; \
        echo "git_version=$(git --version | cut -d' ' -f3)"; \
        echo "curl_version=$(curl --version | head -n1 | cut -d' ' -f2)"; \
        echo "jq_version=$(jq --version | cut -d'-' -f2)"; \
        echo "python_version=$(python3 --version | cut -d' ' -f2)"; \
        echo "btop_version=$(btop --version | head -n1)"; \
        echo "tree_version=$(tree --version | cut -d' ' -f2)"; \
        echo "tmux_version=$(tmux -V | cut -d' ' -f2)"; \
    } > /usr/local/share/tool-versions.txt \
    && grep -Eq '^base_image=ubuntu:[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$' /usr/local/share/tool-versions.txt \
    && grep -Eq '^bun_version=.+$' /usr/local/share/tool-versions.txt \
    && grep -Eq '^node_version=.+$' /usr/local/share/tool-versions.txt \
    && if [ "${USERNAME}" != "root" ]; then chown -R ${USERNAME}:${USERNAME} ${NPM_GLOBAL}; fi \
    && rm -rf /var/lib/apt/lists/*

# 4. Remote ZSH Configuration & Tmux Injection
RUN HOME_DIR=$(if [ "${USERNAME}" = "root" ]; then echo "/root"; else echo "/home/${USERNAME}"; fi) \
    && mkdir -p "${HOME_DIR}" \
    && git clone --depth=1 https://github.com/ohmyzsh/ohmyzsh.git "${HOME_DIR}/.oh-my-zsh" \
    && git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions "${HOME_DIR}/.oh-my-zsh/custom/plugins/zsh-autosuggestions" \
    && git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting "${HOME_DIR}/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting" \
    && curl -fsSL https://raw.githubusercontent.com/iamvikshan/.github/refs/heads/main/scripts/universal.zshrc -o "${HOME_DIR}/.zshrc" \
    && echo 'set-option -g default-shell /bin/zsh' > "${HOME_DIR}/.tmux.conf" \
    && if [ "${USERNAME}" != "root" ]; then chown -R "${USERNAME}:${USERNAME}" "${HOME_DIR}"; fi

USER ${USERNAME}
CMD ["sleep", "infinity"]