import * as vscode from 'vscode';

/**
 * Interface for the Kubito webview provider
 */
interface IKubitoWebviewProvider extends vscode.WebviewViewProvider {
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void | Promise<void>;
}

/**
 * Main extension context and provider
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
 * Register all extension commands
 * @param context - VS Code extension context
 */
function registerCommands(context: vscode.ExtensionContext): void {
  // Command to show kubito (focuses the view)
  const showKubitoCommand = vscode.commands.registerCommand(
    'kubito.show',
    async (): Promise<void> => {
      await vscode.commands.executeCommand('kubito.focus');
    }
  );

  // Command to hide kubito (provides instructions for manual collapse)
  const hideKubitoCommand = vscode.commands.registerCommand(
    'kubito.hide',
    async (): Promise<void> => {
      void vscode.window.showInformationMessage(
        'You can collapse the Kubito section manually in the Explorer!'
      );
    }
  );

  context.subscriptions.push(showKubitoCommand, hideKubitoCommand);
}

/**
 * Auto-show Kubito if the setting is enabled
 */
async function autoShowKubito(): Promise<void> {
  // Small delay to ensure everything is initialized
  setTimeout(async (): Promise<void> => {
    const config = vscode.workspace.getConfiguration('kubito');
    const autoShow = config.get<boolean>('autoShow', true) as boolean;

    if (autoShow) {
      await vscode.commands.executeCommand('kubito.show');
    }
  }, 500);
}

/**
 * Webview provider implementation for Kubito
 */
class KubitoWebviewProvider implements IKubitoWebviewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Resolve the webview view when it's shown
   * @param webviewView - The webview view instance
   */
  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
    };

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
   * Get all resource URIs for the webview
   * @param webview - The webview instance
   * @returns Object containing all resource URIs
   */
  private getResourceUris(webview: vscode.Webview): Record<string, vscode.Uri> {
    const mediaPath = vscode.Uri.joinPath(this.context.extensionUri, 'media');

    return {
      walkingGif: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito_walking.gif')),
      jumpingGif: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito_jumping.gif')),
      idlePng: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito_idle.png')),
      css: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito.css')),
      js: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubito.js')),
      logo: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubit_logo.png')),
      love: webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'kubit_love.png'))
    };
  }
}

/**
 * Extension deactivation function
 */
export function deactivate(): void {
  // Cleanup if needed
  if (kubitoWebviewProvider) {
    kubitoWebviewProvider = undefined;
  }
}
