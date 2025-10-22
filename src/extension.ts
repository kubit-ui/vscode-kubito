import * as vscode from 'vscode';

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
 * Extension activation function
 * @param context - VS Code extension context
 */
export function activate(context: vscode.ExtensionContext): void {
  // Create the webview provider for the Explorer view
  kubitoWebviewProvider = new KubitoWebviewProvider(context);

  // Register the webview provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('kubito', kubitoWebviewProvider)
  );

  // Register commands
  registerCommands(context);

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
        void vscode.window.showErrorMessage(`Failed to show Kubito: ${errorMessage}`);
      }
    }
  );

  // Command to provide instructions for hiding Kubito
  // Note: Webview panels cannot be programmatically hidden, only collapsed manually
  const hideKubitoCommand = vscode.commands.registerCommand(
    'kubito.hide',
    async (): Promise<void> => {
      void vscode.window.showInformationMessage(
        'You can collapse the Kubito section manually in the Explorer panel!',
        'Got it'
      );
    }
  );

  context.subscriptions.push(showKubitoCommand, hideKubitoCommand);
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
  constructor(private readonly _context: vscode.ExtensionContext) {}

  /**
   * Resolve the webview view when it becomes visible
   * This method is called by VS Code when the webview needs to be displayed
   * @param webviewView - The webview view instance provided by VS Code
   */
  resolveWebviewView(webviewView: vscode.WebviewView): void {
    // Configure webview security and resource access
    webviewView.webview.options = {
      enableScripts: true, // Allow JavaScript execution for animations
      localResourceRoots: [vscode.Uri.joinPath(this._context.extensionUri, 'media')]
    };

    // Set the HTML content for the webview
    webviewView.webview.html = this.getWebviewContent(webviewView.webview);
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
        window.kubitoIdleUri = "${resourceUris.idlePng}";
    </script>
    <script src="${resourceUris.js}"></script>
</body>
</html>`;
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
      walkingGif: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito_walking.gif')),
      jumpingGif: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito_jumping.gif')),
      idlePng: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito_idle.png')),

      // Styles and scripts
      css: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito.css')),
      js: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito.js')),

      // Kubit branding assets
      logo: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubit_logo.png')),
      love: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubit_love.png'))
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
