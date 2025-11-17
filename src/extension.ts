import * as vscode from 'vscode';
import {
  initializeLocalization,
  t,
  formatTranslation,
  getCurrentTranslations
} from './localization';
import { ProductivityManager } from './core/productivity';

/**
 * Message interface for Kubito's communication system
 */
interface IMessage {
  readonly type: 'emoji' | 'text' | 'image';
  readonly content: string;
  readonly alt?: string;
}

/**
 * Interface for the Kubito webview provider that extends VS Code's WebviewViewProvider
 * This interface ensures proper typing for our webview implementation
 */
interface IKubitoWebviewProvider extends vscode.WebviewViewProvider {
  resolveWebviewView(
    _webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void | Promise<void>;
}

/**
 * Global reference to the Kubito webview provider instance
 * Used to manage the extension's lifecycle and webview state
 */
let kubitoWebviewProvider: KubitoWebviewProvider | undefined;

/**
 * Check if a specific event type is enabled in user settings
 * @param eventType - The event type to check (fileSave, gitCommit, gitPush)
 * @returns Whether the event is enabled
 */
function isEventEnabled(eventType: string): boolean {
  const config = vscode.workspace.getConfiguration('kubito.events');
  return config.get<boolean>(eventType, true); // Default to true if not set
}

/**
 * Extension activation function
 * @param context - VS Code extension context
 */
export function activate(context: vscode.ExtensionContext): void {
  // Initialize the localization system
  initializeLocalization();

  // Create the webview provider for the Explorer view
  kubitoWebviewProvider = new KubitoWebviewProvider(context);

  // Register the webview provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('kubito', kubitoWebviewProvider)
  );

  // Register commands
  registerCommands(context);

  // Register editor event listeners
  registerEditorEventListeners(context);

  // Listen for configuration changes
  registerConfigurationListener(context);

  // Auto-show Kubito if configured
  void autoShowKubito();
}

/**
 * Register all extension commands with proper error handling
 * @param context - VS Code extension context for managing command lifecycle
 */
function registerCommands(context: vscode.ExtensionContext): void {
  // Command to show Kubito by focusing the webview
  const showKubitoCommand = vscode.commands.registerCommand(
    'kubito.show',
    async (): Promise<void> => {
      try {
        await vscode.commands.executeCommand('kubito.focus');
      } catch (error) {
        // Log error without using console in production
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        void vscode.window.showErrorMessage(
          formatTranslation(t('notifications.showError'), { error: errorMessage })
        );
      }
    }
  );

  // Command to provide instructions for hiding Kubito
  // Note: Webview panels cannot be programmatically hidden, only collapsed manually
  const hideKubitoCommand = vscode.commands.registerCommand(
    'kubito.hide',
    async (): Promise<void> => {
      void vscode.window.showInformationMessage(
        t('notifications.hideInfo'),
        t('notifications.hideConfirm')
      );
    }
  );

  // Command to quickly open event configuration settings
  const openEventSettingsCommand = vscode.commands.registerCommand(
    'kubito.openEventSettings',
    async (): Promise<void> => {
      await vscode.commands.executeCommand('workbench.action.openSettings', 'kubito.events');
    }
  );

  // Command to show productivity metrics
  const showMetricsCommand = vscode.commands.registerCommand(
    'kubito.showMetrics',
    async (): Promise<void> => {
      if (kubitoWebviewProvider) {
        const insights = kubitoWebviewProvider.getProductivityInsights();
        if (insights) {
          const message = `📊 **Productivity Metrics**

⏱️ Session: ${insights.sessionDuration}
📝 ${insights.linesPerHour} lines/hour
📂 ${insights.filesModified} files modified
🏆 Score: ${insights.productivityScore}/100
💻 Main language: ${insights.mostActiveLanguage}`;

          void vscode.window.showInformationMessage(message, { modal: false });
        } else {
          void vscode.window.showInformationMessage(
            'No metrics available yet. Start coding to see your productivity stats!'
          );
        }
      }
    }
  );

  context.subscriptions.push(
    showKubitoCommand,
    hideKubitoCommand,
    openEventSettingsCommand,
    showMetricsCommand
  );
}

/**
 * Register Git event listeners using file system watchers
 * @param context - VS Code extension context for managing listener lifecycle
 */
function registerGitListeners(context: vscode.ExtensionContext): void {
  // Detect successful commits - when Git log is updated
  const logsWatcher = vscode.workspace.createFileSystemWatcher('**/.git/logs/HEAD');

  logsWatcher.onDidChange(() => {
    if (!kubitoWebviewProvider || !isEventEnabled('gitCommit')) {
      return;
    }

    kubitoWebviewProvider.triggerMessage({
      content: t('messages.committed'),
      type: 'text'
    });
  });

  // Detect push/pull operations - when remote ref logs change (more reliable)
  const refsLogsWatcher = vscode.workspace.createFileSystemWatcher('**/.git/logs/refs/remotes/**');

  refsLogsWatcher.onDidChange(() => {
    if (!kubitoWebviewProvider || !isEventEnabled('gitPush')) {
      return;
    }

    kubitoWebviewProvider.triggerMessage({
      content: t('messages.pushed'),
      type: 'text'
    });
  });

  context.subscriptions.push(logsWatcher, refsLogsWatcher);
}

/**
 * Register editor and terminal event listeners for Git reactions
 * @param context - VS Code extension context for managing listener lifecycle
 */
function registerEditorEventListeners(context: vscode.ExtensionContext): void {
  // Listen for file save events
  const onSaveListener = vscode.workspace.onDidSaveTextDocument(() => {
    if (!kubitoWebviewProvider || !isEventEnabled('fileSave')) {
      return;
    }

    kubitoWebviewProvider.triggerMessage({
      content: '💾',
      type: 'emoji'
    });
  });

  // Register Git listeners
  registerGitListeners(context);

  context.subscriptions.push(onSaveListener);
}

/**
 * Register configuration change listener to update language dynamically
 * @param context - VS Code extension context for managing listener lifecycle
 */
function registerConfigurationListener(context: vscode.ExtensionContext): void {
  const configChangeListener = vscode.workspace.onDidChangeConfiguration(event => {
    // Check if any Kubito configuration changed
    if (event.affectsConfiguration('kubito.language')) {
      // Re-initialize localization with new language
      initializeLocalization();

      // Refresh webview to apply new language (full refresh needed for translations)
      if (kubitoWebviewProvider) {
        kubitoWebviewProvider.refresh();
      }
    }

    if (
      event.affectsConfiguration('kubito.contextualMessages') ||
      event.affectsConfiguration('kubito.autoShow')
    ) {
      // Update webview configuration without full refresh (more efficient)
      if (kubitoWebviewProvider) {
        kubitoWebviewProvider.updateConfig();
      }
    }

    if (event.affectsConfiguration('kubito.productivity')) {
      // Update productivity manager configuration
      if (kubitoWebviewProvider) {
        kubitoWebviewProvider.updateProductivityConfig();
      }
    }
  });

  context.subscriptions.push(configChangeListener);
}

/**
 * Auto-show Kubito if the user setting is enabled
 * Uses a small delay to ensure VS Code is fully initialized
 */
async function autoShowKubito(): Promise<void> {
  // Delay to ensure VS Code workspace and views are properly initialized
  setTimeout(async (): Promise<void> => {
    try {
      const config = vscode.workspace.getConfiguration('kubito');
      const autoShow = config.get<boolean>('autoShow', true) as boolean;

      if (autoShow) {
        await vscode.commands.executeCommand('kubito.show');
      }
    } catch {
      // Silently fail for auto-show to avoid disrupting user experience
      // The user can manually show Kubito using the command
    }
  }, 500);
}

/**
 * Webview provider implementation for Kubito companion
 * Manages the lifecycle and content of the Kubito webview panel
 */
class KubitoWebviewProvider implements IKubitoWebviewProvider {
  private _view: vscode.WebviewView | undefined;
  private _productivityManager: ProductivityManager | undefined;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  /**
   * Resolve the webview view when it becomes visible
   * This method is called by VS Code when the webview needs to be displayed
   * @param webviewView - The webview view instance provided by VS Code
   */
  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;

    // Configure webview security and resource access
    webviewView.webview.options = {
      enableScripts: true, // Allow JavaScript execution for animations
      localResourceRoots: [vscode.Uri.joinPath(this._context.extensionUri, 'media')]
    };

    // Set the HTML content for the webview
    webviewView.webview.html = this.getWebviewContent(webviewView.webview);

    // Initialize productivity manager
    this._productivityManager = new ProductivityManager(this._context, message =>
      this.handleProductivityMessage(message)
    );

    // Clean up when webview is disposed
    webviewView.onDidDispose(() => {
      this._view = undefined;
      if (this._productivityManager) {
        this._productivityManager.dispose();
        this._productivityManager = undefined;
      }
    });
  }

  /**
   * Generate the HTML content for the webview
   * @param webview - The webview instance
   * @returns HTML content string
   */
  private getWebviewContent(webview: vscode.Webview): string {
    // Get all resource URIs
    const resourceUris = this.getResourceUris(webview);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kubito</title>
    <link rel="stylesheet" href="${resourceUris.css}">
</head>
<body>
    <div id="container">
        <img id="kubito" src="${resourceUris.walkingGif}" alt="Kubito" class="walking-right"
             onerror="this.textContent='🤖';">
    </div>
    <script>
        // Make image URIs available to the JavaScript
        window.kubitLogoUri = "${resourceUris.logo}";
        window.kubitLoveUri = "${resourceUris.love}";
        window.kubitoWalkingUri = "${resourceUris.walkingGif}";
        window.kubitoJumpingUri = "${resourceUris.jumpingGif}";
        window.kubitoIdleUri = "${resourceUris.idleGif}";
        window.kubitoWavingUri = "${resourceUris.wavingGif}";

        // Store translations to be used by the main script
        window.kubitoTranslations = ${JSON.stringify(getCurrentTranslations().messages)};

        // Store configuration settings
        window.kubitoConfig = ${JSON.stringify(this.getKubitoConfig())};
    </script>
    <script src="${resourceUris.js}"></script>
</body>
</html>`;
  }

  /**
   * Get Kubito configuration settings
   * @returns Configuration object for use in webview
   */
  private getKubitoConfig(): Record<string, any> {
    const config = vscode.workspace.getConfiguration('kubito');

    return {
      contextualMessages: config.get<boolean>('contextualMessages', true),
      language: config.get<string>('language', 'auto'),
      autoShow: config.get<boolean>('autoShow', true)
    };
  }

  /**
   * Refresh the webview content with updated translations and configuration
   * This is called when language or configuration settings change
   */
  public refresh(): void {
    if (this._view) {
      this._view.webview.html = this.getWebviewContent(this._view.webview);
    }
  }

  /**
   * Send a message to the webview to update configuration without full refresh
   * This is more efficient for configuration-only changes
   */
  public updateConfig(): void {
    if (this._view) {
      const config = this.getKubitoConfig();
      void this._view.webview.postMessage({
        command: 'updateConfig',
        config: config
      });
    }
  }

  /**
   * Send a message to be displayed by Kubito
   * @param message - Message object to display
   */
  public triggerMessage(message: IMessage): void {
    if (this._view) {
      void this._view.webview.postMessage({
        command: 'showMessage',
        message: message
      });
    }
  }

  /**
   * Handle productivity-related messages (reminders and metrics)
   * @param message - Productivity message from ProductivityManager
   */
  private handleProductivityMessage(message: { type: string; content: string }): void {
    let kubitoMessage: IMessage;

    switch (message.type) {
      case 'reminder':
        kubitoMessage = {
          type: 'text',
          content: message.content
        };
        break;
      case 'metrics':
        kubitoMessage = {
          type: 'text',
          content: message.content
        };
        break;
      default:
        kubitoMessage = {
          type: 'text',
          content: message.content
        };
    }

    this.triggerMessage(kubitoMessage);
  }

  /**
   * Get productivity insights from the manager
   */
  public getProductivityInsights(): any {
    return this._productivityManager?.getProductivityInsights();
  }

  /**
   * Update productivity manager configuration when settings change
   */
  public updateProductivityConfig(): void {
    if (this._productivityManager) {
      this._productivityManager.updateConfiguration();
    }
  }

  /**
   * Get all media resource URIs converted for webview usage
   * Converts local file URIs to webview-compatible URIs for security
   * @param webview - The webview instance for URI conversion
   * @returns Record containing all media resource URIs
   */
  private getResourceUris(webview: vscode.Webview): Record<string, vscode.Uri> {
    const mediaPath = vscode.Uri.joinPath(this._context.extensionUri, 'media');

    return {
      // Kubito animation assets
      walkingGif: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito-walking.gif')),
      jumpingGif: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito-jumping.gif')),
      idleGif: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito-idle.gif')),
      wavingGif: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito-waving.gif')),

      // Styles and scripts
      css: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito.css')),
      js: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito.js')),

      // Kubit branding assets
      logo: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubit-logo.png')),
      love: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubit-love.png'))
    };
  }
}

/**
 * Extension deactivation function
 * Called when the extension is being deactivated
 * Performs cleanup of resources and references
 */
export function deactivate(): void {
  // Clean up global references to prevent memory leaks
  if (kubitoWebviewProvider) {
    kubitoWebviewProvider = undefined;
  }
}
