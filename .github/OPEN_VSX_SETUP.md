# Open VSX Registry Setup

This document explains how to configure the Open VSX Registry token for
automatic publishing.

## What is Open VSX?

[Open VSX Registry](https://open-vsx.org/) is an open-source alternative to the
VS Code Marketplace. It's used by:

- **VSCodium** - Open-source binaries of VS Code
- **Gitpod** - Cloud development environments
- **Eclipse Theia** - Cloud & Desktop IDE platform
- **Code-Server** - VS Code in the browser

## Creating an Open VSX Token

1. **Create an account** at https://open-vsx.org/

2. **Generate a Personal Access Token**:
   - Go to your profile: https://open-vsx.org/user-settings/tokens
   - Click "Generate New Token"
   - Give it a descriptive name (e.g., "GitHub Actions - vscode-kubito")
   - Copy the token (you won't be able to see it again!)

3. **Add the token to GitHub Secrets**:
   - Go to your repository on GitHub
   - Navigate to: `Settings` → `Secrets and variables` → `Actions`
   - Click `New repository secret`
   - Name: `OVSX_PAT`
   - Value: Paste your Open VSX token
   - Click `Add secret`

## Publishing Your Extension

### First-time Setup

Before the automated workflow can publish, you need to **manually publish the
first version** to claim the namespace:

1. Install the `ovsx` CLI:

   ```bash
   pnpm add -g ovsx
   ```

2. Package your extension:

   ```bash
   pnpm run package
   ```

3. Publish to Open VSX:

   ```bash
   ovsx publish *.vsix -p YOUR_OVSX_TOKEN
   ```

4. Verify at: https://open-vsx.org/extension/Kubit/vscode-kubito

### Automated Publishing

After the first manual publish, the GitHub Actions workflow will automatically:

- Publish to VS Code Marketplace
- Publish to Open VSX Registry
- Create GitHub Release
- Comment on the PR with both links

## Troubleshooting

### "Extension not found" error

- You need to manually publish the first version to claim the namespace
- Make sure the publisher name in `package.json` matches your Open VSX account

### "Invalid token" error

- Verify the `OVSX_PAT` secret is correctly set in GitHub
- Generate a new token if the old one expired

### "Extension already exists" error

- The extension was already published
- Check if you need to increment the version number

## Links

- Open VSX Registry: https://open-vsx.org/
- Open VSX Documentation: https://github.com/eclipse/openvsx/wiki
- ovsx CLI: https://github.com/eclipse/openvsx/tree/master/cli
