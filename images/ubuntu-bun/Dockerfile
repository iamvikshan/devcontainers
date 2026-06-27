# syntax=docker/dockerfile:1
ARG VARIANT=latest
FROM ubuntu:${VARIANT}

ARG VARIANT
ARG USERNAME=root
ENV DEBIAN_FRONTEND=noninteractive

# 1. Consolidated User Creation & Permissions
# Merged 4 separate RUN blocks into a single layer to prevent snapshot bloat
RUN if [ "${USERNAME}" != "root" ] && ! id -u ${USERNAME} > /dev/null 2>&1; then \
        useradd -m -s /bin/zsh ${USERNAME} \
        && usermod -aG sudo ${USERNAME} \
        && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers; \
    fi

# 2. Install Packages (with BuildKit Cache)
# Added tree and tmux to the baseline requirements
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates zsh git sudo curl unzip jq python3 btop tree tmux \
    && rm -rf /var/lib/apt/lists/*

# 3. Multi-stage Bun install & The Node Checkmate
# Bypasses curl/unzip entirely and ensures strict Bun enforcement
COPY --from=oven/bun:latest /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx \
    && ln -s /usr/local/bin/bun /usr/local/bin/node

# 4. Antigravity CLI & Tool Versions Tracker
# Replaced subshells with direct echoing for speed, and dropped the lsb_release 
# dependency since /etc/os-release is universally available in Ubuntu images.
RUN curl -fsSL https://antigravity.google/cli/install.sh | bash \
    && mv /root/.local/bin/agy /usr/local/bin/agy \
    && rm -rf /root/.local /root/.cache \
    && mkdir -p /usr/local/share \
    && { \
        echo "# DevContainer Tool Versions"; \
        echo "build_date=$(date -u +%Y-%m-%dT%H:%M:%SZ)"; \
        echo "base_image=ubuntu:${VARIANT}"; \
        echo "ubuntu_version=$(cat /etc/os-release | grep VERSION_ID | cut -d'=' -f2 | tr -d '\"')"; \
        echo "bun_version=$(bun --version)"; \
        echo "zsh_version=$(zsh --version | cut -d' ' -f2)"; \
        echo "git_version=$(git --version | cut -d' ' -f3)"; \
        echo "curl_version=$(curl --version | head -n1 | cut -d' ' -f2)"; \
        echo "jq_version=$(jq --version | cut -d'-' -f2)"; \
        echo "python_version=$(python3 --version | cut -d' ' -f2)"; \
        echo "btop_version=$(btop --version | head -n1)"; \
        echo "tree_version=$(tree --version | cut -d' ' -f2)"; \
        echo "tmux_version=$(tmux -V | cut -d' ' -f2)"; \
    } > /usr/local/share/tool-versions.txt \
    && grep -Eq '^base_image=ubuntu:[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$' /usr/local/share/tool-versions.txt

# 5. Remote ZSH Configuration & Tmux Injection
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