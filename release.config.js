/** @format */

// release.config.js
module.exports = {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        // Allow minor/patch releases to create first release
        preset: 'angular',
        releaseRules: [
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'feat', release: 'minor' },
          // Special case for first release
          { type: 'fix', release: 'minor', beforeRelease: true },
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
    [
      '@semantic-release/github',
      {
        assets: ['CHANGELOG.md'],
      },
    ],
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
