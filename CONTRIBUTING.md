## Contributing

We welcome contributions to **vscode-kubito**! This project is open source and
we encourage community participation through **forks and pull requests**. All
contributions must be made through the fork workflow - we do not accept direct
pushes to the main repository.

### Why Fork-Based Contributing?

This project follows the **fork-based contribution model** to:

- Maintain code quality and security
- Ensure all changes are reviewed before merging
- Keep the main repository clean and stable
- Allow contributors to work independently on features

### Development Workflow

1. **Fork the Repository**: Click the "Fork" button in the upper right corner of
   the [vscode-kubito repository](https://github.com/kubit-ui/vscode-kubito) on
   GitHub. This will create a copy of the repository in your GitHub account.

2. **Clone Your Fork**: Clone your forked repository to your local machine (not
   the original repository).

   ```sh
   git clone https://github.com/your-username/vscode-kubito.git
   cd vscode-kubito
   ```

3. **Add Original Repository as Upstream**: Add the original repository as a
   remote to keep your fork synchronized.

   ```sh
   git remote add upstream https://github.com/kubit-ui/vscode-kubito.git
   git fetch upstream
   ```

4. **Create a Feature Branch**: Always create a new branch for your changes. Use
   proper branch naming conventions for automatic version detection.

   ```sh
   git checkout -b <branch-type>/<branch-name>
   ```

5. **Make Changes**:
   - Make your changes to the vscode-kubito codebase
   - Follow the coding standards outlined in our style guide
   - Add or update tests for your changes
   - Update documentation if necessary
   - Test your changes thoroughly using `pnpm test`

6. **Commit Changes**: Use conventional commit messages for automatic
   versioning.

   ```sh
   git commit -m "feat(animation): add new jumping animation for Kubito"
   ```

7. **Keep Your Fork Updated**: Before pushing, sync with the upstream
   repository.

   ```sh
   git fetch upstream
   git rebase upstream/main
   ```

8. **Push to Your Fork**: Push your changes to your forked repository (never to
   the original).

   ```sh
   git push origin <branch-name>
   ```

9. **Open a Pull Request**:
   - Go to the original
     [vscode-kubito repository](https://github.com/kubit-ui/vscode-kubito)
   - Click "New pull request"
   - Select "compare across forks"
   - Choose your fork and branch as the source
   - Fill out the PR template with details about your changes
   - Submit the pull request for review

### Development Guidelines

- **Follow TypeScript best practices**
- **Maintain test coverage above 90%**
- **Use ESLint configuration provided**
- **Follow Microsoft VS Code extension guidelines**
- **Update documentation for new features**

### Testing Your Changes

```sh
# Install dependencies
pnpm install

# Run tests
pnpm test

# Compile the extension
pnpm run compile

# Package the extension (optional)
pnpm run package
```

### Important Notes for Contributors

- **Never push directly** to the main vscode-kubito repository
- **Always work on your own fork** and create pull requests
- **Keep your fork synchronized** with the upstream repository
- **Test your extension** thoroughly before submitting
- **Include examples and documentation** of new features in your PR
- **Update README.md** with new functionality
- **Follow the existing code style** and patterns used in the project

### Branch Naming & Automatic Publishing

This repository uses conventional commits for version management.

#### Branch Naming Patterns

Use these branch prefixes for vscode-kubito development:

| Branch Pattern          | Version Bump | Example                 | Description                           |
| ----------------------- | ------------ | ----------------------- | ------------------------------------- |
| `feat/` or `feature/`   | **MINOR**    | `feat/new-animation`    | New features or animations for Kubito |
| `fix/` or `bugfix/`     | **PATCH**    | `fix/click-detection`   | Bug fixes in extension functionality  |
| `break/` or `breaking/` | **MAJOR**    | `break/api-changes`     | Breaking changes to extension API     |
| `hotfix/`               | **PATCH**    | `hotfix/critical-crash` | Urgent fixes                          |
| `chore/`                | **PATCH**    | `chore/update-deps`     | Maintenance tasks                     |

#### Advanced Version Detection

The system also analyzes your **PR title** and **description** for more precise
version detection:

##### MAJOR (Breaking Changes)

- `BREAKING CHANGE:` in PR description
- `!` in PR title (e.g., `feat!: redesign button API`)
- `[breaking]` tag in PR title
- Conventional commits with `!` (e.g., `feat(api)!: change interface`)

##### MINOR (New Features)

- PR titles starting with `feat:` or `feature:`
- `[feature]` tag in PR title
- Conventional commits like
  `feat(animation): add new walking animation for Kubito`

##### PATCH (Bug Fixes & Others)

- PR titles starting with `fix:` or `bugfix:`
- All other changes (default behavior)
- Conventional commits like `fix(webview): resolve click detection issue`

#### Examples for vscode-kubito

**Adding new Kubito animations:**

```sh
git checkout -b feat/sleeping-animation
# Make your changes in your fork
git commit -m "feat(animation): add sleeping animation when idle for 30 seconds"
# Create PR with title: "feat(animation): add sleeping animation"
# Result: MINOR version bump (e.g., 1.0.0 → 1.1.0)
```

**Fixing interaction bugs:**

```sh
git checkout -b fix/click-responsiveness
# Make your changes in your fork
git commit -m "fix(interaction): improve click detection for jumping animation"
# Create PR with title: "fix(interaction): improve click responsiveness"
# Result: PATCH version bump (e.g., 1.0.0 → 1.0.1)
```

**Breaking extension changes:**

```sh
git checkout -b break/new-webview-api
# Make your changes in your fork
git commit -m "feat!: redesign webview communication API for better performance"
# Create PR with title: "feat!: redesign webview API"
# PR description: "BREAKING CHANGE: Webview API has been redesigned for better performance..."
# Result: MAJOR version bump (e.g., 1.0.0 → 2.0.0)
```

### Important Notes for Contributors

- **Never push directly** to the main vscode-kubito repository
- Always work on **your own fork** and create pull requests
- Keep your fork **synchronized** with the upstream repository
- **Test your VS Code extension** thoroughly before submitting
- Include **examples and documentation** of new features in your PR
- Update **README.md** with new functionality
- Follow the existing **code style** and patterns used in the project
- **Test with different VS Code versions** to ensure compatibility
