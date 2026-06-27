# syntax=docker/dockerfile:1

# renovate: datasource=docker depName=ubuntu
ARG UBUNTU_VERSION="26.04"

FROM ubuntu:${UBUNTU_VERSION}

# Re-declare ARGs after FROM
ARG UBUNTU_VERSION
ARG USERNAME=root
ENV DEBIAN_FRONTEND=noninteractive

# 2. Consolidated User Creation & Permissions
RUN if [ "${USERNAME}" != "root" ] && ! id -u ${USERNAME} > /dev/null 2>&1; then \
        useradd -m -s /bin/zsh ${USERNAME} \
        && usermod -aG sudo ${USERNAME} \
        && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers; \
    fi

# 3. OS Packages & Antigravity CLI (BuildKit Cached)
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates zsh git sudo curl unzip jq python3 btop tree tmux bash \
    && curl -fsSL https://antigravity.google/cli/install.sh | bash \
    && mv /root/.local/bin/agy /usr/local/bin/agy \
    && rm -rf /root/.local /var/lib/apt/lists/*

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

# 5. Inject Metadata for Skopeo Extraction
LABEL org.opencontainers.image.title="ubuntu-tools" \
      org.opencontainers.image.base.name="ubuntu:${UBUNTU_VERSION}" \
      devcontainer.tool.ubuntu="${UBUNTU_VERSION}"

CMD ["sleep", "infinity"]