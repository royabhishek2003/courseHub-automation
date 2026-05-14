export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting, missing semicolons, etc.
        'refactor', // Code restructuring
        'perf',     // Performance improvement
        'test',     // Adding tests
        'build',    // Build system or dependencies
        'ci',       // CI/CD changes
        'chore',    // Maintenance tasks
        'revert',   // Revert a commit
      ],
    ],
    'subject-case': [0],
  },
}
