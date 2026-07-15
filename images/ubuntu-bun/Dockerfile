# syntax=docker/dockerfile:1

# renovate: datasource=docker depName=oven/bun
ARG BUN_VERSION="1.3.14"
# renovate: datasource=docker depName=ghcr.io/iamvikshan/devcontainer/ubuntu-tools
ARG BASE_TAG="latest"

# 1. Define Bun Source for Multi-Stage Copy (using glibc-compatible slim image)
FROM oven/bun:${BUN_VERSION}-slim AS bun_source

# 2. Base Image Tracking
FROM ghcr.io/iamvikshan/devcontainer/ubuntu-tools:${BASE_TAG}

# 3. Re-declare ARGs for Renovate tracking and Label injection
ARG BUN_VERSION
ARG BASE_TAG

ARG USERNAME=root

# 4. Elevate to root to copy binaries and install global tools
USER root

COPY --from=bun_source /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx

# 5. Drop privileges
USER ${USERNAME}

# 6. Inject Metadata for Skopeo Extraction
LABEL org.opencontainers.image.title="ubuntu-bun" \
      org.opencontainers.image.base.name="ghcr.io/iamvikshan/devcontainer/ubuntu-tools:${BASE_TAG}" \
      devcontainer.tool.bun="${BUN_VERSION}"

CMD ["sleep", "infinity"]