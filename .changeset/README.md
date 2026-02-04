# Changesets

This directory contains changesets for managing version bumps and changelog
generation.

## What are changesets?

Changesets are a way to manage versioning and changelogs with a focus on
monorepos. They help automate the process of versioning packages and generating
changelogs.

## How to use

When you make changes that should be released:

1. Run `pnpm changeset` to create a new changeset
2. Select the type of change (major, minor, or patch)
3. Write a summary of the changes
4. Commit the changeset file along with your changes

The CI/CD pipeline will automatically:

- Version the package based on changesets
- Update the CHANGELOG.md
- Publish the extension to the VS Code Marketplace
- Create a GitHub release

## Automatic Release Process

This project uses an **automatic release workflow**:

1. **On PR merge to `cms`**: The workflow automatically:
   - Detects version bump type from commits (feat → minor, fix → patch, break →
     major)
   - Creates a changeset automatically
   - Updates version and CHANGELOG
   - Publishes to VS Code Marketplace
   - Creates GitHub release

2. **Manual changesets** (optional): You can still create manual changesets if
   needed:
   ```bash
   pnpm changeset
   ```

## Learn more

- [Changesets documentation](https://github.com/changesets/changesets)
- [Semantic Versioning](https://semver.org/)
