// release.config.js
module.exports = {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'feat', release: 'minor' },
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
        },
      },
    ],
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle: '# Changelog',
      },
    ],
    // Conditionally include GitHub or GitLab plugin based on CI environment
    ...(process.env.GITLAB_CI
      ? ['@semantic-release/gitlab']
      : [
          [
            '@semantic-release/github',
            {
              assets: ['CHANGELOG.md'],
            },
          ],
        ]),
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};
