# Alpine-based Dockerfile for Bun + Node.js runtime
ARG VARIANT=alpine
FROM oven/bun:${VARIANT}

ARG USERNAME=root

# Install all packages in a single layer to minimize image size
RUN apk add --no-cache \
    bash \
    git \
    sudo \
    curl \
    jq \
    python3 \
    nodejs \
    npm \
    && npm install -g eslint

# Create the user if it doesn't exist (this step is not needed for root user)
RUN if [ "${USERNAME}" != "root" ]; then \
        adduser -D -s /bin/bash ${USERNAME}; \
    fi

# Add the user to the wheel group for sudo (this step is not needed for root user)
RUN if [ "${USERNAME}" != "root" ]; then \
        addgroup ${USERNAME} wheel; \
    fi

# Configure sudoers to allow passwordless sudo (this step is not needed for root user)
RUN if [ "${USERNAME}" != "root" ]; then \
        echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers; \
    fi

# Extract tool versions during build
RUN mkdir -p /usr/local/share && \
    echo "# DevContainer Tool Versions" > /usr/local/share/tool-versions.txt && \
    echo "build_date=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /usr/local/share/tool-versions.txt && \
    echo "base_image=oven/bun:${VARIANT}" >> /usr/local/share/tool-versions.txt && \
    echo "bun_version=$(bun --version)" >> /usr/local/share/tool-versions.txt && \
    echo "node_version=$(node --version)" >> /usr/local/share/tool-versions.txt && \
    echo "npm_version=$(npm --version)" >> /usr/local/share/tool-versions.txt && \
    echo "eslint_version=$(eslint --version | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt && \
    echo "alpine_version=$(cat /etc/alpine-release)" >> /usr/local/share/tool-versions.txt && \
    echo "git_version=$(git --version | cut -d' ' -f3)" >> /usr/local/share/tool-versions.txt && \
    echo "curl_version=$(curl --version | head -n1 | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt && \
    echo "jq_version=$(jq --version | cut -d'-' -f2)" >> /usr/local/share/tool-versions.txt && \
    echo "python_version=$(python3 --version | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt

# Copy the setup script and make it executable
COPY setup.sh /usr/local/bin/setup.sh
RUN chmod +x /usr/local/bin/setup.sh

# Ensure the home directory and .bashrc file exist for the specified user
RUN if [ "${USERNAME}" != "root" ]; then \
        mkdir -p /home/${USERNAME} && touch /home/${USERNAME}/.bashrc; \
    fi

# Append sourcing the setup script to .bashrc
RUN if [ "${USERNAME}" != "root" ]; then \
        echo "source /usr/local/bin/setup.sh" >> /home/${USERNAME}/.bashrc; \
    else \
        echo "source /usr/local/bin/setup.sh" >> /root/.bashrc; \
    fi

# Switch to the specified user
USER ${USERNAME}

# Set the default command to open a bash shell
CMD ["bash"]
