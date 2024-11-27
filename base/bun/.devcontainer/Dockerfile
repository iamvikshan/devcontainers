ARG VARIANT=latest
FROM oven/bun:${VARIANT}

ARG USERNAME=root

# Install Git, sudo, OpenSSH client, and curl non-interactively
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    git \
    sudo \
    openssh-client \
    curl && \
    rm -rf /var/lib/apt/lists/*

# Configure SSH server to allow TCP forwarding
RUN echo "AllowTcpForwarding yes" >> /etc/ssh/sshd_config

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
