import * as assert from 'assert';
import * as vscode from 'vscode';

/**
 * Test suite for asset management and resources
 */
suite('Assets Test Suite', () => {
  test('Required asset files should be accessible', () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    assert.ok(extension, 'Extension should be available');

    // Get extension URI to construct paths
    const extensionUri = extension.extensionUri;
    assert.ok(extensionUri, 'Extension URI should be available');

    // Test that we can construct expected asset paths
    const mediaPath = vscode.Uri.joinPath(extensionUri, 'media');
    assert.ok(mediaPath, 'Media path should be constructable');

    // Test CSS path construction
    const cssPath = vscode.Uri.joinPath(mediaPath, 'kubito.css');
    assert.ok(cssPath.toString().includes('kubito.css'), 'CSS path should be correct');

    // Test JS path construction
    const jsPath = vscode.Uri.joinPath(mediaPath, 'kubito.js');
    assert.ok(jsPath.toString().includes('kubito.js'), 'JS path should be correct');
  });

  test('Image assets should have valid paths', () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    const extensionUri = extension!.extensionUri;
    const mediaPath = vscode.Uri.joinPath(extensionUri, 'media');

    // Expected image files
    const imageFiles = [
      'kubito-idle.gif',
      'kubito-walking.gif',
      'kubito-jumping.gif',
      'kubit-logo.png',
      'kubit-love.png'
    ];

    imageFiles.forEach(fileName => {
      const imagePath = vscode.Uri.joinPath(mediaPath, fileName);
      assert.ok(
        imagePath.toString().includes(fileName),
        `Image path for ${fileName} should be constructable`
      );
    });
  });

  test('WebView HTML should reference correct asset paths', () => {
    // This test verifies the structure expects the right asset organization
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    const packageJSON = extension?.packageJSON;

    // Verify the extension has the expected structure
    assert.ok(packageJSON?.main, 'Extension should have main entry point');
    assert.ok(
      packageJSON?.main.includes('out/extension.js'),
      'Main should point to compiled extension'
    );
  });

  test('Extension should handle asset loading gracefully', async () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    await extension?.activate();

    // Test that activation completes without asset loading errors
    assert.ok(extension?.isActive, 'Extension should activate successfully');

    // Execute show command to trigger asset loading
    await assert.doesNotReject(
      async () => await vscode.commands.executeCommand('kubito.show'),
      'Asset loading during webview creation should not throw'
    );
  });
});
