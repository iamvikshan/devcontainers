# syntax=docker/dockerfile:1

# 1. Define the version ARGs for Renovate to track
# renovate: datasource=docker depName=oven/bun
ARG BUN_VERSION="1.3.14"

# Inject the tracked Bun version into the base image
FROM oven/bun:${BUN_VERSION}-alpine

# Re-declare ARGs after FROM so they are available in the build environment
ARG BUN_VERSION
ARG USERNAME=root

# 2. Install unpinned OS packages & pinned global tools (using Bun)
# We completely removed the tool-versions.txt generation block
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache \
    zsh git sudo curl jq btop tree

# 3. Consolidated User, Remote ZSH configuration, and Tmux setup
RUN if [ "${USERNAME}" != "root" ]; then \
        echo "${USERNAME}" | grep -Eq '^[a-z_][a-z0-9_-]*[$]?$' || { echo "Invalid USERNAME: ${USERNAME}" >&2; exit 1; } && \
        adduser -D -s /bin/zsh "${USERNAME}" && \
        addgroup "${USERNAME}" wheel && \
        mkdir -p /etc/sudoers.d && \
        echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${USERNAME}" && \
        chmod 0440 "/etc/sudoers.d/${USERNAME}" && \
        visudo -cf "/etc/sudoers.d/${USERNAME}" && \
        HOME_DIR="/home/${USERNAME}"; \
    else \
        HOME_DIR="/root"; \
    fi && \
    mkdir -p "${HOME_DIR}" && \
    git clone --depth=1 https://github.com/ohmyzsh/ohmyzsh.git "${HOME_DIR}/.oh-my-zsh" && \
    git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions "${HOME_DIR}/.oh-my-zsh/custom/plugins/zsh-autosuggestions" && \
    git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting "${HOME_DIR}/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting" && \
    curl -fsSL https://raw.githubusercontent.com/iamvikshan/.github/refs/heads/main/scripts/universal.zshrc -o "${HOME_DIR}/.zshrc" && \
    if [ "${USERNAME}" != "root" ]; then \
        chown -R "${USERNAME}:${USERNAME}" "${HOME_DIR}"; \
    fi

USER ${USERNAME}

# 4. Inject Metadata for Skopeo Extraction
LABEL org.opencontainers.image.title="bun" \
      org.opencontainers.image.base.name="oven/bun:${BUN_VERSION}-alpine" \
      org.opencontainers.image.source https://github.com/iamvikshan/devcontainers \
      devcontainer.tool.bun="${BUN_VERSION}"

CMD ["sleep", "infinity"]