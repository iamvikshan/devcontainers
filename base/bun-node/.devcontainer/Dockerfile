ARG VARIANT=latest
FROM oven/bun:${VARIANT}

ARG USERNAME=root

# Install all packages in a single layer to minimize image size
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    git \
    sudo \
    curl \
    openssh-server \
    && mkdir /var/run/sshd \
    && curl -fsSL https://deb.nodesource.com/setup_current.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g eslint \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /tmp/* /var/tmp/*

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

# Configure SSH
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config \
    && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
    && sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# Extract tool versions during build
RUN echo "# DevContainer Tool Versions" > /usr/local/share/tool-versions.txt && \
    echo "build_date=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /usr/local/share/tool-versions.txt && \
    echo "base_image=oven/bun:${VARIANT}" >> /usr/local/share/tool-versions.txt && \
    echo "bun_version=$(bun --version)" >> /usr/local/share/tool-versions.txt && \
    echo "node_version=$(node --version)" >> /usr/local/share/tool-versions.txt && \
    echo "npm_version=$(npm --version)" >> /usr/local/share/tool-versions.txt && \
    echo "eslint_version=$(eslint --version | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt && \
    echo "debian_version=$(cat /etc/debian_version)" >> /usr/local/share/tool-versions.txt && \
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

# Create a startup script to handle SSH service
RUN echo '#!/bin/bash\n\
# Start SSH service\n\
service ssh start\n\
\n\
# Execute the original command\n\
exec "$@"' > /usr/local/bin/start-services.sh && \
    chmod +x /usr/local/bin/start-services.sh

# Switch to the specified user
USER ${USERNAME}

# Set the default command to start services and open a bash shell
CMD ["/usr/local/bin/start-services.sh", "bash"]
