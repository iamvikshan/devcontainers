# syntax=docker/dockerfile:1

# 1. Define the version ARGs for Renovate to track
# renovate: datasource=docker depName=oven/bun
ARG BUN_VERSION="1.1.17"
# renovate: datasource=npm depName=oxlint
ARG OXLINT_VERSION="0.71.0"
# renovate: datasource=npm depName=oxfmt
ARG OXFMT_VERSION="0.56.0"

# Inject the tracked Bun version into the base image
FROM oven/bun:${BUN_VERSION}-alpine

# Re-declare ARGs after FROM so they are available in the build environment
ARG BUN_VERSION
ARG OXLINT_VERSION
ARG OXFMT_VERSION
ARG USERNAME=root

# 2. Install unpinned OS packages & pinned global tools (using Bun)
# We completely removed the tool-versions.txt generation block
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache \
    zsh git sudo curl jq python3 btop tree tmux bash \
    && bun install -g oxlint@${OXLINT_VERSION} oxfmt@${OXFMT_VERSION}

# 3. Consolidated User, Remote ZSH configuration, and Tmux setup
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

# 4. Inject Metadata for Skopeo Extraction
LABEL org.opencontainers.image.title="bun" \
      org.opencontainers.image.base.name="oven/bun:${BUN_VERSION}-alpine" \
      devcontainer.tool.bun="${BUN_VERSION}" \
      devcontainer.tool.oxlint="${OXLINT_VERSION}" \
      devcontainer.tool.oxfmt="${OXFMT_VERSION}"

CMD ["sleep", "infinity"]