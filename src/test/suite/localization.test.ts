import * as assert from 'assert';
import {
  detectVSCodeLanguage,
  getUserPreferredLanguage,
  setLanguage,
  getCurrentTranslations,
  getCurrentLanguage,
  getAvailableLanguages,
  t,
  formatTranslation
} from '../../localization';

/**
 * Test suite for localization functionality
 *
 * Validates that the Kubito extension correctly detects VS Code language,
 * handles user language preferences, and provides proper translations.
 */
suite('Localization Test Suite', () => {
  /**
   * Test language detection functionality
   */
  test('Should detect VS Code language correctly', () => {
    const detectedLanguage = detectVSCodeLanguage();
    assert.ok(
      ['en', 'es', 'fr', 'de', 'pt', 'it'].includes(detectedLanguage),
      'Should return a supported language code'
    );
  });

  /**
   * Test available languages list
   */
  test('Should return correct available languages', () => {
    const languages = getAvailableLanguages();
    assert.ok(languages.includes('en'), 'Should include English');
    assert.ok(languages.includes('es'), 'Should include Spanish');
    assert.ok(languages.includes('fr'), 'Should include French');
    assert.ok(languages.includes('de'), 'Should include German');
    assert.ok(languages.includes('pt'), 'Should include Portuguese');
    assert.ok(languages.includes('it'), 'Should include Italian');
    assert.strictEqual(languages.length, 14, 'Should have exactly 14 languages');
  });

  /**
   * Test language switching functionality
   */
  test('Should switch language correctly', () => {
    // Test switching to English
    const enTranslations = setLanguage('en');
    assert.strictEqual(getCurrentLanguage(), 'en', 'Should set current language to English');
    assert.ok(enTranslations.messages, 'Should return translations object');
    assert.strictEqual(
      enTranslations.messages.letsCode,
      // eslint-disable-next-line quotes
      "Let's code! 🚀",
      'Should have English translation'
    );

    // Test switching to Spanish
    const esTranslations = setLanguage('es');
    assert.strictEqual(getCurrentLanguage(), 'es', 'Should set current language to Spanish');
    assert.strictEqual(
      esTranslations.messages.letsCode,
      '¡A programar! 🚀',
      'Should have Spanish translation'
    );
  });

  /**
   * Test auto language detection
   */
  test('Should handle auto language detection', () => {
    const autoTranslations = setLanguage('auto');
    const currentLang = getCurrentLanguage();
    assert.ok(
      ['en', 'es', 'fr', 'de', 'pt', 'it'].includes(currentLang),
      'Auto detection should return supported language'
    );
    assert.ok(autoTranslations.messages, 'Auto detection should return valid translations');
  });

  /**
   * Test translation function
   */
  test('Should translate messages correctly', () => {
    setLanguage('en');
    assert.strictEqual(
      t('messages.sleeping'),
      'Zzz...',
      'Should translate sleeping message in English'
    );

    setLanguage('es');
    assert.strictEqual(
      t('messages.letsCode'),
      '¡A programar! 🚀',
      'Should translate letsCode message in Spanish'
    );

    // Test non-existent key
    assert.strictEqual(
      t('messages.nonExistent'),
      'messages.nonExistent',
      'Should return key for non-existent translations'
    );
  });

  /**
   * Test translation formatting
   */
  test('Should format translations with placeholders', () => {
    const template = 'Failed to show Kubito: {error}';
    const formatted = formatTranslation(template, { error: 'Test error' });
    assert.strictEqual(
      formatted,
      'Failed to show Kubito: Test error',
      'Should replace placeholder correctly'
    );

    // Test with no values
    const noValues = formatTranslation(template);
    assert.strictEqual(
      noValues,
      'Failed to show Kubito: {error}',
      'Should preserve placeholder without values'
    );
  });

  /**
   * Test user preferred language detection
   */
  test('Should respect user language configuration', () => {
    const userLanguage = getUserPreferredLanguage();
    assert.ok(
      ['en', 'es', 'fr', 'de', 'pt', 'it'].includes(userLanguage),
      'User preferred language should be supported'
    );
  });

  /**
   * Test current translations retrieval
   */
  test('Should return current translations object', () => {
    setLanguage('en');
    const translations = getCurrentTranslations();

    assert.ok(translations.messages, 'Should have messages object');
    assert.ok(translations.commands, 'Should have commands object');
    assert.ok(translations.configuration, 'Should have configuration object');
    assert.ok(translations.notifications, 'Should have notifications object');

    // Test specific translations exist
    assert.ok(translations.messages.sleeping, 'Should have sleeping message');
    assert.ok(translations.messages.letsCode, 'Should have letsCode message');
    assert.ok(translations.commands.show, 'Should have show command');
    assert.ok(translations.commands.hide, 'Should have hide command');
  });

  /**
   * Test fallback to default language
   */
  test('Should fallback to default language for unsupported languages', () => {
    // This would test the internal behavior when an unsupported language is detected
    // Since we can't easily mock vscode.env.language, we test the setLanguage function
    const translations = setLanguage('zh' as any); // Truly unsupported language (Chinese)
    const currentLang = getCurrentLanguage();

    // Should fallback to English (default)
    assert.strictEqual(
      currentLang,
      'en',
      'Should fallback to default language for unsupported language'
    );
    assert.strictEqual(
      translations.messages.letsCode,
      // eslint-disable-next-line quotes
      "Let's code! 🚀",
      'Should use English translations as fallback'
    );
  });
});
