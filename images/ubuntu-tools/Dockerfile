ARG VARIANT=24.04
FROM ubuntu:${VARIANT}

ARG VARIANT
ARG USERNAME=root

# Install all packages in a single layer to minimize image size
ENV DEBIAN_FRONTEND=noninteractive

# Validate USERNAME build arg for non-root users
RUN if [ "${USERNAME}" != "root" ]; then \
    echo "${USERNAME}" | grep -Eq '^[a-z_][a-z0-9_-]*[$]?$' || { echo "Invalid USERNAME build arg: ${USERNAME}" >&2; exit 1; }; \
    fi

# Create the user if it doesn't exist (this step is not needed for root user)
RUN if [ "${USERNAME}" != "root" ] && ! id -u "${USERNAME}" > /dev/null 2>&1; then \
    useradd -m "${USERNAME}"; \
    fi

# Add the user to the sudo group (this step is not needed for root user)
RUN if [ "${USERNAME}" != "root" ]; then \
    usermod -aG sudo "${USERNAME}"; \
    fi

# Ensure necessary directories have the correct permissions
RUN mkdir -p /var/lib/apt/lists/partial

# Install all required tools in a single layer and clean package/cache artifacts
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    sudo \
    curl \
    unzip \
    jq \
    python3 \
    btop \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /tmp/* /var/tmp/*

# Configure sudoers to allow passwordless sudo (this step is not needed for root user)
RUN if [ "${USERNAME}" != "root" ]; then \
    mkdir -p /etc/sudoers.d && \
    echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${USERNAME}" && \
    chmod 0440 "/etc/sudoers.d/${USERNAME}" && \
    visudo -cf "/etc/sudoers.d/${USERNAME}"; \
    fi

# Extract tool versions during build
RUN echo "# DevContainer Tool Versions" > /usr/local/share/tool-versions.txt && \
    echo "build_date=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /usr/local/share/tool-versions.txt && \
    echo "base_image=ubuntu:${VARIANT}" >> /usr/local/share/tool-versions.txt && \
    echo "ubuntu_version=$(cat /etc/os-release | grep VERSION_ID | cut -d'=' -f2 | tr -d '\"')" >> /usr/local/share/tool-versions.txt && \
    echo "git_version=$(git --version | cut -d' ' -f3)" >> /usr/local/share/tool-versions.txt && \
    echo "curl_version=$(curl --version | head -n1 | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt && \
    echo "jq_version=$(jq --version | cut -d'-' -f2)" >> /usr/local/share/tool-versions.txt && \
    echo "python_version=$(python3 --version | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt && \
    echo "btop_version=$(btop --version | head -n1)" >> /usr/local/share/tool-versions.txt && \
    grep -Eq '^base_image=ubuntu:[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$' /usr/local/share/tool-versions.txt

# Copy the setup script and make it executable
COPY setup.sh /usr/local/bin/setup.sh
RUN chmod +x /usr/local/bin/setup.sh

# Ensure the home directory and .bashrc file exist for the specified user
RUN if [ "${USERNAME}" != "root" ]; then \
    mkdir -p "/home/${USERNAME}" && touch "/home/${USERNAME}/.bashrc" && chown "${USERNAME}:${USERNAME}" "/home/${USERNAME}" "/home/${USERNAME}/.bashrc"; \
    fi

# Append sourcing the setup script to .bashrc
RUN if [ "${USERNAME}" != "root" ]; then \
    echo "source /usr/local/bin/setup.sh" >> "/home/${USERNAME}/.bashrc"; \
    else \
    echo "source /usr/local/bin/setup.sh" >> /root/.bashrc; \
    fi

# Switch to the specified user
USER ${USERNAME}

# Set the default command to open a bash shell
CMD ["bash"]