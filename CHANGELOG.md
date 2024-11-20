# v1.0.0 (2024-11-20)



## 1.0.0 (2024-11-20)

### Features

* DevContainer configurations for Bun and Node.js, including package management and CI workflows ([abd8162](https://github.com/vixshan/devcontainers/commit/abd8162cfd7468273902bbd09db65d453b33c5be))
* let's start over, shall we? update release workflows to prevent redundant triggers and enhance sync operations ([01320f0](https://github.com/vixshan/devcontainers/commit/01320f0d4482208c29635aa9636aac6056326771))
* Remove default Gitpod bun, all now use oven/bun image. Added setup.sh. ([f091daa](https://github.com/vixshan/devcontainers/commit/f091daa965d27bab73c3a4be82f21637dc53ef01))
* Remove unnecessary release scopes from semantic-release configuration ([aa95ce5](https://github.com/vixshan/devcontainers/commit/aa95ce565e346b5684c7026ed341ac8a40fac869))
* Update configuration files and add Prettier support ([a6d89f0](https://github.com/vixshan/devcontainers/commit/a6d89f0befbc98b8f4ad9cf60da3ca15661fb103))
* Update semantic-release configuration and add new plugins for improved versioning and release notes ([48d9d8e](https://github.com/vixshan/devcontainers/commit/48d9d8e20cf31a5d5201ad8fc18056c11fd84ab0))

### Bug Fixes

* Add GitLab plugin to semantic-release configuration and streamline CI environment handling ([1bca4a4](https://github.com/vixshan/devcontainers/commit/1bca4a4f0ecd42f4d4f7b116556b770473c38a3f))
* Add Husky pre-commit hook and update README with image sizes ([14c7c7f](https://github.com/vixshan/devcontainers/commit/14c7c7fb645af676e42203d95b9c014da28d59f8))
* Change default username to root in Dockerfiles for bun and ubuntu environments ([f5455d1](https://github.com/vixshan/devcontainers/commit/f5455d1e416ababb5b0c3b6ee93f6fb96cd5656f))
* enhance branch syncing by checking for updates before pushing to GitLab and GitHub to avoid infinite loop ([7219dfa](https://github.com/vixshan/devcontainers/commit/7219dfaa2adf7c665422d7afa355d135f3cf91a4))
* Enhance GitLab release configuration with buildx setup and improved error handling ([21cd75a](https://github.com/vixshan/devcontainers/commit/21cd75a4ff375fe45715b224d311d844f81e9ea6))
* enhance GitLab sync and release workflows with tag existence check and README updates ([cf594bb](https://github.com/vixshan/devcontainers/commit/cf594bb8f1ff7adea76f827029354f2ae8ac6a63))
* Enhance semantic-release configuration and improve error handling in GitLab release process ([c51097b](https://github.com/vixshan/devcontainers/commit/c51097bc7599d4bea7cd36dfe5a46b491f6de50b))
* preinstall curl and open-ssh ([0d3879e](https://github.com/vixshan/devcontainers/commit/0d3879ef5e47973994a59ab9c6a81afd08365937))
* Refactor GitLab release configuration for improved versioning and error handling ([cd2fa81](https://github.com/vixshan/devcontainers/commit/cd2fa8173ce07f3c5e199f99a26cb1bf3a5ab737))
* remove GH_PAT from environment setup and clean up unused GHCR visibility functions ([f49eb5d](https://github.com/vixshan/devcontainers/commit/f49eb5dd89d26d37556361a3b875a7977f3f1dfd))
* Remove Husky pre-commit hook and update image size handling in README ([4196303](https://github.com/vixshan/devcontainers/commit/4196303af9414610fbd2ed1f81a69389ae3a358c))
* Remove outdated GitLab sync workflows and update GitHub sync configuration ([4fb9abc](https://github.com/vixshan/devcontainers/commit/4fb9abcc5c3064c1bf2f791ed735959ffd9f87e8))
* Remove package-lock.json from .gitignore ([f28ef08](https://github.com/vixshan/devcontainers/commit/f28ef080e4f32db1e043ff1b87ade9dbd7fe5193))
* Replace git-sync.yml with gitlab-sync.yml for improved synchronization with GitLab ([bfd7de5](https://github.com/vixshan/devcontainers/commit/bfd7de5057240e50eb60a8ae38e48b3ff1cd66c9))
* Update DevContainer Dockerfile to use Gitpod base image and streamline environment setup ([80d0d22](https://github.com/vixshan/devcontainers/commit/80d0d22f74c1ecdd18a57c842248387aac2d8c17))
* Update Dockerfiles to install OpenSSH client and curl, and configure SSH server for TCP forwarding ([880293a](https://github.com/vixshan/devcontainers/commit/880293afabf11ef244c5d133b8578cea467cb473))
* Update GitHub sync configuration and enhance semantic-release setup ([e4bd808](https://github.com/vixshan/devcontainers/commit/e4bd808bac2e5f80fbcda5038cd844cb9085b1c3))
* update GitHub/Gitlab sync workflow and update image size handling in release workflows ([d6bad7d](https://github.com/vixshan/devcontainers/commit/d6bad7d2c6f05b7a9bc1158de9d6106d09eae015))
* update GitLab API endpoint and correct image sizes in README files ([765ba6c](https://github.com/vixshan/devcontainers/commit/765ba6c877c8c7452824b44c8e065c50d2e6025e))
* Update GitLab release configuration for buildx setup and disable TLS ([ea8ca8d](https://github.com/vixshan/devcontainers/commit/ea8ca8d47517f5f20d7a39b54d0258241269aab0))
