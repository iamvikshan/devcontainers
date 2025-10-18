# Use the official Bun image for minimal size
ARG VARIANT=latest
FROM oven/bun:${VARIANT}

# Install sudo and create gitpod user with UID 33333 (required for Gitpod)
RUN apt-get update && apt-get install -y sudo curl git openssh-client \
    && groupadd --gid 33333 gitpod \
    && useradd --uid 33333 --gid gitpod --shell /bin/bash --create-home gitpod \
    && echo 'gitpod ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Configure SSH server to allow TCP forwarding
RUN echo "AllowTcpForwarding yes" >> /etc/ssh/sshd_config

# Switch to gitpod user
USER gitpod

# Dazzle does not rebuild a layer until one of its lines are changed. Increase this counter to rebuild this layer.
ENV TRIGGER_REBUILD=2

# Set up Bun environment and ensure bash shell
ENV BUN_INSTALL="/home/gitpod/.bun"
ENV PATH="${BUN_INSTALL}/bin:${PATH}"
ENV SHELL="/bin/bash"

# Configure Bun environment in bashrc.d (create directory structure for Gitpod)
# Note: Bun is already installed in the base oven/bun image
RUN mkdir -p /home/gitpod/.bashrc.d \
    && echo 'export BUN_INSTALL="$HOME/.bun"' >> /home/gitpod/.bashrc.d/100-bun \
    && echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> /home/gitpod/.bashrc.d/100-bun \
    && echo '# Source bashrc.d files' >> /home/gitpod/.bashrc \
    && echo 'for f in ~/.bashrc.d/*; do [ -r "$f" ] && source "$f"; done' >> /home/gitpod/.bashrc

# Extract tool versions during build
RUN sudo mkdir -p /usr/local/share && \
    echo "# DevContainer Tool Versions" > /tmp/tool-versions.txt && \
    echo "build_date=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /tmp/tool-versions.txt && \
    echo "base_image=oven/bun:latest" >> /tmp/tool-versions.txt && \
    echo "bun_version=$(bun --version)" >> /tmp/tool-versions.txt && \
    echo "git_version=$(git --version | cut -d' ' -f3)" >> /tmp/tool-versions.txt && \
    echo "curl_version=$(curl --version | head -n1 | cut -d' ' -f2)" >> /tmp/tool-versions.txt && \
    sudo mv /tmp/tool-versions.txt /usr/local/share/tool-versions.txt

# Copy setup script for enhanced Gitpod experience
COPY setup.sh /usr/local/bin/setup.sh
RUN sudo chmod +x /usr/local/bin/setup.sh

# Add setup script to bashrc.d for automatic sourcing
RUN echo "source /usr/local/bin/setup.sh" >> /home/gitpod/.bashrc.d/999-bun-setup

# Ensure we're in the right working directory
WORKDIR /home/gitpod

# Default command - ensure bash is used (override any sh preference)
CMD ["bash"]
