# syntax=docker/dockerfile:1

# renovate: datasource=docker depName=oven/bun
ARG BUN_VERSION="1.4.4"

# 1. Define Bun Source for Multi-Stage Copy (using glibc-compatible slim image)
FROM oven/bun:${BUN_VERSION}-slim AS bun_source

# 2. Base Image Tracking
FROM ghcr.io/iamvikshan/devcontainer/ubuntu:latest

# 3. Re-declare ARGs for Renovate tracking and Label injection
ARG BUN_VERSION

# renovate: datasource=node-version depName=node
ARG NODE_VERSION="26.13.1"

# renovate: datasource=github-releases depName=jdx/aube
ARG AUBE_VERSION="2.10.0"

ARG USERNAME=root

# 4. Permanently expose Aube's global pnpm bin directory to all runtime sessions
ENV PATH="/root/.local/share/pnpm:$PATH"

# 5. elevate to root to copy binaries and install dependencies
USER root

# copy official bun binary and symlink bunx
COPY --from=bun_source /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx

# install required dynamic libraries, setup node/aube, and add global tools
RUN apt-get update && apt-get install -y --no-install-recommends libatomic1 \
    && rm -rf /var/lib/apt/lists/* \
    && mise use -g node@${NODE_VERSION} aube@${AUBE_VERSION} \
    && export PATH="/root/.local/share/pnpm:$PATH" \
    && AUBE_LOW_DOWNLOAD_THRESHOLD=0 aube add -g @syncron/r2git \
    && ln -sf /root/.local/share/mise/shims/node /usr/local/bin/node \
    && ln -sf /root/.local/share/mise/shims/npm /usr/local/bin/npm \
    && ln -sf /root/.local/share/mise/shims/npx /usr/local/bin/npx \
    && ln -sf /root/.local/share/mise/shims/aube /usr/local/bin/aube \
    && for bin in /root/.local/share/pnpm/*; do \
         if [ -e "$bin" ]; then \
           ln -sf "$(realpath "$bin")" "/usr/local/bin/$(basename "$bin")"; \
         fi; \
       done \
    && rm -rf /root/.npm /root/.cache/mise /root/.cache/aube /tmp/*

# 6. Drop privileges
USER ${USERNAME}

# 7. Inject Metadata for Skopeo Extraction
LABEL org.opencontainers.image.title="ubun-tu-node" \
      org.opencontainers.image.source="https://github.com/iamvikshan/devcontainers" \
      org.opencontainers.image.base.name="ghcr.io/iamvikshan/devcontainer/ubuntu:latest" \
      devcontainer.tool.bun="${BUN_VERSION}" \
      devcontainer.tool.node="${NODE_VERSION}" \
      devcontainer.tool.aube="${AUBE_VERSION}" \
      devcontainer.tool.mise="latest" \
      devcontainer.tool.r2git="latest"

CMD ["sleep", "infinity"]
