# Alpine-based Dockerfile for Bun + Node.js runtime
ARG VARIANT=alpine
FROM oven/bun:${VARIANT}

ARG VARIANT
ARG USERNAME=root

RUN apk add --no-cache \
  zsh \
  git \
  sudo \
  curl \
  jq \
  python3 \
  btop \
  nodejs \
  npm \
  && npm install -g eslint

RUN mkdir -p /usr/local/share \
  && echo "# DevContainer Tool Versions" > /usr/local/share/tool-versions.txt \
  && echo "build_date=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /usr/local/share/tool-versions.txt \
  && echo "base_image=oven/bun:${VARIANT}" >> /usr/local/share/tool-versions.txt \
  && echo "bun_version=$(bun --version)" >> /usr/local/share/tool-versions.txt \
  && echo "zsh_version=$(zsh --version | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt \
  && echo "node_version=$(node --version)" >> /usr/local/share/tool-versions.txt \
  && echo "npm_version=$(npm --version)" >> /usr/local/share/tool-versions.txt \
  && echo "eslint_version=$(eslint --version | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt \
  && echo "alpine_version=$(cat /etc/alpine-release)" >> /usr/local/share/tool-versions.txt \
  && echo "git_version=$(git --version | cut -d' ' -f3)" >> /usr/local/share/tool-versions.txt \
  && echo "curl_version=$(curl --version | head -n1 | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt \
  && echo "jq_version=$(jq --version | cut -d'-' -f2)" >> /usr/local/share/tool-versions.txt \
  && echo "python_version=$(python3 --version | cut -d' ' -f2)" >> /usr/local/share/tool-versions.txt \
  && echo "btop_version=$(btop --version | head -n1)" >> /usr/local/share/tool-versions.txt

COPY setup.zsh /usr/local/bin/setup.zsh
RUN chmod +x /usr/local/bin/setup.zsh

RUN if [ "${USERNAME}" != "root" ]; then \
        adduser -D -s /bin/zsh "${USERNAME}" && \
        addgroup "${USERNAME}" wheel && \
        echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers && \
        HOME_DIR="/home/${USERNAME}"; \
    else \
        HOME_DIR="/root"; \
    fi && \
    git clone --depth=1 https://github.com/ohmyzsh/ohmyzsh.git "${HOME_DIR}/.oh-my-zsh" && \
    git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions "${HOME_DIR}/.oh-my-zsh/custom/plugins/zsh-autosuggestions" && \
    git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting "${HOME_DIR}/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting" && \
    printf '%s\n' 'source /usr/local/bin/setup.zsh' > "${HOME_DIR}/.zshrc" && \
    if [ "${USERNAME}" != "root" ]; then \
        chown -R "${USERNAME}:${USERNAME}" "${HOME_DIR}"; \
    fi

USER ${USERNAME}
CMD ["/bin/zsh"]
