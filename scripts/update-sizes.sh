#!/usr/bin/env bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Function to get repository ID from GitLab
get_repo_id() {
    local image_path="$1"
    local project_path="vikshan/devcontainers"
    local image_name
    image_name=$(basename "$image_path")
    
    if [ -z "$GITLAB_TOKEN" ]; then
        echo "Error: GITLAB_TOKEN not set in .env" >&2
        return 1
    fi
    
    local response
    response=$(curl -s \
        -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
        "https://gitlab.com/api/v4/projects/${project_path//\//%2F}/registry/repositories?tags=true")
    
    echo "$response" | jq -r ".[] | select(.name==\"$image_name\") | .id // 0"
}

get_ghcr_size() {
    local image="$1"
    local token
    token=$(curl -s "https://ghcr.io/token?scope=repository:$image:pull" | jq -r .token)

    local index
    index=$(curl -s -H "Authorization: Bearer $token" \
        -H "Accept: application/vnd.oci.image.index.v1+json" \
        "https://ghcr.io/v2/$image/manifests/latest")

    local digest
    digest=$(echo "$index" | jq -r '.manifests[] | select(.platform.architecture == "amd64") | .digest')
    
    local manifest
    manifest=$(curl -s -H "Authorization: Bearer $token" \
        -H "Accept: application/vnd.oci.image.manifest.v1+json" \
        "https://ghcr.io/v2/$image/manifests/$digest")

    local size
    size=$(echo "$manifest" | jq -r '[.layers[].size] | add / 1024 / 1024')
    printf "%.2f" "${size:-0}"
}

# Function to get image size from GitLab
get_gitlab_size() {
    local image_path="$1"
    local repo_id
    repo_id=$(get_repo_id "$image_path")
    
    if [ "$repo_id" = "0" ]; then
        echo "0.00"
        return 0
    fi
    
    local response
    response=$(curl -s \
        -H "PRIVATE-TOKEN: $GITLAB_TOKEN" \
        "https://gitlab.com/api/v4/registry/repositories/$repo_id?size=true")
    
    local size
    size=$(echo "$response" | jq -r '.size // 0 | . / 1024 / 1024' 2>/dev/null)
    printf "%.2f" "${size:-0}"
}

# Update README content
update_readme() {
    local readme="$1"
    local tmp_file
    tmp_file=$(mktemp)
    
    while IFS= read -r line; do
        local updated_line="$line"
        
        # For GitHub Container Registry
        for image in "${!images[@]}"; do
            if [ "${image:0:8}" = "ghcr.io/" ]; then
                if [[ $line =~ .*\`$image:latest\`.* ]]; then
                    size=${images[$image]}
                    if [ -n "$size" ]; then
                        updated_line=$(echo "$line" | sed -E "s/~[[:space:]]*[0-9]+(\.[0-9]+)?[[:space:]]*MiB/~ ${size} MiB/")
                    fi
                fi
            elif [[ $line =~ .*registry\.gitlab\.com/$image:latest.* ]]; then
                size=${images[$image]}
                if [ -n "$size" ]; then
                    updated_line=$(echo "$line" | sed -E "s/~[[:space:]]*[0-9]+(\.[0-9]+)?[[:space:]]*MiB/~ ${size} MiB/")
                fi
            fi
        done
        
        echo "$updated_line" >> "$tmp_file"
    done < "$readme"
    
    mv "$tmp_file" "$readme"
    echo "Updated $readme"
}

# Define images array
declare -A images=(
    ["ghcr.io/vixshan/devcontainers/bun"]=""
    ["ghcr.io/vixshan/devcontainers/bun-node"]=""
    ["ghcr.io/vixshan/devcontainers/ubuntu-bun"]=""
    ["ghcr.io/vixshan/devcontainers/ubuntu-bun-node"]=""
    ["vikshan/devcontainers/bun"]=""
    ["vikshan/devcontainers/bun-node"]=""
    ["vikshan/devcontainers/ubuntu-bun"]=""
    ["vikshan/devcontainers/ubuntu-bun-node"]=""
)

# Process all images
for image in "${!images[@]}"; do
    if [ "${image:0:8}" = "ghcr.io/" ]; then
        img_name=${image#ghcr.io/vixshan/devcontainers/}
        
        visibility=$(check_ghcr_visibility "$img_name")
        if [ "$visibility" != "public" ]; then
            echo "Making $image public..."
            make_ghcr_public "$img_name"
        fi
        
        size=$(get_ghcr_size "${image#ghcr.io/}")
    else
        size=$(get_gitlab_size "$image")
    fi
    images[$image]=$size
    echo "Retrieved size for $image: ${size} MiB"
done

# Define and process README files
READMES=(
    "README.md"
    "base/bun/README.md"
    "base/bun-node/README.md" 
    "base/ubuntu/README.md"
)

for readme in "${READMES[@]}"; do
    if [ -f "$readme" ]; then
        update_readme "$readme"
    fi
done