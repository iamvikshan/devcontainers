# syntax=docker/dockerfile:1

# 1. Base Image Tracking
# renovate: datasource=docker depName=ghcr.io/iamvikshan/devcontainers/bun
ARG BASE_TAG="latest"

FROM ghcr.io/iamvikshan/devcontainers/bun:${BASE_TAG}

ARG BASE_TAG

# 2. Re-declare inherited ARGs purely for Renovate tracking and Label injection
# renovate: datasource=docker depName=oven/bun
ARG BUN_VERSION="1.1.17"

ARG USERNAME=root

# 4. Elevate to root, install Node/NPM, and drop privileges
USER root
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache nodejs npm

USER ${USERNAME}

# 5. Inject Metadata for Skopeo Extraction
LABEL org.opencontainers.image.title="bun-node" \
      org.opencontainers.image.base.name="ghcr.io/iamvikshan/devcontainers/bun:${BASE_TAG}" \
      devcontainer.tool.bun="${BUN_VERSION}"

CMD ["sleep", "infinity"]