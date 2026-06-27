# syntax=docker/dockerfile:1

# 1. Define Bun Source for Multi-Stage Copy
# renovate: datasource=docker depName=oven/bun
ARG BUN_VERSION="1.1.17"
FROM oven/bun:${BUN_VERSION}-alpine AS bun_source

# 2. Base Image Tracking
# renovate: datasource=docker depName=ghcr.io/iamvikshan/devcontainers/ubuntu-tools
ARG BASE_TAG="latest"
FROM ghcr.io/iamvikshan/devcontainers/ubuntu-tools:${BASE_TAG}

# 3. Re-declare ARGs for Renovate tracking and Label injection
ARG BUN_VERSION
ARG BASE_TAG

# renovate: datasource=node-version depName=node
ARG NODE_VERSION="22.11.0"
# renovate: datasource=npm depName=oxlint
ARG OXLINT_VERSION="0.4.3"
# renovate: datasource=npm depName=oxfmt
ARG OXFMT_VERSION="0.56.0"

ARG USERNAME=root

# 4. Elevate to root to copy binaries and install Node + global tools
USER root

# Copy Bun binary and symlink bunx
COPY --from=bun_source /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx

# Install Node.js deterministically for the correct architecture, then install formatters
ARG TARGETARCH
RUN ARCH=$([ "$TARGETARCH" = "amd64" ] && echo "x64" || echo "arm64") \
    && NODE_TARBALL="node-v${NODE_VERSION}-linux-${ARCH}.tar.xz" \
    && curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/${NODE_TARBALL}" \
    && curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt" \
    && grep " ${NODE_TARBALL}$" SHASUMS256.txt | sha256sum -c - \
    && tar -xJf "${NODE_TARBALL}" -C /usr/local --strip-components=1 \
    && rm -f "${NODE_TARBALL}" SHASUMS256.txt \
    && bun install -g oxlint@${OXLINT_VERSION} oxfmt@${OXFMT_VERSION}

# 5. Drop privileges
USER ${USERNAME}

# 6. Inject Metadata for Skopeo Extraction
LABEL org.opencontainers.image.title="ubuntu-bun-node" \
      org.opencontainers.image.base.name="ghcr.io/iamvikshan/devcontainers/ubuntu-tools:${BASE_TAG}" \
      devcontainer.tool.bun="${BUN_VERSION}" \
      devcontainer.tool.node="${NODE_VERSION}" \
      devcontainer.tool.oxlint="${OXLINT_VERSION}" \
      devcontainer.tool.oxfmt="${OXFMT_VERSION}"

CMD ["sleep", "infinity"]