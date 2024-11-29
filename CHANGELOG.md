# v1.0.0 (2024-11-29)



## 1.0.0 (2024-11-29)

### Features

* let's start over, shall we? update release workflows to prevent redundant triggers and enhance sync operations ([5aba3ef](https://github.com/iamvikshan/devcontainers/commit/5aba3ef22af4f11d7767f4c6de4876ad3c50d147))

# v1.0.0 (2024-11-27)

## 1.0.0 (2024-11-27)

### Features

- let's start over, shall we? update release workflows to prevent redundant triggers and enhance
  sync operations
  ([5aba3ef](https://github.com/iamvikshan/devcontainers/commit/5aba3ef22af4f11d7767f4c6de4876ad3c50d147))

- DevContainer configurations for Bun and Node.js, including package management and CI workflows
- let's start over, shall we? update release workflows to prevent redundant triggers and enhance
- sync operations
- Remove default Gitpod bun, all now use oven/bun image. Added setup.sh.
- Remove unnecessary release scopes from semantic-release configuration
- Update configuration files and add Prettier support
- Update semantic-release configuration and add new plugins for improved versioning and release
  notes

### Bug Fixes

- Add GitLab plugin to semantic-release configuration and streamline CI environment handling
- Add Husky pre-commit hook and update README with image sizes
- Change default username to root in Dockerfiles for bun and ubuntu environments
- enhance branch syncing by checking for updates before pushing to GitLab and GitHub to avoid
- infinite loop
- Enhance GitLab release configuration with buildx setup and improved error handling
- enhance GitLab sync and release workflows with tag existence check and README updates
- Enhance semantic-release configuration and improve error handling in GitLab release process
- preinstall curl and open-ssh
- Refactor GitLab release configuration for improved versioning and error handling
- remove GH_TOKEN from environment setup and clean up unused GHCR visibility functions
- Remove Husky pre-commit hook and update image size handling in README
- Remove outdated GitLab sync workflows and update GitHub sync configuration
- Remove package-lock.json from .gitignore
- Replace git-sync.yml with gitlab-sync.yml for improved synchronization with GitLab
- Update DevContainer Dockerfile to use Gitpod base image and streamline environment setup
- Update Dockerfiles to install OpenSSH client and curl, and configure SSH server for TCP forwarding
- Update GitHub sync configuration and enhance semantic-release setup
- update GitHub/Gitlab sync workflow and update image size handling in release workflows
- update GitLab API endpoint and correct image sizes in README files
- Update GitLab release configuration for buildx setup and disable TLS
- update GitLab sync workflow to include GITLAB_TOKEN and enhance size retrieval for images
- update username and split long action workflow
