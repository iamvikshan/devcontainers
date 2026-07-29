# syntax=docker/dockerfile:1
FROM ghcr.io/iamvikshan/devcontainer/ubun-tu-node:latest

# renovate: datasource=docker depName=oven/bun
ARG BUN_VERSION="1.3.14"

# renovate: datasource=node-version depName=node
ARG NODE_VERSION="22.23.1"

# renovate: datasource=github-releases depName=jdx/aube
ARG AUBE_VERSION="1.36.0"

USER root

# 1. Permanently expose Aube's global pnpm bin directory to all runtime sessions
ENV PATH="/root/.local/share/pnpm:$PATH"

# 2. Install tools via Aube, resolve bundled native modules, then purge temporary compilers
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential \
    && mise use -g aube@${AUBE_VERSION} \
    && ln -sf /root/.local/share/mise/shims/aube /usr/local/bin/aube \
    # EXPORT PATH & TRUST POLICY so all child scripts and subsequent aube commands inherit them
    && export PATH="/root/.local/share/pnpm:$PATH" \
    && export AUBE_TRUST_POLICY_EXCLUDE="@pierre/theme@1.1.0" \
    # Install node-pre-gyp & prebuild-install via Aube so omniroute downloads prebuilt binaries
    && aube add -g @mapbox/node-pre-gyp prebuild-install omniroute opencode-ai openwiki \
    && aube approve-builds -g --all \
    # Dynamically find the virtual global directory and execute native build scripts
    && for dir in /root/.local/share/pnpm/global-aube/*; do aube -C "$dir" rebuild; done \
    # Use -W (--ignore-workspace-root-check) to install missing binaries inside omniroute's bundled dist directory
    && for dist in /root/.cache/aube/virtual-store/omniroute*/node_modules/omniroute/dist; do \
         if [ -d "$dist" ]; then aube -C "$dist" add -W better-sqlite3 wreq-js; fi; \
       done \
    # Remove temporary global helper tools via Aube
    && aube remove -g @mapbox/node-pre-gyp prebuild-install \
    # Resolve absolute targets so symlinking into /usr/local/bin never creates broken relative links
    && for bin in /root/.local/share/pnpm/*; do \
         if [ -e "$bin" ]; then \
           ln -sf "$(realpath "$bin")" "/usr/local/bin/$(basename "$bin")"; \
         fi; \
       done \
    # Purge compilers and Python so zero build bloat remains in the final image
    && apt-get purge -y --auto-remove python3 build-essential \
    && rm -rf /var/lib/apt/lists/* /root/.npm /root/.cache/aube /tmp/*

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
      devcontainer.tool.bun="${BUN_VERSION}" \
      devcontainer.tool.node="${NODE_VERSION}" \
      devcontainer.tool.aube="${AUBE_VERSION}" \
      devcontainer.tool.mise="latest" \
      devcontainer.tool.omniroute="latest" \
      devcontainer.tool.openwiki="latest" \
      devcontainer.tool.opencode="latest" \
      devcontainer.tool.coderabbit="latest" \
      devcontainer.tool.agy="latest"