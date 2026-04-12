ARG VARIANT=latest
FROM ubuntu:${VARIANT}

ARG VARIANT
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
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    zsh \
    git \
    sudo \
    curl \
    unzip \
    jq \
    python3 \
    btop \
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
    echo "zsh_version=$(zsh --version | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt && \
    echo "git_version=$(git --version | cut -d' ' -f3)" >> /usr/local/share/tool-versions.txt && \
    echo "curl_version=$(curl --version | head -n1 | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt && \
    echo "jq_version=$(jq --version | cut -d'-' -f2)" >> /usr/local/share/tool-versions.txt && \
    echo "python_version=$(python3 --version | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt && \
    echo "btop_version=$(btop --version | head -n1)" >> /usr/local/share/tool-versions.txt && \
    grep -Eq '^base_image=ubuntu:[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$' /usr/local/share/tool-versions.txt

COPY setup.zsh /usr/local/bin/setup.zsh
RUN chmod +x /usr/local/bin/setup.zsh

RUN if [ "${USERNAME}" != "root" ]; then \
        usermod -s /bin/zsh "${USERNAME}"; \
        HOME_DIR="/home/${USERNAME}"; \
    else \
        HOME_DIR="/root"; \
    fi && \
    mkdir -p "${HOME_DIR}" && \
    git clone --depth=1 https://github.com/ohmyzsh/ohmyzsh.git "${HOME_DIR}/.oh-my-zsh" && \
    git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions "${HOME_DIR}/.oh-my-zsh/custom/plugins/zsh-autosuggestions" && \
    git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting "${HOME_DIR}/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting" && \
    printf '%s\n' 'source /usr/local/bin/setup.zsh' > "${HOME_DIR}/.zshrc" && \
    if [ "${USERNAME}" != "root" ]; then \
        chown -R "${USERNAME}:${USERNAME}" "${HOME_DIR}"; \
    fi

USER ${USERNAME}

CMD ["/bin/zsh"]