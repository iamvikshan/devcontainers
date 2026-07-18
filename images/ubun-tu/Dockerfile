# syntax=docker/dockerfile:1

# renovate: datasource=docker depName=oven/bun
ARG BUN_VERSION="1.3.14"

# 1. Define Bun Source for Multi-Stage Copy (using glibc-compatible slim image)
FROM oven/bun:${BUN_VERSION}-slim AS bun_source

# 2. Base Image Tracking
FROM ghcr.io/iamvikshan/devcontainer/ubuntu:latest

# 3. Re-declare ARGs for Renovate tracking and Label injection
ARG BUN_VERSION

ARG USERNAME=root

# 4. Elevate to root to copy binaries and install global tools
USER root

COPY --from=bun_source /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx

RUN bun install -g @syncron/r2git \
&& rm -rf /root/.bun/install/cache /tmp/*

# 5. Drop privileges
USER ${USERNAME}

# 6. Inject Metadata for Skopeo Extraction
LABEL org.opencontainers.image.title="ubun-tu" \
      org.opencontainers.image.source="https://github.com/iamvikshan/devcontainers" \
      org.opencontainers.image.base.name="ghcr.io/iamvikshan/devcontainer/ubuntu:latest" \
      devcontainer.tool.bun="${BUN_VERSION}"

CMD ["sleep", "infinity"]