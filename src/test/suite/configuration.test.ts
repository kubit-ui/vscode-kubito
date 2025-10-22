import * as assert from 'assert';
import * as vscode from 'vscode';

/**
 * Test suite for configuration and settings
 */
suite('Configuration Test Suite', () => {
  test('Extension should handle missing configuration gracefully', () => {
    // Test that extension doesn't crash with default configuration
    const config = vscode.workspace.getConfiguration('kubito');

    // These should not throw even if not configured
    assert.doesNotThrow(() => {
      config.get('autoShow', true);
      config.get('someNonExistentSetting', 'default');
    }, 'Configuration access should be safe');
  });

  test('Extension should respect workspace configuration', () => {
    const config = vscode.workspace.getConfiguration('kubito');

    // Test configuration exists and has expected structure
    assert.ok(config !== null, 'Configuration should be accessible');

    // Test default values work
    const autoShow = config.get('autoShow', true);

    assert.ok(typeof autoShow === 'boolean', 'autoShow should be boolean');
  });

  test('Package.json should have valid configuration schema', () => {
    const extension = vscode.extensions.getExtension('Kubit.vscode-kubito');
    const packageJSON = extension?.packageJSON;

    assert.ok(packageJSON?.contributes?.configuration, 'Should contribute configuration');

    const configProperties = packageJSON.contributes.configuration.properties;
    assert.ok(configProperties, 'Should have configuration properties');

    // Check specific configuration properties exist
    assert.ok(configProperties['kubito.autoShow'], 'Should have autoShow configuration');
    assert.equal(
      configProperties['kubito.autoShow'].type,
      'boolean',
      'autoShow should be boolean type'
    );
    assert.equal(
      configProperties['kubito.autoShow'].default,
      true,
      'autoShow should default to true'
    );
  });
});
