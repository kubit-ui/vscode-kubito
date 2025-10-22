/**
 * Message type definitions for Kubito communication
 */
interface IMessage {
  readonly type: 'emoji' | 'text' | 'image';
  readonly content: string;
  readonly alt?: string;
}

/**
 * Animation state tracking interface
 */
interface IAnimationState {
  position: number;
  direction: number;
  speed: number;
  animationId: number | null;
  isPaused: boolean;
  isJumping: boolean;
  isShowingMessage: boolean;
  messageInterval: number | null;
  hasAdjustedDirectionForMessage: boolean; // Flag to prevent constant direction changes
  jumpStartTime: number | null; // Track when jump started
  jumpCompleted: boolean; // Flag to prevent double completion
}

/**
 * Kubito animation controller interface
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
 * Constants for Kubito animation and movement
 */
const KUBITO_CONFIG = {
  SPEED: 0.3, // pixels per frame (relaxed movement for easy interaction)
  JUMP_DURATION: 800, // milliseconds (0.8 seconds) - reduced for snappier feel
  IDLE_DURATION: 500, // milliseconds (0.5 seconds) - more natural pause
  CONTAINER_PADDING: 36, // pixels (kubito width)
  KUBITO_WIDTH: 36, // pixels
  KUBITO_HEIGHT: 36 // pixels
} as const;

/**
 * Constants for message system configuration
 */
const MESSAGE_CONFIG = {
  DELAY_MIN: 5000, // milliseconds (5 seconds)
  DELAY_MAX: 10000, // milliseconds (10 seconds)
  DURATION: 3000, // milliseconds (3 seconds)
  WIDTH_THRESHOLD: 0.8, // 80% of container width for multi-line
  WIDTH_MAX: 1.0, // 100% of container width for truncation
  EMOJI_SIZE: 16, // pixels (more reasonable size)
  IMAGE_SIZE: 16 // pixels (more reasonable size)
} as const; /**
 * Pre-defined messages that Kubito can display
 */
const KUBITO_MESSAGES: readonly IMessage[] = [
  { type: 'emoji', content: '🤓' },
  { type: 'emoji', content: '😎' },
  { type: 'emoji', content: '🙃' },
  { type: 'emoji', content: '🤡' },
  { type: 'emoji', content: '👋' },
  { type: 'emoji', content: '⁉️' },
  { type: 'emoji', content: '❤️' },
  { type: 'emoji', content: '🚫 🐛' },
  { type: 'text', content: 'Zzz...' },
  { type: 'text', content: '¡A programar! 🚀' },
  { type: 'text', content: '¿Un café? ☕️' },
  { type: 'text', content: '¡Viva Kubit!' },
  { type: 'image', content: 'kubit_logo', alt: 'Kubit Logo' },
  { type: 'image', content: 'kubit_love', alt: 'Kubit Love' }
] as const;

/**
 * Main Kubito animation walker class
 */
class KubitoWalker implements IKubitoAnimator, IAnimationState {
  public position = 0;
  public direction = 1; // 1 for right, -1 for left
  public speed = KUBITO_CONFIG.SPEED;
  public animationId: number | null = null;
  public isPaused = false;
  public isJumping = false;
  public isShowingMessage = false;
  public messageInterval: number | null = null;
  public hasAdjustedDirectionForMessage = false;
  public jumpStartTime: number | null = null;
  public jumpCompleted = false;

  public readonly kubito: HTMLImageElement;
  public readonly container: HTMLElement;

  constructor() {
    const kubitoElement = document.getElementById('kubito');
    const containerElement = document.getElementById('container');

    if (!kubitoElement || !containerElement) {
      throw new Error('Required DOM elements not found');
    }

    this.kubito = kubitoElement as HTMLImageElement;
    this.container = containerElement as HTMLElement;

    this.setupEventListeners();
    this.setupRandomMessages();
    this.setupDynamicHeight();
  }

  /**
   * Setup dynamic height adjustment for webview
   */
  private setupDynamicHeight(): void {
    const adjustHeight = (): void => {
      const windowHeight = window.innerHeight;

      // Force container to use full available height
      this.container.style.height = windowHeight + 'px';
      document.body.style.height = windowHeight + 'px';
      document.documentElement.style.height = windowHeight + 'px';
    };

    // Adjust on load
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
   * Get a random message from the messages array
   */
  private getRandomMessage(): IMessage {
    const randomIndex = Math.floor(Math.random() * KUBITO_MESSAGES.length);
    return KUBITO_MESSAGES[randomIndex];
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
