#!/usr/bin/env bash
set -euo pipefail

REGISTRY="ghcr.io/iamvikshan/devcontainer"
WAIT_TIME=30 # Seconds to wait for GHCR tag propagation between tiers

build_and_push() {
    local img_name=$1
    local img_dir="images/${img_name}"
    local tag="${REGISTRY}/${img_name}:latest"
    local log_file="${img_dir}/build_log.txt"

    echo "--------------------------------------------------------"
    echo "=> [BUILDING] ${img_name} -> ${tag}"
    echo "=> Logging to ${log_file}"
    echo "--------------------------------------------------------"

    # Build and redirect both stdout and stderr to the log file
    docker build -t "${tag}" --progress=plain "${img_dir}" > "${log_file}" 2>&1

    echo "=> [PUSHING]  ${tag}"
    docker push "${tag}"
    echo "=> [SUCCESS]  ${img_name} published successfully."
    echo ""
}

# --------------------------------------------------------
# Wave 1: Root Base Images
# --------------------------------------------------------
echo "=== WAVE 1: Building Root Bases ==="
build_and_push "ubuntu"
build_and_push "bun"

echo "=== Pausing ${WAIT_TIME}s for Wave 1 GHCR tag propagation ==="
sleep "${WAIT_TIME}"

# --------------------------------------------------------
# Wave 2: First-Level Dependent Images
# --------------------------------------------------------
echo "=== WAVE 2: Building First-Level Dependents ==="
build_and_push "ubun-tu"
build_and_push "ubun-tu-node"
build_and_push "bunode"

echo "=== Pausing ${WAIT_TIME}s for Wave 2 GHCR tag propagation ==="
sleep "${WAIT_TIME}"

# --------------------------------------------------------
# Wave 3: Second-Level Dependent Images
# --------------------------------------------------------
echo "=== WAVE 3: Building Final Dependent Images ==="
build_and_push "agents"

echo "--------------------------------------------------------"
echo "All 6 containers built, logged, and pushed successfully!"