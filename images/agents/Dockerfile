# syntax=docker/dockerfile:1
FROM ghcr.io/iamvikshan/devcontainer/ubun-tu-node:latest

USER root

# 1. Install Global Node/NPM Packages
RUN npm install -g omniroute openwiki \
    && npm cache clean --force \
    && rm -rf /root/.npm /tmp/*

# 2. Install Global Bun Packages
RUN bun install -g opencode-ai \
    && rm -rf /root/.bun/install/cache /tmp/*

# 3. Install Binary Tooling (Coderabbit & Agy)
RUN echo "Installing coderabbit..." \
    && curl -fsSL https://cli.coderabbit.ai/install.sh | bash \
    && mv /root/.local/bin/coderabbit /usr/local/bin/coderabbit \
    && echo "Installing agy..." \
    && curl -fsSL https://antigravity.google/cli/install.sh | sh \
    && mv /root/.local/bin/agy /usr/local/bin/agy \
    && rm -rf /root/.local /root/.cache /tmp/*

LABEL org.opencontainers.image.title="agents" \
      org.opencontainers.image.source="https://github.com/iamvikshan/devcontainers" \
      org.opencontainers.image.base.name="ghcr.io/iamvikshan/devcontainer/ubun-tu-node:latest" \
      devcontainer.tool.omniroute="latest" \
      devcontainer.tool.openwiki="latest" \
      devcontainer.tool.opencode="latest" \
      devcontainer.tool.coderabbit="latest" \
      devcontainer.tool.agy="latest"