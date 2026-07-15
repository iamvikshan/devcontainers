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

# 2. Install native binaries via pipe-to-sh (CodeRabbit)
RUN curl -fsSL https://cli.coderabbit.ai/install.sh | bash \
    && mv /root/.local/bin/coderabbit /usr/local/bin/coderabbit \
    && rm -rf /root/.local /root/.cache /tmp/*

# 3. Install npm global tools requiring native C++ SQLite bindings (OpenWiki and omniroute)
RUN npm install -g openwiki omniroute @anthropic-ai/claude-code \
    && npm cache clean --force \
    && rm -rf /root/.npm /tmp/*

# Drop privileges back to the standard non-root user
USER ${USERNAME}

# Inject Metadata for Skopeo Extraction
LABEL org.opencontainers.image.title="ai-agents" \
      org.opencontainers.image.base.name="ghcr.io/iamvikshan/devcontainer/ubuntu-bun-node:${BASE_TAG}" \
      devcontainer.tool.coderabbit="latest" \
      devcontainer.tool.claudecode="latest" \
      devcontainer.tool.omniroute="latest" \
      devcontainer.tool.openwiki="latest"

CMD ["sh", "-c", "sudo service cron start && sleep infinity"]
