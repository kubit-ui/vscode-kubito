/**
 * Kubito Webview Animation Controller
 *
 * This module provides an interactive Kubito companion that lives in the VS Code sidebar.
 * Kubito walks around, jumps when clicked, and shows random messages to keep users engaged.
 *
 * Features:
 * - Smooth walking animation with boundary detection
 * - Click-to-jump interaction with proper state management
 * - Random motivational messages with emoji support
 * - Multi-language support with automatic VS Code language detection
 * - Responsive to container size changes
 * - Optimized performance with requestAnimationFrame
 */

/**
 * Webview localization system
 * Gets translations from window object injected by extension backend
 */
function getWebviewTranslation(key: string): string {
  // Get translations from window object or use defaults
  const translations = (window as any).kubitoTranslations || {
    sleeping: 'Zzz...',
    letsCoding: "Let's code! 🚀",
    coffee: 'Coffee? ☕️',
    vivaKubit: 'Viva Kubit!',
    kubitLogo: 'Kubit Logo',
    kubitLove: 'Kubit Love'
  };

  return translations[key] || key;
}

/**
 * Message type definitions for Kubito's communication system
 */
interface IMessage {
  readonly type: 'emoji' | 'text' | 'image';
  readonly content: string;
  readonly alt?: string;
}

/**
 * Complete animation state tracking for Kubito
 * Manages position, movement, interactions, and display states
 */
interface IAnimationState {
  position: number; // Current X position in pixels
  direction: number; // Movement direction: 1 (right) or -1 (left)
  speed: number; // Movement speed in pixels per frame
  animationId: number | null; // RequestAnimationFrame ID for cleanup
  isPaused: boolean; // Whether animation is paused
  isJumping: boolean; // Whether currently performing jump animation
  isShowingMessage: boolean; // Whether message bubble is visible
  messageInterval: number | null; // Interval ID for message management
  hasAdjustedDirectionForMessage: boolean; // Prevents constant direction changes
  jumpStartTime: number | null; // Timestamp when jump animation started
  jumpCompleted: boolean; // Prevents duplicate jump completion handling
}

/**
 * Main Kubito animation controller interface
 * Defines the public API for controlling Kubito's behavior
 */
interface IKubitoAnimator {
  readonly kubito: HTMLImageElement;
  readonly container: HTMLElement;
  start(): void;
  stop(): void;
  performJump(): void;
  showRandomMessage(): void;
}

/**
 * Configuration constants for Kubito's animation and behavior
 * All timing and sizing values are carefully tuned for optimal user experience
 */
const KUBITO_CONFIG = {
  // Movement settings
  SPEED: 0.3, // Pixels per frame - relaxed pace for easy interaction

  // Animation timing
  JUMP_DURATION: 800, // Jump animation duration in milliseconds
  IDLE_DURATION: 500, // Pause duration between direction changes

  // Layout dimensions
  CONTAINER_PADDING: 36, // Padding to keep Kubito within visible bounds
  KUBITO_WIDTH: 36, // Kubito sprite width in pixels
  KUBITO_HEIGHT: 36 // Kubito sprite height in pixels
} as const;

/**
 * Configuration constants for the message system
 * Controls timing, sizing, and display behavior of Kubito's messages
 */
const MESSAGE_CONFIG = {
  DELAY_MIN: 5000, // Minimum delay between messages (5 seconds)
  DELAY_MAX: 10000, // Maximum delay between messages (10 seconds)
  DURATION: 3000, // How long each message stays visible (3 seconds)
  WIDTH_THRESHOLD: 0.8, // Container width ratio for line wrapping
  WIDTH_MAX: 1.0, // Maximum width ratio before truncation
  EMOJI_SIZE: 16, // Emoji display size in pixels
  IMAGE_SIZE: 16 // Image display size in pixels
} as const;

/**
 * Gets localized messages that Kubito can randomly display
 * Mix of emojis, text, and branded images for variety and engagement
 */
function getLocalizedMessages(): readonly IMessage[] {
  return [
    // Expressive emojis (universal)
    { type: 'emoji', content: '🤓' },
    { type: 'emoji', content: '😎' },
    { type: 'emoji', content: '🙃' },
    { type: 'emoji', content: '🤡' },
    { type: 'emoji', content: '👋' },
    { type: 'emoji', content: '⁉️' },
    { type: 'emoji', content: '❤️' },
    { type: 'emoji', content: '🚫 🐛' },
    { type: 'emoji', content: '🚀' },
    { type: 'emoji', content: '💻' },
    { type: 'emoji', content: '🔥' },
    { type: 'emoji', content: '✨' },
    { type: 'emoji', content: '🎯' },
    { type: 'emoji', content: '🧙‍♂️' },
    { type: 'emoji', content: '🦆' },
    { type: 'emoji', content: '🥷' },
    { type: 'emoji', content: '🤖' },
    { type: 'emoji', content: '🐍' },
    { type: 'emoji', content: '☁️' },
    { type: 'emoji', content: '⚛️' },

    // Basic localized messages
    { type: 'text', content: getWebviewTranslation('sleeping') },
    { type: 'text', content: getWebviewTranslation('letsCoding') },
    { type: 'text', content: getWebviewTranslation('coffee') },
    { type: 'text', content: getWebviewTranslation('vivaKubit') },

    // Programming fun messages
    { type: 'text', content: getWebviewTranslation('debugTime') },
    { type: 'text', content: getWebviewTranslation('noMoreBugs') },
    { type: 'text', content: getWebviewTranslation('commitTime') },
    { type: 'text', content: getWebviewTranslation('syntaxError') },
    { type: 'text', content: getWebviewTranslation('workingLate') },
    { type: 'text', content: getWebviewTranslation('mondayBlues') },
    { type: 'text', content: getWebviewTranslation('fridayFeeling') },
    { type: 'text', content: getWebviewTranslation('stackOverflow') },
    { type: 'text', content: getWebviewTranslation('gitPush') },
    { type: 'text', content: getWebviewTranslation('dockerizing') },

    // Motivational messages
    { type: 'text', content: getWebviewTranslation('keepCoding') },
    { type: 'text', content: getWebviewTranslation('almostThere') },
    { type: 'text', content: getWebviewTranslation('greatCode') },
    { type: 'text', content: getWebviewTranslation('refactorTime') },
    { type: 'text', content: getWebviewTranslation('testsPassing') },
    { type: 'text', content: getWebviewTranslation('cleanCode') },
    { type: 'text', content: getWebviewTranslation('oneMoreBug') },
    { type: 'text', content: getWebviewTranslation('fullStack') },
    { type: 'text', content: getWebviewTranslation('deployFriday') },

    // Programming jargon
    { type: 'text', content: getWebviewTranslation('helloWorld') },
    { type: 'text', content: getWebviewTranslation('infiniteLoop') },
    { type: 'text', content: getWebviewTranslation('nullPointer') },
    { type: 'text', content: getWebviewTranslation('recursion') },
    { type: 'text', content: getWebviewTranslation('leetCode') },
    { type: 'text', content: getWebviewTranslation('algorithm') },
    { type: 'text', content: getWebviewTranslation('bigO') },
    { type: 'text', content: getWebviewTranslation('asyncAwait') },
    { type: 'text', content: getWebviewTranslation('callback') },
    { type: 'text', content: getWebviewTranslation('promise') },

    // Mood messages
    { type: 'text', content: getWebviewTranslation('caffeinated') },
    { type: 'text', content: getWebviewTranslation('tired') },
    { type: 'text', content: getWebviewTranslation('eureka') },
    { type: 'text', content: getWebviewTranslation('frustrated') },
    { type: 'text', content: getWebviewTranslation('productive') },
    { type: 'text', content: getWebviewTranslation('procrastinating') },
    { type: 'text', content: getWebviewTranslation('inspired') },
    { type: 'text', content: getWebviewTranslation('rubberDuck') },
    { type: 'text', content: getWebviewTranslation('imposter') },
    { type: 'text', content: getWebviewTranslation('genius') },

    // Tech and tools
    { type: 'text', content: getWebviewTranslation('reactTime') },
    { type: 'text', content: getWebviewTranslation('nodeJs') },
    { type: 'text', content: getWebviewTranslation('python') },
    { type: 'text', content: getWebviewTranslation('javascript') },
    { type: 'text', content: getWebviewTranslation('typescript') },
    { type: 'text', content: getWebviewTranslation('cssLife') },
    { type: 'text', content: getWebviewTranslation('htmlBasic') },
    { type: 'text', content: getWebviewTranslation('gitMerge') },
    { type: 'text', content: getWebviewTranslation('vscode') },
    { type: 'text', content: getWebviewTranslation('terminal') },

    // Time/schedule messages
    { type: 'text', content: getWebviewTranslation('lunchTime') },
    { type: 'text', content: getWebviewTranslation('breakTime') },
    { type: 'text', content: getWebviewTranslation('overtime') },
    { type: 'text', content: getWebviewTranslation('earlyBird') },
    { type: 'text', content: getWebviewTranslation('nightOwl') },
    { type: 'text', content: getWebviewTranslation('weekend') },
    { type: 'text', content: getWebviewTranslation('vacation') },
    { type: 'text', content: getWebviewTranslation('deadline') },
    { type: 'text', content: getWebviewTranslation('crunchTime') },
    { type: 'text', content: getWebviewTranslation('chillin') },

    // Philosophical/funny messages
    { type: 'text', content: getWebviewTranslation('existential') },
    { type: 'text', content: getWebviewTranslation('matrix') },
    { type: 'text', content: getWebviewTranslation('binary') },
    { type: 'text', content: getWebviewTranslation('quantum') },
    { type: 'text', content: getWebviewTranslation('artificial') },
    { type: 'text', content: getWebviewTranslation('singularity') },
    { type: 'text', content: getWebviewTranslation('metaverse') },
    { type: 'text', content: getWebviewTranslation('blockchain') },
    { type: 'text', content: getWebviewTranslation('cloud') },
    { type: 'text', content: getWebviewTranslation('serverless') },

    // Kubit branding images (localized alt text)
    { type: 'image', content: 'kubit_logo', alt: getWebviewTranslation('kubitLogo') },
    { type: 'image', content: 'kubit_love', alt: getWebviewTranslation('kubitLove') }
  ] as const;
}

/**
 * Main Kubito animation controller class
 *
 * Manages all aspects of Kubito's behavior including:
 * - Smooth walking animation with boundary detection
 * - Interactive jump responses to user clicks
 * - Random message display system
 * - State management for all animations
 * - Performance optimization with RAF cleanup
 */
class KubitoWalker implements IKubitoAnimator, IAnimationState {
  // Animation state properties
  public position = 0; // Current X position
  public direction = 1; // Movement direction (1=right, -1=left)
  public speed = KUBITO_CONFIG.SPEED; // Current movement speed
  public animationId: number | null = null; // RAF ID for cleanup
  public isPaused = false; // Paused state flag
  public isJumping = false; // Jump animation active
  public isShowingMessage = false; // Message display active
  public messageInterval: number | null = null; // Message timer ID
  public hasAdjustedDirectionForMessage = false; // Direction change guard
  public jumpStartTime: number | null = null; // Jump timing tracker
  public jumpCompleted = false; // Jump completion guard

  public readonly kubito: HTMLImageElement;
  public readonly container: HTMLElement;

  /**
   * Initialize the Kubito walker with DOM elements and event handlers
   * Sets up all necessary systems for animation and interaction
   */
  constructor() {
    const kubitoElement = document.getElementById('kubito');
    const containerElement = document.getElementById('container');

    // Validate required DOM elements exist
    if (!kubitoElement || !containerElement) {
      throw new Error('Required DOM elements (kubito, container) not found');
    }

    this.kubito = kubitoElement as HTMLImageElement;
    this.container = containerElement as HTMLElement;

    // Initialize all subsystems
    this.setupEventListeners();
    this.setupRandomMessages();
    this.setupDynamicHeight();
  }

  /**
   * Setup dynamic height adjustment for responsive webview layout
   * Ensures Kubito always has the full available space to move around
   */
  private setupDynamicHeight(): void {
    const adjustHeight = (): void => {
      const windowHeight = window.innerHeight;

      // Set container to use full available viewport height
      // This ensures Kubito can move through the entire visible area
      this.container.style.height = windowHeight + 'px';
      document.body.style.height = windowHeight + 'px';
      document.documentElement.style.height = windowHeight + 'px';
    };

    // Initial height adjustment
    adjustHeight();

    // Adjust on resize
    window.addEventListener('resize', adjustHeight);

    // Force adjustment with a slight delay
    setTimeout(adjustHeight, 100);
  } /**
   * Calculate the maximum width for movement
   */
  private getMaxWidth(): number {
    return this.container.clientWidth - KUBITO_CONFIG.KUBITO_WIDTH;
  }

  /**
   * Set up all event listeners for interaction
   */
  private setupEventListeners(): void {
    this.kubito.addEventListener('click', this.handleClick.bind(this));
    this.kubito.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.kubito.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  /**
   * Handle click events on Kubito
   */
  private handleClick(): void {
    if (this.isJumping || this.jumpCompleted) {
      return;
    }

    this.performJump();
  }

  /**
   * Handle mouse enter events for hover effect
   */
  private handleMouseEnter(): void {
    this.kubito.style.filter = 'brightness(1.2)';
  }

  /**
   * Handle mouse leave events
   */
  private handleMouseLeave(): void {
    this.kubito.style.filter = 'brightness(1)';
  }

  /**
   * Set up the random message scheduling system
   */
  private setupRandomMessages(): void {
    const scheduleNextMessage = (): void => {
      const delay =
        Math.random() * (MESSAGE_CONFIG.DELAY_MAX - MESSAGE_CONFIG.DELAY_MIN) +
        MESSAGE_CONFIG.DELAY_MIN;

      this.messageInterval = window.setTimeout(() => {
        if (!this.isJumping) {
          this.showRandomMessage();
        }
        scheduleNextMessage();
      }, delay);
    };

    scheduleNextMessage();
  }

  /**
   * Perform the jump animation sequence using simplified approach
   */
  public performJump(): void {
    if (this.isJumping) {
      return;
    }

    // Cancel any active message
    if (this.isShowingMessage) {
      this.hideMessage();
    }

    // Start jump - simple and clean
    this.isJumping = true;
    this.jumpStartTime = Date.now();
    this.jumpCompleted = false; // Reset completion flag
    this.setKubitoImage('jumping');
  }

  /**
   * Update jump animation - simplified without idle state
   */
  private updateJumpAnimation(): void {
    if (!this.isJumping || this.jumpStartTime === null || this.jumpCompleted) {
      return;
    }

    const elapsed = Date.now() - this.jumpStartTime;
    const totalJumpTime = KUBITO_CONFIG.JUMP_DURATION + KUBITO_CONFIG.IDLE_DURATION;

    if (elapsed >= totalJumpTime) {
      // Mark as completed first to prevent multiple executions
      this.jumpCompleted = true;

      // Jump finished - return to walking
      this.setKubitoImage('walking');
      this.isJumping = false;
      this.jumpStartTime = null;

      // Reset jumpCompleted after a brief delay to allow new jumps
      setTimeout(() => {
        this.jumpCompleted = false;
      }, 100); // 100ms cooldown
    }
    // During jump: keep showing jumping gif (no intermediate idle state)
  } /**
   * Calculate the actual width a message would have after smart sizing
   */
  private calculateMessageWidth(message: IMessage): number {
    // Create a temporary element to measure the message width
    const tempElement = this.createMessageElement(message);
    tempElement.style.visibility = 'hidden';

    // Add to container, measure, then remove
    this.container.appendChild(tempElement);
    const width = tempElement.offsetWidth;
    this.container.removeChild(tempElement);

    return width;
  } /**
   * Check if Kubito or its message would collide with boundaries in the next few frames
   * This provides unified collision detection for both Kubito and messages
   */
  private willCollideWithBoundary(messageWidth?: number): boolean {
    const containerWidth = this.container.clientWidth;
    const maxWidth = this.getMaxWidth();

    // Predict position a few frames ahead to give time to react
    const lookaheadFrames = 10;
    const futurePosition = this.position + this.speed * this.direction * lookaheadFrames;

    // Check Kubito collision
    const kubitoWillHitBoundary = futurePosition <= 0 || futurePosition >= maxWidth;

    // If Kubito will hit a boundary, always change direction
    if (kubitoWillHitBoundary) {
      return true;
    }

    // If we have a message to consider, check its boundaries with smarter logic
    if (messageWidth !== undefined) {
      const messageLeftEdge = futurePosition + KUBITO_CONFIG.KUBITO_WIDTH / 2 - messageWidth / 2;
      const messageRightEdge = messageLeftEdge + messageWidth;

      // Only change direction if moving towards the problematic side
      if (this.direction === 1 && messageRightEdge > containerWidth) {
        // Moving right and message would overflow right edge
        return true;
      } else if (this.direction === -1 && messageLeftEdge < 0) {
        // Moving left and message would overflow left edge
        return true;
      }
    }

    return false;
  }

  /**
   * Display a random message near Kubito
   */
  public showRandomMessage(): void {
    if (this.isShowingMessage || this.isJumping) {
      return;
    }

    const message = this.getRandomMessage();

    // Check if we need to change direction for this message (only once)
    const messageWidth = this.calculateMessageWidth(message);
    if (this.willCollideWithBoundary(messageWidth)) {
      this.direction *= -1;
      this.kubito.className = this.direction === 1 ? 'walking-right' : 'walking-left';
      this.hasAdjustedDirectionForMessage = true;
    }

    this.isShowingMessage = true;
    const messageElement = this.createMessageElement(message);

    this.container.appendChild(messageElement);

    // Position message after it's been added to DOM so we can get its width
    requestAnimationFrame(() => {
      this.positionMessage(messageElement);

      // Animate message appearance
      messageElement.style.opacity = '1';
      messageElement.style.transform = 'translateY(0px)';
    });

    // Hide message after duration
    setTimeout(() => {
      this.hideMessage();
    }, MESSAGE_CONFIG.DURATION);
  }

  /**
   * Get a random message from the localized messages array
   */
  private getRandomMessage(): IMessage {
    const messages = getLocalizedMessages();
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }

  /**
   * Create a DOM element for the message with smart sizing
   */
  private createMessageElement(message: IMessage): HTMLElement {
    const messageElement = document.createElement('div');
    messageElement.className = 'speech-bubble';
    messageElement.setAttribute('data-type', message.type);

    // Set initial styles for proper positioning
    messageElement.style.position = 'absolute';
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateY(10px)';

    // Create content
    if (message.type === 'image') {
      const img = document.createElement('img');
      img.src = this.getImageUri(message.content);
      img.alt = message.alt ?? message.content;
      img.style.width = MESSAGE_CONFIG.IMAGE_SIZE + 'px';
      img.style.height = MESSAGE_CONFIG.IMAGE_SIZE + 'px';
      messageElement.appendChild(img);
    } else if (message.type === 'emoji') {
      // Create emoji with larger size
      messageElement.textContent = message.content;
      messageElement.style.fontSize = MESSAGE_CONFIG.EMOJI_SIZE + 'px';
      messageElement.style.lineHeight = '1';
    } else {
      // Regular text message
      messageElement.textContent = message.content;
    }

    // Apply smart sizing based on container width
    this.applySmartSizing(messageElement, message);

    return messageElement;
  }

  /**
   * Apply smart sizing rules to message elements
   */
  private applySmartSizing(messageElement: HTMLElement, message: IMessage): void {
    const containerWidth = this.container.clientWidth;

    // Skip smart sizing for images and emojis (they have fixed sizes)
    if (message.type === 'image' || message.type === 'emoji') {
      return;
    }

    // Temporarily add to measure natural width
    messageElement.style.visibility = 'hidden';
    messageElement.style.whiteSpace = 'nowrap';
    this.container.appendChild(messageElement);
    const naturalWidth = messageElement.offsetWidth;
    this.container.removeChild(messageElement);
    messageElement.style.visibility = 'visible';

    const widthThreshold = containerWidth * MESSAGE_CONFIG.WIDTH_THRESHOLD;
    const maxWidth = containerWidth * MESSAGE_CONFIG.WIDTH_MAX;

    if (naturalWidth > maxWidth) {
      // Case 3: Too wide even for multi-line → truncate
      messageElement.style.maxWidth = maxWidth + 'px';
      messageElement.style.whiteSpace = 'nowrap';
      messageElement.style.overflow = 'hidden';
      messageElement.style.textOverflow = 'ellipsis';
      messageElement.title = message.content; // Show full text on hover
    } else if (naturalWidth > widthThreshold) {
      // Case 2: Wide message → multi-line
      messageElement.style.maxWidth = widthThreshold + 'px';
      messageElement.style.whiteSpace = 'normal';
      messageElement.style.textAlign = 'center';
      messageElement.style.lineHeight = '1.2';
      messageElement.classList.add('long-message');
    } else {
      // Case 1: Normal message → keep single line
      messageElement.style.whiteSpace = 'nowrap';
    }
  } /**
   * Position the message relative to Kubito
   */
  private positionMessage(messageElement: HTMLElement): void {
    // Get Kubito's current position relative to container
    const kubitoLeft = this.position;
    const kubitoTop = this.container.clientHeight - KUBITO_CONFIG.KUBITO_HEIGHT;

    // Center the message above Kubito
    const messageWidth = messageElement.offsetWidth || 80; // fallback width
    const centeredLeft = kubitoLeft + KUBITO_CONFIG.KUBITO_WIDTH / 2 - messageWidth / 2;

    // Ensure message doesn't overflow container
    const containerWidth = this.container.clientWidth;
    const finalLeft = Math.max(0, Math.min(centeredLeft, containerWidth - messageWidth));

    messageElement.style.left = finalLeft + 'px';
    messageElement.style.top = kubitoTop - 40 + 'px'; // 40px above Kubito
  }

  /**
   * Hide and remove the current message
   */
  private hideMessage(): void {
    const existingMessage = this.container.querySelector('.speech-bubble');
    if (existingMessage) {
      existingMessage.remove();
    }
    this.isShowingMessage = false;
    this.hasAdjustedDirectionForMessage = false; // Reset flag when message is hidden
  }

  /**
   * Set Kubito's image based on state
   */
  private setKubitoImage(state: 'walking' | 'jumping' | 'idle'): void {
    const uriKey = `kubito${state.charAt(0).toUpperCase() + state.slice(1)}Uri`;
    const uri = (window as any)[uriKey] as string;

    if (uri) {
      this.kubito.src = uri;
    }

    // Apply direction class based on state and current direction
    // For jumping and idle, we want to maintain orientation but ensure clean state
    const directionClass = this.direction === 1 ? 'walking-right' : 'walking-left';

    // Always set the direction class, but ensure we're not conflicting with any state
    this.kubito.className = directionClass;

    // Ensure consistent dimensions across all states to prevent clipping
    this.kubito.style.width = KUBITO_CONFIG.KUBITO_WIDTH + 'px';
    this.kubito.style.height = KUBITO_CONFIG.KUBITO_HEIGHT + 'px';

    // Force a reflow to ensure the changes are applied immediately
    // This helps prevent visual glitches during state transitions
    this.kubito.offsetHeight;
  }

  /**
   * Get the URI for a specific image
   */
  private getImageUri(imageName: string): string {
    // Handle special cases for custom images
    if (imageName === 'kubit_logo') {
      return (window as any).kubitLogoUri as string;
    }
    if (imageName === 'kubit_love') {
      return (window as any).kubitLoveUri as string;
    }

    // Fallback for other images (though we don't have others currently)
    const uriKey = `kubit${imageName.charAt(0).toUpperCase() + imageName.slice(1)}Uri`;
    return (window as any)[uriKey] as string;
  }

  /**
   * Main animation loop
   */
  private animate(): void {
    if (this.isPaused) {
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }

    // Update jump animation if jumping
    if (this.isJumping) {
      this.updateJumpAnimation();
      this.animationId = requestAnimationFrame(() => this.animate());
      return;
    }

    const maxWidth = this.getMaxWidth();

    // Only use predictive collision detection when NOT showing a message
    // (to prevent constant direction changes with long messages)
    if (!this.isShowingMessage && this.willCollideWithBoundary()) {
      this.direction *= -1;
      this.kubito.className = this.direction === 1 ? 'walking-right' : 'walking-left';
    }

    // Update position
    this.position += this.speed * this.direction;

    // Fallback boundary checks (always active for safety)
    if (this.position <= 0) {
      this.position = 0;
      this.direction = 1;
      this.kubito.className = 'walking-right';
    } else if (this.position >= maxWidth) {
      this.position = maxWidth;
      this.direction = -1;
      this.kubito.className = 'walking-left';
    }

    // Apply position
    this.kubito.style.left = `${this.position}px`;

    // Update message position if showing
    if (this.isShowingMessage) {
      const messageElement = this.container.querySelector('.speech-bubble');
      if (messageElement) {
        this.positionMessage(messageElement as HTMLElement);
      }
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Start the animation
   */
  public start(): void {
    if (this.animationId === null) {
      this.animate();
    }
  }

  /**
   * Stop the animation
   */
  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.messageInterval !== null) {
      clearTimeout(this.messageInterval);
      this.messageInterval = null;
    }

    // Reset jump state
    this.isJumping = false;
    this.jumpStartTime = null;
    this.jumpCompleted = false;
  }
}

// Initialize when DOM is ready
let kubitoWalker: KubitoWalker | null = null;

function initializeKubito(): void {
  try {
    kubitoWalker = new KubitoWalker();
    kubitoWalker.start();
  } catch (error) {
    console.error('Failed to initialize Kubito:', error);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeKubito);
} else {
  initializeKubito();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (kubitoWalker) {
    kubitoWalker.stop();
  }
});
