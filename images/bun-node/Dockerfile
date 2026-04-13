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

RUN set -eu; \
  mkdir -p /usr/local/share; \
  tool_versions_file=/usr/local/share/tool-versions.txt; \
  write_metadata() { \
    key="$1"; \
    command="$2"; \
    value="$(sh -c "$command" 2>/dev/null || true)"; \
    value="$(printf '%s\n' "$value" | sed -n '1p')"; \
    if [ -z "$value" ]; then \
      value="unknown"; \
    fi; \
    echo "${key}=${value}" >> "$tool_versions_file"; \
  }; \
  echo "# DevContainer Tool Versions" > "$tool_versions_file"; \
  write_metadata "build_date" 'date -u +%Y-%m-%dT%H:%M:%SZ'; \
  write_metadata "base_image" "printf '%s' 'oven/bun:${VARIANT}'"; \
  write_metadata "bun_version" 'bun --version'; \
  write_metadata "zsh_version" "zsh --version | awk 'NR==1 { print \$2 }'"; \
  write_metadata "node_version" 'node --version'; \
  write_metadata "npm_version" 'npm --version'; \
  write_metadata "eslint_version" 'eslint --version'; \
  write_metadata "alpine_version" 'cat /etc/alpine-release'; \
  write_metadata "git_version" "git --version | awk 'NR==1 { print \$3 }'"; \
  write_metadata "curl_version" "curl --version | awk 'NR==1 { print \$2 }'"; \
  write_metadata "jq_version" "jq --version | awk -F- 'NR==1 { print \$2 }'"; \
  write_metadata "python_version" "python3 --version | awk 'NR==1 { print \$2 }'"; \
  write_metadata "btop_version" "btop --version | awk 'NR==1 { print \$NF }'"

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
