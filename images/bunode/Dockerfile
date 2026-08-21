# syntax=docker/dockerfile:1

FROM ghcr.io/iamvikshan/devcontainer/bun:latest

# renovate: datasource=docker depName=oven/bun
ARG BUN_VERSION="1.4.0"

ARG USERNAME=root

# 4. Elevate to root, install Node/NPM, and drop privileges
USER root
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache nodejs npm

USER ${USERNAME}

# 5. Inject Metadata for Skopeo Extraction
LABEL org.opencontainers.image.title="bunode" \
      org.opencontainers.image.base.name="ghcr.io/iamvikshan/devcontainer/bun:latest" \
      org.opencontainers.image.source="https://github.com/iamvikshan/devcontainers" \
      devcontainer.tool.bun="${BUN_VERSION}" \
      devcontainer.tool.node="latest"

CMD ["sleep", "infinity"]