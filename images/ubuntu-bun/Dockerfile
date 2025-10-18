ARG VARIANT=latest
FROM ubuntu:${VARIANT}

ARG USERNAME=root

# Install all packages in a single layer to minimize image size
ENV DEBIAN_FRONTEND=noninteractive

# Create the user if it doesn't exist (this step is not needed for root user)
RUN if [ "${USERNAME}" != "root" ] && ! id -u ${USERNAME} > /dev/null 2>&1; then \
    useradd -m ${USERNAME}; \
    fi

# Add the user to the sudo group (this step is not needed for root user)
RUN if [ "${USERNAME}" != "root" ]; then \
    usermod -aG sudo ${USERNAME}; \
    fi

# Configure sudoers to allow passwordless sudo (this step is not needed for root user)
RUN if [ "${USERNAME}" != "root" ]; then \
    echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers; \
    fi

# Ensure necessary directories have the correct permissions
RUN mkdir -p /var/lib/apt/lists/partial && chown -R ${USERNAME}:${USERNAME} /var/lib/apt/lists

# Install all packages and Bun in a single layer
RUN apt-get update && apt-get install -y \
    git \
    sudo \
    curl \
    unzip \
    && curl -fsSL https://bun.sh/install | bash \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /tmp/* /var/tmp/*



# Create symbolic links for Bun (for both root and non-root users)
RUN if [ "${USERNAME}" != "root" ]; then \
    mv /root/.bun /home/${USERNAME}/.bun \
    && ln -s /home/${USERNAME}/.bun/bin/bun /usr/local/bin/bun \
    && ln -s /home/${USERNAME}/.bun/bin/bunx /usr/local/bin/bunx; \
    else \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun \
    && ln -s /root/.bun/bin/bunx /usr/local/bin/bunx; \
    fi

# Extract tool versions during build
RUN echo "# DevContainer Tool Versions" > /usr/local/share/tool-versions.txt && \
    echo "build_date=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /usr/local/share/tool-versions.txt && \
    echo "base_image=ubuntu:${VARIANT}" >> /usr/local/share/tool-versions.txt && \
    echo "ubuntu_version=$(lsb_release -rs 2>/dev/null || cat /etc/os-release | grep VERSION_ID | cut -d'=' -f2 | tr -d '\"')" >> /usr/local/share/tool-versions.txt && \
    echo "bun_version=$(bun --version)" >> /usr/local/share/tool-versions.txt && \
    echo "git_version=$(git --version | cut -d' ' -f3)" >> /usr/local/share/tool-versions.txt && \
    echo "curl_version=$(curl --version | head -n1 | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt

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