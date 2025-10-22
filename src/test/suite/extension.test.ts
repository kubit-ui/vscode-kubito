import * as assert from 'assert';
import * as vscode from 'vscode';

/**
 * Test suite for the main extension functionality
 */
suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('Kubit.vscode-kubito'));
  });

  test('Extension should activate', async () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    assert.ok(extension);

    if (extension && !extension.isActive) {
      await extension.activate();
    }

    assert.ok(extension?.isActive);
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands();

    assert.ok(commands.includes('kubito.show'));
    assert.ok(commands.includes('kubito.hide'));
  });

  test('Webview should be available in Explorer', async () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    assert.ok(extension?.isActive, 'Extension should be active');

    // Check that the extension contributes views to explorer
    const packageJSON = extension?.packageJSON;
    assert.ok(packageJSON?.contributes?.views?.explorer, 'Should contribute views to explorer');
  });

  test('Extension contributes should be present', () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    const packageJSON = extension?.packageJSON;

    assert.ok(packageJSON, 'Package JSON should be available');
    assert.ok(packageJSON.contributes, 'Should have contributes section');
    assert.ok(packageJSON.contributes.views, 'Should contribute views');
    assert.ok(packageJSON.contributes.commands, 'Should contribute commands');
  });
});
