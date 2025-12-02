# Alpine-based Dockerfile for minimal image with Bun runtime
ARG VARIANT=alpine
FROM oven/bun:${VARIANT}

ARG USERNAME=root

# Install packages in single layer + capture versions
RUN apk add --no-cache \
    bash \
    git \
    sudo \
    curl \
    jq \
    python3

# Extract and store tool versions
RUN mkdir -p /usr/local/share && \
    { \
    echo "# DevContainer Tool Versions"; \
    echo "build_date=$(date -u +%Y-%m-%dT%H:%M:%SZ)"; \
    echo "base_image=oven/bun:${VARIANT}"; \
    echo "bun_version=$(bun --version)"; \
    echo "alpine_version=$(cat /etc/alpine-release)"; \
    echo "git_version=$(git --version | cut -d' ' -f3)"; \
    echo "curl_version=$(curl --version | head -n1 | cut -d' ' -f2)"; \
    echo "jq_version=$(jq --version | cut -d'-' -f2)"; \
    echo "python_version=$(python3 --version | cut -d' ' -f2)"; \
    } > /usr/local/share/tool-versions.txt

# Copy and setup script
COPY setup.sh /usr/local/bin/setup.sh
RUN chmod +x /usr/local/bin/setup.sh

# User configuration (consolidated logic)
RUN if [ "${USERNAME}" != "root" ]; then \
        # Create user and set up sudo
        adduser -D -s /bin/bash ${USERNAME} && \
        addgroup ${USERNAME} wheel && \
        echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers && \
        # Setup bashrc
        echo "source /usr/local/bin/setup.sh" >> /home/${USERNAME}/.bashrc; \
    else \
        # For root user
        echo "source /usr/local/bin/setup.sh" >> /root/.bashrc; \
    fi

# Switch to user and set default command
USER ${USERNAME}
CMD ["bash"]
