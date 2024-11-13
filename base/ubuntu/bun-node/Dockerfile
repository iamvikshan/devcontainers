ARG VARIANT=latest
FROM ubuntu:${VARIANT}

ARG USERNAME=root
ARG NPM_GLOBAL=/usr/local/share/npm-global

# Add NPM global to PATH.
ENV PATH=${NPM_GLOBAL}/bin:/usr/local/bun/bin:${PATH}

# Install Git and sudo non-interactively
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y git sudo

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

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    && curl -fsSL https://deb.nodesource.com/setup_current.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# If the user is not root, install Node.js globally without setting it up
RUN if [ "${USERNAME}" != "root" ]; then \
    npm install -g eslint; \
    fi

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash \
    && rm -rf /var/lib/apt/lists/*

# Move .bun directory and create symbolic links for non-root user
RUN if [ "${USERNAME}" != "root" ]; then \
    mv /root/.bun /home/${USERNAME}/.bun \
    && ln -s /home/${USERNAME}/.bun/bin/bun /usr/local/bin/bun \
    && ln -s /home/${USERNAME}/.bun/bin/bunx /usr/local/bin/bunx; \
    fi

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
