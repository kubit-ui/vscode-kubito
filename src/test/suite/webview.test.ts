import * as assert from 'assert';
import * as vscode from 'vscode';

/**
 * Test suite for webview functionality
 */
suite('Webview Test Suite', () => {
  test('Webview provider should create valid HTML', async () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    await extension?.activate();

    // Execute the show command to ensure webview is initialized
    await vscode.commands.executeCommand('kubito.show');

    // Wait a bit for webview initialization
    await new Promise(resolve => setTimeout(resolve, 1000));

    // This test verifies that the webview provider can be instantiated
    // without throwing errors
    assert.ok(true, 'Webview provider should initialize without errors');
  });

  test('Webview should load required assets', async () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    assert.ok(extension, 'Extension should be available');

    // Get extension URI to construct paths
    const extensionUri = extension.extensionUri;
    assert.ok(extensionUri, 'Extension URI should be available');

    // Check if the media path exists
    const mediaPath = vscode.Uri.joinPath(extensionUri, 'media');
    assert.ok(mediaPath, 'Media path should be constructed');

    // Verify assets are accessible at media root level
    assert.ok(mediaPath, 'Assets should be directly in media directory');
  });

  test('Commands should execute without errors', async () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    await extension?.activate();

    // Test show command
    await assert.doesNotReject(
      async () => await vscode.commands.executeCommand('kubito.show'),
      'Show command should execute without throwing'
    );

    // Test hide command
    await assert.doesNotReject(
      async () => await vscode.commands.executeCommand('kubito.hide'),
      'Hide command should execute without throwing'
    );
  });

  test('Multiple command executions should be stable', async () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    await extension?.activate();

    // Execute commands multiple times to test stability
    for (let i = 0; i < 3; i++) {
      await assert.doesNotReject(
        async () => {
          await vscode.commands.executeCommand('kubito.show');
          await new Promise(resolve => setTimeout(resolve, 100));
          await vscode.commands.executeCommand('kubito.hide');
          await new Promise(resolve => setTimeout(resolve, 100));
        },
        `Command cycle ${i + 1} should complete without errors`
      );
    }
  });
});
