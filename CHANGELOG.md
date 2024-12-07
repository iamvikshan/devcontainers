# v1.0.0 (2024-12-07)

## 1.0.0 (2024-12-07)

### Features

- let's start over, shall we? update release workflows to prevent redundant triggers and enhance
  sync operations
  ([5aba3ef](https://github.com/iamvikshan/devcontainers/commit/5aba3ef22af4f11d7767f4c6de4876ad3c50d147))

* DevContainer configurations for Bun and Node.js, including package management and CI workflows
* sync operations
* Remove default Gitpod bun, all now use oven/bun image. Added setup.sh.
* Remove unnecessary release scopes from semantic-release configuration
* Update configuration files and add Prettier support
* Update semantic-release configuration and add new plugins for improved versioning and release
  notes

### Bug Fixes

- implement image size updater script and update README files with new sizes
  ([e6c2811](https://github.com/iamvikshan/devcontainers/commit/e6c2811ff805e7677f67cd99144e5ff6d1a81238))
- update advanced-git-sync action version to v1.1.5 in sync workflow
  ([18dda27](https://github.com/iamvikshan/devcontainers/commit/18dda275ce6dcc8d42ecfef0e62510ad056c0fc5))
- update GitHub Actions workflow and dependencies; upgrade checkout action and sync action version.
  Uprade bun to v1.1.38
  ([10bc7cd](https://github.com/iamvikshan/devcontainers/commit/10bc7cda116360c530b2d9a5a20d74a5d5983120))
- update sync configuration and enhance release workflow steps
  ([687909c](https://github.com/iamvikshan/devcontainers/commit/687909cbbfc24578ee1f5c75ba3e0eab8427e764))

* Add GitLab plugin to semantic-release configuration and streamline CI environment handling
* Add Husky pre-commit hook and update README with image sizes
* Change default username to root in Dockerfiles for bun and ubuntu environments
* enhance branch syncing by checking for updates before pushing to GitLab and GitHub to avoid
* infinite loop
* Enhance GitLab release configuration with buildx setup and improved error handling
* enhance GitLab sync and release workflows with tag existence check and README updates
* Enhance semantic-release configuration and improve error handling in GitLab release process
* preinstall curl and open-ssh
* Refactor GitLab release configuration for improved versioning and error handling
* remove GH_TOKEN from environment setup and clean up unused GHCR visibility functions
* Remove Husky pre-commit hook and update image size handling in README
* Remove outdated GitLab sync workflows and update GitHub sync configuration
* Remove package-lock.json from .gitignore
* Replace git-sync.yml with gitlab-sync.yml for improved synchronization with GitLab
* Update DevContainer Dockerfile to use Gitpod base image and streamline environment setup
* Update Dockerfiles to install OpenSSH client and curl, and configure SSH server for TCP forwarding
* Update GitHub sync configuration and enhance semantic-release setup
* update GitHub/Gitlab sync workflow and update image size handling in release workflows
* update GitLab API endpoint and correct image sizes in README files
* Update GitLab release configuration for buildx setup and disable TLS
* update GitLab sync workflow to include GITLAB_TOKEN and enhance size retrieval for images
* update username and split long action workflow
