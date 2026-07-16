# syntax=docker/dockerfile:1

# renovate: datasource=docker depName=oven/bun
ARG BUN_VERSION="1.3.14"

# 1. Define Bun Source for Multi-Stage Copy (using glibc-compatible slim image)
FROM oven/bun:${BUN_VERSION}-slim AS bun_source

# 2. Base Image Tracking
FROM ghcr.io/iamvikshan/devcontainer/ubuntu:latest

# 3. Re-declare ARGs for Renovate tracking and Label injection
ARG BUN_VERSION

# renovate: datasource=node-version depName=node
ARG NODE_VERSION="24.18.0"
ARG USERNAME=root

# 4. Elevate to root to copy binaries and install Node + global tools
USER root

# Copy Bun binary and symlink bunx
COPY --from=bun_source /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s /usr/local/bin/bun /usr/local/bin/bunx

# Install Node.js deterministically for the correct architecture, then install formatters
ARG TARGETARCH
RUN ARCH="$(case "$TARGETARCH" in amd64) echo x64 ;; arm64) echo arm64 ;; *) echo "Unsupported TARGETARCH: $TARGETARCH" >&2; exit 1 ;; esac)" \
    && NODE_TARBALL="node-v${NODE_VERSION}-linux-${ARCH}.tar.xz" \
    && curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/${NODE_TARBALL}" \
    && curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt" \
    && grep " ${NODE_TARBALL}$" SHASUMS256.txt > node_checksum.txt \
    && sha256sum -c node_checksum.txt \
    && tar -xJf "${NODE_TARBALL}" -C /usr/local --strip-components=1 \
    && rm -f "${NODE_TARBALL}" SHASUMS256.txt node_checksum.txt

# 5. Drop privileges
USER ${USERNAME}

# 6. Inject Metadata for Skopeo Extraction
LABEL org.opencontainers.image.title="ubuntu-bun-node" \
      org.opencontainers.image.source https://github.com/iamvikshan/devcontainers \
      org.opencontainers.image.base.name="ghcr.io/iamvikshan/devcontainer/ubuntu:latest" \
      devcontainer.tool.bun="${BUN_VERSION}" \
      devcontainer.tool.node="${NODE_VERSION}"

CMD ["sleep", "infinity"]