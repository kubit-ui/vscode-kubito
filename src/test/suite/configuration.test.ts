import * as assert from 'assert';
import * as vscode from 'vscode';

/**
 * Test suite for extension configuration and settings management
 *
 * Validates that the extension properly handles user configuration,
 * provides appropriate defaults, and gracefully handles missing settings.
 */
suite('Configuration Test Suite', () => {
  /**
   * Test graceful handling of missing or invalid configuration
   * Ensures the extension doesn't crash with default/missing settings
   */
  test('Extension should handle missing configuration gracefully', () => {
    const config = vscode.workspace.getConfiguration('kubito');

    // Configuration access should never throw, even for missing settings
    assert.doesNotThrow(() => {
      config.get('autoShow', true);
      config.get('someNonExistentSetting', 'default');
    }, 'Configuration access should be safe and provide defaults');
  });

  /**
   * Test that workspace configuration is properly accessible and structured
   * Validates the configuration system integration
   */
  test('Extension should respect workspace configuration', () => {
    const config = vscode.workspace.getConfiguration('kubito');

    // Configuration object should be available
    assert.ok(config !== null, 'Configuration should be accessible');

    // Test that default values are properly handled
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
