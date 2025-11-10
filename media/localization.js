/**
 * Webview localization utilities
 * This module provides translation functions for the Kubito webview
 */
/**
 * Global translations object for the webview
 * This will be injected by the extension backend
 */
let webviewTranslations = {
    sleeping: 'Zzz...',
    letsCoding: 'Let\'s code! 🚀',
    coffee: 'Coffee? ☕️',
    vivaKubit: 'Viva Kubit!',
    kubitLogo: 'Kubit Logo',
    kubitLove: 'Kubit Love'
};
/**
 * Sets the translations for the webview
 * Called by the extension backend when language changes
 */
window.setKubitoTranslations = (translations) => {
    webviewTranslations = translations;
};
/**
 * Gets a translated message for the webview
 * @param key - The translation key
 * @returns The translated message
 */
export function getWebviewTranslation(key) {
    return webviewTranslations[key] || key;
}
/**
 * Gets all webview translations
 * @returns The complete translations object
 */
export function getWebviewTranslations() {
    return webviewTranslations;
}
//# sourceMappingURL=localization.js.map