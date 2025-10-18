ARG VARIANT=latest
FROM ubuntu:${VARIANT}

# Gitpod requires specific user setup
ARG USERNAME=gitpod

# Install all packages in a single layer to minimize image size
ENV DEBIAN_FRONTEND=noninteractive

# Dazzle does not rebuild a layer until one of its lines are changed. Increase this counter to rebuild this layer.
ENV TRIGGER_REBUILD=1

# Install essential packages for Gitpod compatibility
RUN apt-get update && apt-get install -y \
    git \
    git-lfs \
    sudo \
    bash \
    curl \
    unzip \
    openssh-client \
    openssh-server \
    && mkdir /var/run/sshd \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /tmp/* /var/tmp/*

# Configure SSH
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config \
    && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config \
    && sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config \
    && echo "AllowTcpForwarding yes" >> /etc/ssh/sshd_config

# Create the gitpod user with UID 33333 (required by Gitpod)
RUN useradd -l -u 33333 -G sudo -md /home/gitpod -s /bin/bash -p gitpod gitpod \
    # Remove `use_pty` option and enable passwordless sudo for users in the 'sudo' group
    && sed -i.bkp -e '/Defaults\tuse_pty/d' -e 's/%sudo\s\+ALL=(ALL\(:ALL\)\?)\s\+ALL/%sudo ALL=NOPASSWD:ALL/g' /etc/sudoers

# Install Bun
USER gitpod
ENV BUN_INSTALL="/home/gitpod/.bun"
ENV PATH="${BUN_INSTALL}/bin:${PATH}"
ENV SHELL="/bin/bash"

RUN curl -fsSL https://bun.sh/install | bash

# Set up Gitpod-specific directory structure
RUN mkdir -p /home/gitpod/.bashrc.d \
    && mkdir -p /home/gitpod/.local/share/bash-completion/completions

# Configure Git LFS
RUN git lfs install --skip-repo

# Configure bash environment for Gitpod
RUN echo 'export PATH="$HOME/.local/bin:$PATH"' >> /home/gitpod/.bashrc.d/000-path \
    && echo 'export BUN_INSTALL="$HOME/.bun"' >> /home/gitpod/.bashrc.d/100-bun \
    && echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> /home/gitpod/.bashrc.d/100-bun

# Source .bashrc.d in .bashrc
RUN echo 'for i in $(ls -A $HOME/.bashrc.d/); do source $HOME/.bashrc.d/$i; done' >> /home/gitpod/.bashrc

# Custom Gitpod PS1 prompt
RUN echo "PS1='\[\033[01;32m\]\u\[\033[00m\] \[\033[01;34m\]\w\[\033[00m\]\$(__git_ps1 \" (%s)\") $ '" >> /home/gitpod/.bashrc

# Extract tool versions during build
RUN sudo mkdir -p /usr/local/share && \
    echo "# DevContainer Tool Versions" > /tmp/tool-versions.txt && \
    echo "build_date=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /tmp/tool-versions.txt && \
    echo "base_image=ubuntu:${VARIANT}" >> /tmp/tool-versions.txt && \
    echo "ubuntu_version=$(lsb_release -rs 2>/dev/null || cat /etc/os-release | grep VERSION_ID | cut -d'=' -f2 | tr -d '\"')" >> /tmp/tool-versions.txt && \
    echo "bun_version=$(bun --version)" >> /tmp/tool-versions.txt && \
    echo "git_version=$(git --version | cut -d' ' -f3)" >> /tmp/tool-versions.txt && \
    echo "curl_version=$(curl --version | head -n1 | cut -d' ' -f2)" >> /tmp/tool-versions.txt && \
    sudo mv /tmp/tool-versions.txt /usr/local/share/tool-versions.txt

# Copy setup script for environment initialization
COPY setup.sh /usr/local/bin/setup.sh
RUN sudo chmod +x /usr/local/bin/setup.sh

# Add setup script to bashrc.d for automatic sourcing
RUN echo "source /usr/local/bin/setup.sh" >> /home/gitpod/.bashrc.d/999-setup

# Create a startup script to handle SSH service
RUN sudo sh -c 'echo "#!/bin/bash\n# Start SSH service\nsudo service ssh start\n\n# Execute the original command\nexec \"\$@\"" > /usr/local/bin/start-services.sh' && \
    sudo chmod +x /usr/local/bin/start-services.sh

# Set working directory to home
WORKDIR /home/gitpod

# Default command - start services and ensure bash is used
CMD ["/usr/local/bin/start-services.sh", "bash"]
