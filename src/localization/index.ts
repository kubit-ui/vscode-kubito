/**
 * Localization module for Kubito extension
 * Handles language detection and message translation
 */

import * as vscode from 'vscode';

// Import translation files
import enTranslations from './en.json';
import esTranslations from './es.json';
import frTranslations from './fr.json';
import deTranslations from './de.json';
import ptTranslations from './pt.json';
import itTranslations from './it.json';

/**
 * Supported languages interface with all available messages
 */
export interface ITranslations {
  messages: {
    sleeping: string;
    letsCode: string;
    coffee: string;
    vivaKubit: string;
    kubitLogo: string;
    kubitLove: string;
    debugTime: string;
    noMoreBugs: string;
    commitTime: string;
    syntaxError: string;
    workingLate: string;
    mondayBlues: string;
    fridayFeeling: string;
    stackOverflow: string;
    gitPush: string;
    dockerizing: string;
    keepCoding: string;
    almostThere: string;
    greatCode: string;
    refactorTime: string;
    testsPassing: string;
    cleanCode: string;
    oneMoreBug: string;
    scriptKiddie: string;
    fullStack: string;
    deployFriday: string;
    helloWorld: string;
    infiniteLoop: string;
    nullPointer: string;
    recursion: string;
    leetCode: string;
    algorithm: string;
    bigO: string;
    asyncAwait: string;
    callback: string;
    promise: string;
    caffeinated: string;
    tired: string;
    eureka: string;
    frustrated: string;
    productive: string;
    procrastinating: string;
    inspired: string;
    rubberDuck: string;
    imposter: string;
    genius: string;
    reactTime: string;
    nodeJs: string;
    python: string;
    javascript: string;
    typescript: string;
    cssLife: string;
    htmlBasic: string;
    gitMerge: string;
    vscode: string;
    terminal: string;
    lunchTime: string;
    breakTime: string;
    overtime: string;
    earlyBird: string;
    nightOwl: string;
    weekend: string;
    vacation: string;
    deadline: string;
    crunchTime: string;
    chillin: string;
    existential: string;
    matrix: string;
    binary: string;
    quantum: string;
    artificial: string;
    singularity: string;
    metaverse: string;
    blockchain: string;
    cloud: string;
    serverless: string;
  };
  commands: {
    show: string;
    hide: string;
  };
  configuration: {
    autoShow: string;
    language: string;
  };
  notifications: {
    showError: string;
    hideInfo: string;
    hideConfirm: string;
  };
}

/**
 * Available translations map
 */
const TRANSLATIONS: Record<string, ITranslations> = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
  pt: ptTranslations,
  it: itTranslations
} as const;

/**
 * Supported language codes
 */
export type SupportedLanguage = keyof typeof TRANSLATIONS;

/**
 * Default fallback language
 */
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/**
 * Current active language
 */
let currentLanguage: SupportedLanguage = DEFAULT_LANGUAGE;

/**
 * Detects the VS Code language and returns the best matching supported language
 * @returns The detected language code or default fallback
 */
export function detectVSCodeLanguage(): SupportedLanguage {
  try {
    // Get VS Code's display language
    const vscodeLanguage = vscode.env.language;

    if (!vscodeLanguage) {
      return DEFAULT_LANGUAGE;
    }

    // Extract the base language code (e.g., 'es-ES' -> 'es')
    const baseLanguage = vscodeLanguage.split('-')[0]?.toLowerCase();

    // Check if we support this language
    if (baseLanguage && baseLanguage in TRANSLATIONS) {
      return baseLanguage as SupportedLanguage;
    }

    // Fallback to default language
    return DEFAULT_LANGUAGE;
  } catch {
    // If language detection fails, return default
    return DEFAULT_LANGUAGE;
  }
}

/**
 * Gets the user's preferred language from configuration or auto-detects
 * @returns The language to use for translations
 */
export function getUserPreferredLanguage(): SupportedLanguage {
  try {
    const config = vscode.workspace.getConfiguration('kubito');
    const userLanguage = config.get<string>('language');

    // If user has set a specific language preference
    if (userLanguage && userLanguage in TRANSLATIONS) {
      return userLanguage as SupportedLanguage;
    }

    // If set to 'auto' or not set, detect from VS Code
    return detectVSCodeLanguage();
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

/**
 * Initializes the localization system
 * Should be called when the extension activates
 */
export function initializeLocalization(): void {
  currentLanguage = getUserPreferredLanguage();
}

/**
 * Updates the current language and returns the new translations
 * @param language - The language to switch to, or 'auto' to detect
 * @returns The updated translations object
 */
export function setLanguage(language: SupportedLanguage | 'auto'): ITranslations {
  if (language === 'auto') {
    currentLanguage = detectVSCodeLanguage();
  } else if (language in TRANSLATIONS) {
    currentLanguage = language;
  } else {
    currentLanguage = DEFAULT_LANGUAGE;
  }

  return getCurrentTranslations();
}

/**
 * Gets the current active translations
 * @returns The current translations object
 */
export function getCurrentTranslations(): ITranslations {
  const translations = TRANSLATIONS[currentLanguage] || TRANSLATIONS[DEFAULT_LANGUAGE];
  if (!translations) {
    throw new Error(`No translations found for language: ${currentLanguage}`);
  }
  return translations;
}

/**
 * Gets the current active language code
 * @returns The current language code
 */
export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}

/**
 * Gets all available languages
 * @returns Array of supported language codes
 */
export function getAvailableLanguages(): SupportedLanguage[] {
  return Object.keys(TRANSLATIONS) as SupportedLanguage[];
}

/**
 * Formats a translation string with placeholders
 * @param template - The translation string with {placeholder} markers
 * @param values - Object with values to replace placeholders
 * @returns The formatted string
 */
export function formatTranslation(template: string, values: Record<string, string> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] || match;
  });
}

/**
 * Gets a translated message from the current language pack
 * @param key - The message key to translate
 * @param values - Optional values for placeholder replacement
 * @returns The translated and formatted message
 */
export function t(key: string, values?: Record<string, string>): string {
  const translations = getCurrentTranslations();

  // Navigate through nested object using dot notation (e.g., 'messages.sleeping')
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Return the key itself as fallback if translation not found
      return key;
    }
  }

  if (typeof value === 'string') {
    return values ? formatTranslation(value, values) : value;
  }

  // Return key as fallback
  return key;
}
