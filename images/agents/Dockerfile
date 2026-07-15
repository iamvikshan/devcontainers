# syntax=docker/dockerfile:1

# renovate: datasource=docker depName=ghcr.io/iamvikshan/devcontainer/ubuntu-bun-node
ARG BASE_TAG="latest"
FROM ghcr.io/iamvikshan/devcontainer/ubuntu-bun-node:${BASE_TAG}

ARG BASE_TAG
ARG USERNAME=root

# Elevate to root to install system utilities and global binaries
USER root

# 1. Install system dependencies (cron)
RUN apt-get update && apt-get install -y --no-install-recommends \
    cron \
    && rm -rf /var/lib/apt/lists/*

# 2. Install native binaries via pipe-to-sh (CodeRabbit, Antigravity, OpenCode, Hermes, Claude Code)
RUN curl -fsSL https://cli.coderabbit.ai/install.sh | bash \
    && mv /root/.local/bin/coderabbit /usr/local/bin/coderabbit \
    && curl -fsSL https://antigravity.google/cli/install.sh | sh \
    && mv /root/.local/bin/agy /usr/local/bin/agy \
    && curl -fsSL https://opencode.ai/install | bash \
    && curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash \
    && curl -fsSL https://claude.ai/install.sh | bash \
    && rm -rf /root/.local /root/.cache /tmp/*

# 3. Install npm global tools with native SQLite fallback (OpenWiki and omniroute)
RUN npm install -g openwiki omniroute \
    && npm cache clean --force \
    && rm -rf /root/.npm

# Drop privileges back to the standard non-root user
USER ${USERNAME}

# Inject Metadata for Skopeo Extraction
LABEL org.opencontainers.image.title="ai-harness" \
      org.opencontainers.image.base.name="ghcr.io/iamvikshan/devcontainer/ubuntu-bun-node:${BASE_TAG}" \
      devcontainer.tool.coderabbit="latest" \
      devcontainer.tool.agy="latest" \
      devcontainer.tool.opencode="latest" \
      devcontainer.tool.hermes="latest" \
      devcontainer.tool.claudecode="latest" \
      devcontainer.tool.omniroute="latest" \
      devcontainer.tool.openwiki="latest"

CMD ["sh", "-c", "sudo service cron start && sleep infinity"]