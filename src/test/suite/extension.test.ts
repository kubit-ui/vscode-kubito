import * as assert from 'assert';
import * as vscode from 'vscode';

/**
 * Test suite for core extension functionality
 *
 * Validates that the Kubito extension loads properly, activates correctly,
 * and registers all expected commands and providers with VS Code.
 */
suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  /**
   * Verify that the extension is properly installed and discoverable
   */
  test('Extension should be present', () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    assert.ok(extension, 'Extension should be installed and discoverable');
  });

  /**
   * Test extension activation process
   * Ensures the extension can activate without errors
   */
  test('Extension should activate', async () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    assert.ok(extension, 'Extension must exist before activation test');

    if (extension && !extension.isActive) {
      await extension.activate();
    }

    assert.ok(extension?.isActive, 'Extension should be active after activation');
  });

  /**
   * Verify that all expected commands are registered with VS Code
   * Tests show, hide, and openEventSettings commands
   */
  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands();

    assert.ok(commands.includes('kubito.show'), 'kubito.show command should be registered');
    assert.ok(commands.includes('kubito.hide'), 'kubito.hide command should be registered');
    assert.ok(
      commands.includes('kubito.openEventSettings'),
      'kubito.openEventSettings command should be registered'
    );
  });

  test('Webview should be available in Explorer', async () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    assert.ok(extension?.isActive, 'Extension should be active');

    // Check that the extension contributes views to explorer
    const packageJSON = extension?.packageJSON;
    assert.ok(packageJSON?.contributes?.views?.explorer, 'Should contribute views to explorer');
  });
});
