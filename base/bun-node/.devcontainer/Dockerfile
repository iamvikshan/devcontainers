# Use Ubuntu as the base image
FROM ubuntu:latest

# Environment variables
ENV PATH="/root/.bun/bin:${PATH}"

# Install essential packages only
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    git && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun

# Verify installations
RUN node --version && \
    npm --version && \
    bun --version && \
    git --version