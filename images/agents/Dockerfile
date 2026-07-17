# syntax=docker/dockerfile:1

FROM ghcr.io/iamvikshan/devcontainer/ubuntu-bun-node:latest

ARG USERNAME=root

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    cron \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://cli.coderabbit.ai/install.sh | bash \
    && mv /root/.local/bin/coderabbit /usr/local/bin/coderabbit \
    && curl -fsSL https://antigravity.google/cli/install.sh | sh \
    && mv /root/.local/bin/agy /usr/local/bin/agy \
    && rm -rf /root/.local /root/.cache /tmp/*

RUN npm install -g openwiki omniroute \
    && npm cache clean --force \
    && rm -rf /root/.npm /tmp/*

RUN bun install -g opencode-ai \
    && rm -rf /root/.bun/install/cache /tmp/*

# Inline entrypoint
COPY <<EOF /usr/local/bin/entrypoint.sh
#!/bin/bash
set -e
nohup omniroute serve > /tmp/omniroute.log 2>&1 &
service cron start 2>/dev/null || true
exec "\$@"
EOF
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["sleep", "infinity"]

USER ${USERNAME}

LABEL org.opencontainers.image.title="ai-agents" \
      org.opencontainers.image.source="https://github.com/iamvikshan/devcontainers" \
      org.opencontainers.image.base.name="ghcr.io/iamvikshan/devcontainer/ubuntu-bun-node:latest" \
      devcontainer.tool.coderabbit="latest" \
      devcontainer.tool.opencode="latest" \
      devcontainer.tool.agy="latest" \
      devcontainer.tool.omniroute="latest" \
      devcontainer.tool.openwiki="latest"