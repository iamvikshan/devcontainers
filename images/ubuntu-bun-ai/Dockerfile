# syntax=docker/dockerfile:1

# renovate: datasource=docker depName=ghcr.io/iamvikshan/devcontainers/ubuntu-bun
ARG BASE_TAG="latest"
FROM ghcr.io/iamvikshan/devcontainers/ubuntu-bun:${BASE_TAG}

ARG BASE_TAG
ARG USERNAME=root

# Elevate to root to install personal taste additions
USER root

# 1. Install system cron
RUN apt-get update && apt-get install -y --no-install-recommends cron && rm -rf /var/lib/apt/lists/*

# 2. Install CodeRabbit CLI
RUN curl -fsSL https://cli.coderabbit.ai/install.sh | bash \
    && mv /root/.local/bin/coderabbit /usr/local/bin/coderabbit \
    && rm -rf /root/.local /root/.cache

# 3. Install Antigravity CLI (agy)
RUN curl -fsSL https://antigravity.google/cli/install.sh | sh \
    && mv /root/.local/bin/agy /usr/local/bin/agy \
    && rm -rf /root/.local

# 4. Node Checkmate: Intercept Node.js script execution and route to Bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/node

# Drop privileges back to the standard user
USER ${USERNAME}

# Inject Metadata for Skopeo Extraction
LABEL org.opencontainers.image.title="ubuntu-bun-ai" \
      org.opencontainers.image.base.name="ghcr.io/iamvikshan/devcontainers/ubuntu-bun:${BASE_TAG}" \
      devcontainer.tool.coderabbit="latest" \
      devcontainer.tool.agy="latest"

CMD ["sleep", "infinity"]
