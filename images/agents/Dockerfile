# syntax=docker/dockerfile:1
FROM ghcr.io/iamvikshan/devcontainer/ubun-tu-node:latest

USER root

# 1. Install Aube (via mise) and use it to install Node tools blazingly fast
RUN mise use -g aube \
    && mise exec -- aube add -g omniroute openwiki \
    # Symlink aube and its installed binaries globally so scripts can execute them natively
    && ln -sf /root/.local/share/mise/shims/aube /usr/local/bin/aube 2>/dev/null || true \
    && ln -sf /root/.local/share/aube/bin/* /usr/local/bin/ 2>/dev/null || true \
    && rm -rf /root/.npm /root/.cache/aube /tmp/*

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
      devcontainer.tool.mise="latest" \
      devcontainer.tool.aube="latest" \
      devcontainer.tool.omniroute="latest" \
      devcontainer.tool.openwiki="latest" \
      devcontainer.tool.opencode="latest" \
      devcontainer.tool.coderabbit="latest" \
      devcontainer.tool.agy="latest"