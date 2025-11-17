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
 * - Contextual time-based message selection
 */

/**
 * Temporal context for contextual messages
 */
enum TimeContext {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  LATE_NIGHT = 'lateNight',
  MONDAY = 'monday',
  FRIDAY = 'friday',
  WEEKEND = 'weekend',
  WORKDAY = 'workday'
}

/**
 * Kubito states for natural wandering behavior
 */
enum KubitoState {
  WAVING = 'waving', // Initial greeting animation
  WANDERING = 'wandering', // Moving around
  PAUSED = 'paused', // Standing still/idle
  JUMPING = 'jumping', // Jump animation
  TALKING = 'talking' // Showing a message
}

/**
 * Context-based message mapping
 * Maps time contexts to message keys that should be prioritized
 */
const CONTEXTUAL_MESSAGES: Record<TimeContext, string[]> = {
  [TimeContext.MORNING]: [
    'letsCode',
    'coffee',
    'caffeinated',
    'productive',
    'inspired',
    'motivated',
    'earlyBird'
  ],
  [TimeContext.AFTERNOON]: [
    'keepCoding',
    'productive',
    'refactorTime',
    'almostThere',
    'meetingTime'
  ],
  [TimeContext.EVENING]: ['workingLate', 'oneMoreBug', 'almostThere', 'tired', 'overtime'],
  [TimeContext.LATE_NIGHT]: ['workingLate', 'tired', 'sleeping', 'nightOwl', 'infiniteLoop'],
  [TimeContext.MONDAY]: ['mondayBlues', 'letsCode', 'coffee', 'motivated'],
  [TimeContext.FRIDAY]: ['fridayFeeling', 'deployFriday', 'almostThere', 'weekend'],
  [TimeContext.WEEKEND]: ['weekend', 'procrastinating', 'inspired', 'sideProject', 'chillin'],
  [TimeContext.WORKDAY]: ['productive', 'keepCoding', 'meetingTime', 'debugTime']
};

/**
 * Gets current time contexts based on system time
 */
function getCurrentTimeContexts(): TimeContext[] {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  const contexts: TimeContext[] = [];

  // Add time-of-day contexts
  if (hour >= 6 && hour < 12) {
    contexts.push(TimeContext.MORNING);
  } else if (hour >= 12 && hour < 18) {
    contexts.push(TimeContext.AFTERNOON);
  } else if (hour >= 18 && hour < 22) {
    contexts.push(TimeContext.EVENING);
  } else {
    contexts.push(TimeContext.LATE_NIGHT);
  }

  // Add day-of-week contexts
  if (dayOfWeek === 1) {
    // Monday
    contexts.push(TimeContext.MONDAY, TimeContext.WORKDAY);
  } else if (dayOfWeek === 5) {
    // Friday
    contexts.push(TimeContext.FRIDAY, TimeContext.WORKDAY);
  } else if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Weekend
    contexts.push(TimeContext.WEEKEND);
  } else {
    // Tuesday-Thursday
    contexts.push(TimeContext.WORKDAY);
  }

  return contexts;
}

/**
 * Gets contextual message keys for current time
 */
function getContextualMessageKeys(): string[] {
  const contexts = getCurrentTimeContexts();
  const contextualKeys = new Set<string>();

  contexts.forEach(context => {
    const messages = CONTEXTUAL_MESSAGES[context] || [];
    messages.forEach(key => contextualKeys.add(key));
  });

  return Array.from(contextualKeys);
}

/**
 * Webview localization system
 * Gets translations from window object injected by extension backend
 */
function getWebviewTranslation(key: string): string {
  // Get translations from window object or use defaults
  const translations = (window as any).kubitoTranslations || {
    sleeping: 'Zzz...',
    letsCode: 'Let\'s code! 🚀',
    coffee: 'Coffee? ☕️',
    vivaKubit: 'Viva Kubit!'
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
  SPEED: 0.08, // Movement speed in pixels per frame

  // Wandering behavior timing
  WANDERING_MIN: 4000, // Minimum wandering time (4 seconds)
  WANDERING_MAX: 8000, // Maximum wandering time (8 seconds
  PAUSE_MIN: 1000, // Minimum pause time (1 second)
  PAUSE_MAX: 2500, // Maximum pause time (2.5 seconds)

  // Waving behavior
  WAVING_DURATION: 1500, // Duration of initial greeting wave (1.5 seconds)

  // Jump behavior
  JUMP_CHANCE: 0.2, // 20% chance of jumping when entering pause
  JUMP_DURATION: 800, // Jump animation duration (800 milliseconds)
  POST_JUMP_COOLDOWN: 1000, // Cooldown after jump before next jump (1 second)

  // Talking behavior
  TALKING_DURATION: 3000, // How long to stay in talking state (3 seconds)
  POST_TALKING_PAUSE: 100, // Short pause after talking before returning to normal (100 milliseconds)

  // State transition delays (to prevent visual glitches)
  TRANSITION_DELAY: 150, // Small delay between state changes (150ms)
  IMAGE_CHANGE_DELAY: 100, // Delay before changing images to prevent flicker (100ms)

  // GIF restart settings - REMOVED: No longer needed
  // GIF_RESTART_DELAY: 50, // Delay before applying aggressive restart technique (50ms)
  // USE_AGGRESSIVE_GIF_RESTART: true, // Whether to use element cloning as fallback

  // Layout dimensions
  CONTAINER_PADDING: 36, // Padding to keep Kubito within visible bounds
  KUBITO_WIDTH: 36, // Kubito sprite width in pixels
  KUBITO_HEIGHT: 36, // Kubito sprite height in pixels

  // Safe zone for messages
  SAFE_ZONE_MARGIN: 0.15 // 15% margin on each side = 70% center safe zone
} as const;

/**
 * Configuration constants for the message system
 * Controls timing, sizing, and display behavior of Kubito's messages
 */
const MESSAGE_CONFIG = {
  DELAY_MIN: 3000, // Minimum delay between messages (3 seconds)
  DELAY_MAX: 7000, // Maximum delay between messages (7 seconds)
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
    { type: 'text', content: getWebviewTranslation('letsCode') },
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
    { type: 'image', content: 'kubit-logo', alt: getWebviewTranslation('kubitLogo') },
    { type: 'image', content: 'kubit-love', alt: getWebviewTranslation('kubitLove') }
  ] as const;
}

/**
 * Creates a map of message key to IMessage for contextual selection
 */
function getMessageMap(): Map<string, IMessage> {
  const messageMap = new Map<string, IMessage>();

  // Add text messages with their keys
  const textMessages = [
    'sleeping',
    'letsCode',
    'coffee',
    'vivaKubit',
    'debugTime',
    'noMoreBugs',
    'commitTime',
    'syntaxError',
    'workingLate',
    'mondayBlues',
    'fridayFeeling',
    'stackOverflow',
    'gitPush',
    'dockerizing',
    'keepCoding',
    'almostThere',
    'greatCode',
    'refactorTime',
    'testsPassing',
    'cleanCode',
    'oneMoreBug',
    'fullStack',
    'deployFriday',
    'helloWorld',
    'infiniteLoop',
    'nullPointer',
    'recursion',
    'leetCode',
    'algorithm',
    'bigO',
    'asyncAwait',
    'callback',
    'promise',
    'caffeinated',
    'tired',
    'eureka',
    'frustrated',
    'productive',
    'procrastinating',
    'inspired',
    'rubberDuck',
    'imposter',
    'genius',
    'reactTime',
    'nodeJs',
    'python',
    'javascript',
    'typescript',
    'cssLife',
    'htmlBasic',
    'gitMerge',
    'vscode',
    'terminal',
    'lunchTime',
    'breakTime',
    'overtime',
    'earlyBird',
    'nightOwl',
    'weekend',
    'motivated',
    'meetingTime',
    'sideProject',
    'vacation',
    'deadline',
    'crunchTime',
    'chillin',
    'existential',
    'matrix',
    'binary',
    'quantum',
    'artificial',
    'singularity',
    'metaverse',
    'blockchain',
    'cloud',
    'serverless'
  ];

  textMessages.forEach(key => {
    messageMap.set(key, { type: 'text', content: getWebviewTranslation(key) });
  });

  return messageMap;
}

/**
 * Gets contextual messages based on current time, with fallback to random
 */
function getContextualMessages(enableContextual: boolean = true): readonly IMessage[] {
  const allMessages = getLocalizedMessages();

  if (!enableContextual) {
    return allMessages;
  }

  const contextualKeys = getContextualMessageKeys();
  if (contextualKeys.length === 0) {
    return allMessages;
  }

  const messageMap = getMessageMap();
  const contextualMessages: IMessage[] = [];
  const nonContextualMessages: IMessage[] = [];

  // Separate emoji and image messages (always available)
  const universalMessages = allMessages.filter(msg => msg.type === 'emoji' || msg.type === 'image');

  // Get all text messages and separate contextual from non-contextual
  allMessages
    .filter(msg => msg.type === 'text')
    .forEach(msg => {
      const foundKey = Array.from(messageMap.entries()).find(
        ([_, value]) => value.content === msg.content
      );

      if (foundKey && contextualKeys.includes(foundKey[0])) {
        contextualMessages.push(msg);
      } else {
        nonContextualMessages.push(msg);
      }
    });

  // Create weighted selection pool
  // 70% contextual messages, 20% universal, 10% other text messages
  const weightedMessages: IMessage[] = [
    ...contextualMessages,
    ...contextualMessages, // Duplicate for higher weight
    ...contextualMessages, // Triple for even higher weight
    ...universalMessages,
    ...nonContextualMessages.slice(0, Math.max(1, Math.floor(nonContextualMessages.length * 0.2)))
  ];

  return weightedMessages.length > 0 ? weightedMessages : allMessages;
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
class KubitoController implements IKubitoAnimator, IAnimationState {
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

  // Wandering behavior state
  public kubitoState: KubitoState = KubitoState.WANDERING; // Current kubito state
  public stateStartTime: number = Date.now(); // When current state started
  public currentStateDuration: number = 0; // How long to stay in current state
  public currentImageState: string = ''; // Track current image to avoid unnecessary changes
  public isTransitioning: boolean = false; // Flag to prevent rapid state changes
  public lastJumpTime: number = 0; // Track last jump time for cooldown

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

    // Set initial position to center of container
    this.position = this.getCenterPosition();

    // Initialize all subsystems
    this.setupEventListeners();
    this.setupRandomMessages();
    this.setupDynamicHeight();

    // Initialize with WAVING state for greeting
    this.initializeWavingState();
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
  }

  /**
   * Calculate the center position of the container
   * Returns the X position that centers Kubito horizontally
   */
  private getCenterPosition(): number {
    const containerWidth = this.container.clientWidth || 300; // Fallback width
    const kubitoWidth = KUBITO_CONFIG.KUBITO_WIDTH;
    return (containerWidth - kubitoWidth) / 2;
  }

  /**
   * Calculate the maximum width for movement
   */
  private getMaxWidth(): number {
    return this.container.clientWidth - KUBITO_CONFIG.KUBITO_WIDTH;
  }

  /**
   * Set up event listeners for interaction (hover and click)
   * Click interaction restored for jump functionality
   */
  private setupEventListeners(): void {
    // Remove existing listeners first to avoid duplicates
    this.kubito.removeEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.kubito.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.kubito.removeEventListener('click', this.handleClick.bind(this));

    // Add new listeners
    this.kubito.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.kubito.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    this.kubito.addEventListener('click', this.handleClick.bind(this));
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
   * Handle click events to make Kubito jump
   */
  private handleClick(): void {
    this.performJump();
  }

  /**
   * Set up the random message scheduling system with smart timing
   * Only shows messages when Kubito is paused and in a safe zone
   */
  private setupRandomMessages(): void {
    const scheduleNextMessage = (): void => {
      const delay =
        Math.random() * (MESSAGE_CONFIG.DELAY_MAX - MESSAGE_CONFIG.DELAY_MIN) +
        MESSAGE_CONFIG.DELAY_MIN;

      this.messageInterval = window.setTimeout(() => {
        const timeSinceLastJump = Date.now() - this.lastJumpTime;
        const isInJumpCooldown = timeSinceLastJump < KUBITO_CONFIG.POST_JUMP_COOLDOWN;

        // Show messages when not jumping, not in jump cooldown, and in safe zone
        // Messages only appear during PAUSED state
        if (
          !this.isJumping &&
          !isInJumpCooldown &&
          this.kubitoState === KubitoState.PAUSED &&
          this.isInSafeZone()
        ) {
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
   * Update jump animation with smooth transitions
   */
  private updateJumpAnimation(): void {
    if (!this.isJumping || this.jumpStartTime === null || this.jumpCompleted) {
      return;
    }

    const elapsed = Date.now() - this.jumpStartTime;

    if (elapsed >= KUBITO_CONFIG.JUMP_DURATION) {
      // Mark as completed first to prevent multiple executions
      this.jumpCompleted = true;

      // Record jump completion time for cooldown
      this.lastJumpTime = Date.now();

      // Jump finished - return to appropriate state immediately (no delays)
      const targetImage = this.kubitoState === KubitoState.WANDERING ? 'walking' : 'idle';
      this.setKubitoImage(targetImage);
      this.isJumping = false;
      this.jumpStartTime = null;

      // Reset jumpCompleted after a brief delay to allow new jumps
      setTimeout(() => {
        this.jumpCompleted = false;
      }, 100);
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
    const message = this.getRandomMessage();
    this.showMessage(message);
  }

  /**
   * Display a specific message near Kubito (triggered by events)
   * This method interrupts any active message to prioritize event messages
   * @param message - The message object to display
   */
  public showEventMessage(message: IMessage): void {
    // Don't show messages during jump animations
    if (this.isJumping) {
      return;
    }

    // Cancel any active random message timer
    if (this.messageInterval) {
      clearTimeout(this.messageInterval);
      this.messageInterval = null;
    }

    // Hide any currently displayed message
    if (this.isShowingMessage) {
      this.hideMessage();
    }

    // Show the event message (no longer forced during jumps)
    this.forceShowMessage(message);
  }

  /**
   * Common logic for displaying any message near Kubito (only for random messages)
   * @param message - The message object to display
   */
  private showMessage(message: IMessage): void {
    if (this.isShowingMessage || this.isJumping) {
      return;
    }

    this.forceShowMessage(message);
  }

  /**
   * Force show a message regardless of current state (for event messages)
   * @param message - The message object to display
   */
  private forceShowMessage(message: IMessage): void {
    // Note: Jump check already done in showEventMessage(), safe to proceed

    // Transition to TALKING state when showing a message - immediately
    this.kubitoState = KubitoState.TALKING;

    // Only change to idle image if not already idle (to prevent unnecessary flicker)
    if (this.currentImageState !== 'idle') {
      this.setKubitoImage('idle');
    }

    // Check if we need to change direction for this message (only once)
    const messageWidth = this.calculateMessageWidth(message);
    if (this.willCollideWithBoundary(messageWidth)) {
      this.direction *= -1;
      this.updateDirectionClass();
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
   * Get a contextual message based on current time, with fallback to random
   */
  private getRandomMessage(): IMessage {
    // Check if contextual messaging is enabled (can be configured via settings)
    const enableContextual = this.getContextualSetting();

    const messages = getContextualMessages(enableContextual);
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }

  /**
   * Gets the contextual messaging setting from VS Code configuration
   */
  private getContextualSetting(): boolean {
    // Get configuration from window object injected by extension
    const config = (window as any).kubitoConfig || { contextualMessages: true };
    return config.contextualMessages;
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
   * Update direction class based on current state and direction
   */
  private updateDirectionClass(): void {
    const directionClass = this.direction === 1 ? 'walking-right' : 'walking-left';

    // For idle state, add special class to ensure GIF animation
    if (this.kubitoState === KubitoState.PAUSED || this.kubitoState === KubitoState.TALKING) {
      this.kubito.className = `${directionClass}`;
    } else {
      this.kubito.className = directionClass;
    }

    // Let CSS handle the direction through walking-left/walking-right classes
    // Remove any manual transform to avoid conflicts with CSS
    this.kubito.style.transform = '';
  }

  /**
   * Set Kubito's image based on state with optimized change detection
   */
  private setKubitoImage(state: 'walking' | 'jumping' | 'idle' | 'waving'): void {
    // Avoid unnecessary image changes to prevent flicker
    if (this.currentImageState === state) {
      // Still update direction class in case direction changed
      this.updateDirectionClass();
      return;
    }

    const uriKey = `kubito${state.charAt(0).toUpperCase() + state.slice(1)}Uri`;
    const uri = (window as any)[uriKey] as string;

    if (uri) {
      this.currentImageState = state;

      // Simple direct assignment for all states - no special GIF restart logic
      this.kubito.src = uri;

      // Update direction class
      this.updateDirectionClass();
    } else {
      console.error(`No URI found for state: ${state}, key: ${uriKey}`);
    }

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
    if (imageName === 'kubit-logo') {
      return (window as any).kubitLogoUri as string;
    }
    if (imageName === 'kubit-love') {
      return (window as any).kubitLoveUri as string;
    }

    // Fallback for other images (though we don't have others currently)
    const uriKey = `kubit${imageName.charAt(0).toUpperCase() + imageName.slice(1)}Uri`;
    return (window as any)[uriKey] as string;
  }

  /**
   * Initialize waving state for initial greeting
   */
  private initializeWavingState(): void {
    this.kubitoState = KubitoState.WAVING;
    this.stateStartTime = Date.now();
    this.currentStateDuration = KUBITO_CONFIG.WAVING_DURATION;
    this.setKubitoImage('waving');

    // Update visual position immediately
    this.kubito.style.left = this.position + 'px';
  }

  /**
   * Initialize wandering behavior with random duration
   */
  private initializeWanderingState(): void {
    this.stateStartTime = Date.now();

    if (this.kubitoState === KubitoState.WANDERING) {
      this.currentStateDuration =
        Math.random() * (KUBITO_CONFIG.WANDERING_MAX - KUBITO_CONFIG.WANDERING_MIN) +
        KUBITO_CONFIG.WANDERING_MIN;
    } else if (this.kubitoState === KubitoState.PAUSED) {
      this.currentStateDuration =
        Math.random() * (KUBITO_CONFIG.PAUSE_MAX - KUBITO_CONFIG.PAUSE_MIN) +
        KUBITO_CONFIG.PAUSE_MIN;
    } else if (this.kubitoState === KubitoState.TALKING) {
      this.currentStateDuration = KUBITO_CONFIG.TALKING_DURATION;
    } else if (this.kubitoState === KubitoState.WAVING) {
      this.currentStateDuration = KUBITO_CONFIG.WAVING_DURATION;
    }
  }

  /**
   * Check if current movement state should transition
   */
  private shouldTransitionState(): boolean {
    const elapsed = Date.now() - this.stateStartTime;
    return elapsed >= this.currentStateDuration;
  }

  /**
   * Transition to next movement state with minimal delays
   */
  private transitionKubitoState(): void {
    if (this.isTransitioning) {
      return; // Prevent rapid state changes
    }

    this.isTransitioning = true;

    if (this.kubitoState === KubitoState.WAVING) {
      // After waving, transition to wandering state
      this.kubitoState = KubitoState.WANDERING;
      this.setKubitoImage('walking');
    } else if (this.kubitoState === KubitoState.WANDERING) {
      // Switch to paused state
      this.kubitoState = KubitoState.PAUSED;
      this.setKubitoImage('idle');

      // Random chance to jump when entering pause (but not if we're about to talk)
      // Also check if we're not in post-jump cooldown to avoid immediate jumps
      const timeSinceLastJump = Date.now() - this.lastJumpTime;
      const isInJumpCooldown = timeSinceLastJump < KUBITO_CONFIG.POST_JUMP_COOLDOWN;

      const jumpRoll = Math.random();

      if (jumpRoll < KUBITO_CONFIG.JUMP_CHANCE && !this.isShowingMessage && !isInJumpCooldown) {
        // Small delay to let the idle state settle before jumping
        setTimeout(() => {
          this.triggerRandomJump();
        }, 200);
      }
    } else if (this.kubitoState === KubitoState.PAUSED) {
      // Switch to wandering state (only if not showing a message)
      if (!this.isShowingMessage) {
        this.kubitoState = KubitoState.WANDERING;
        this.setKubitoImage('walking');

        // Potentially change direction when starting to wander - reduced frequency
        if (Math.random() < 0.4) {
          // 15% chance to change direction
          this.direction *= -1;
          this.updateDirectionClass();
        }
      } else {
        // If showing a message, stay in talking state
        this.kubitoState = KubitoState.TALKING;
        // Don't change image - already showing idle for talking
      }
    } else if (this.kubitoState === KubitoState.TALKING) {
      // After talking, go to pause briefly before wandering
      if (!this.isShowingMessage) {
        this.kubitoState = KubitoState.PAUSED;
        // Don't change image if already idle
        if (this.currentImageState !== 'idle') {
          this.setKubitoImage('idle');
        }
        // Set a shorter pause after talking
        this.currentStateDuration = KUBITO_CONFIG.POST_TALKING_PAUSE;
        this.stateStartTime = Date.now();
        this.isTransitioning = false;
        return; // Don't call initializeWanderingState to keep the short duration
      }
    }

    this.initializeWanderingState();
    this.isTransitioning = false;
  }

  /**
   * Trigger a random autonomous jump
   */
  private triggerRandomJump(): void {
    if (this.isJumping) {
      return; // Don't interrupt existing jump
    }

    this.isJumping = true;
    this.jumpStartTime = Date.now();
    this.jumpCompleted = false;
    this.setKubitoImage('jumping');
  }

  /**
   * Check if Kubito is in a safe zone for showing messages
   * Safe zone is the center 90% of the container to avoid edge collisions
   */
  private isInSafeZone(): boolean {
    const containerWidth = this.container.clientWidth;
    const safeZoneStart = containerWidth * KUBITO_CONFIG.SAFE_ZONE_MARGIN;
    const safeZoneEnd = containerWidth * (1 - KUBITO_CONFIG.SAFE_ZONE_MARGIN);

    const kubitoCenter = this.position + KUBITO_CONFIG.KUBITO_WIDTH / 2;
    return kubitoCenter >= safeZoneStart && kubitoCenter <= safeZoneEnd;
  }

  /**
   * Main animation loop with wandering behavior
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

    // Check if we should transition between wandering and paused states
    if (this.shouldTransitionState()) {
      this.transitionKubitoState();
    }

    // Only move if in wandering state (not during waving, paused, or talking)
    if (this.kubitoState === KubitoState.WANDERING) {
      const maxWidth = this.getMaxWidth();

      // Boundary collision detection - change direction if about to hit edge
      if (this.willCollideWithBoundary()) {
        this.direction *= -1;
        this.updateDirectionClass();
      }

      // Update position
      this.position += this.speed * this.direction;

      // Fallback boundary checks (always active for safety)
      if (this.position <= 0) {
        this.position = 0;
        this.direction = 1;
        this.updateDirectionClass();
      } else if (this.position >= maxWidth) {
        this.position = maxWidth;
        this.direction = -1;
        this.updateDirectionClass();
      }

      // Apply position
      this.kubito.style.left = `${this.position}px`;
    }

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

  /**
   * Refresh configuration settings
   * Called when settings change to apply new configuration immediately
   */
  public refreshConfig(): void {
    // Configuration will be automatically picked up on the next message selection
    // through getContextualSetting() method, no additional action needed
  }
}

// Initialize when DOM is ready
let kubitoController: KubitoController | null = null;

function initializeKubito(): void {
  try {
    kubitoController = new KubitoController();
    kubitoController.start();
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
  if (kubitoController) {
    kubitoController.stop();
  }
});

// Listen for messages from the extension host
window.addEventListener('message', event => {
  const message = event.data;

  switch (message.command) {
    case 'updateConfig':
      // Update configuration without full page refresh
      if (message.config && (window as any).kubitoConfig) {
        (window as any).kubitoConfig = message.config;

        // Refresh Kubito's configuration
        if (kubitoController) {
          kubitoController.refreshConfig();
        }
      }
      break;

    case 'showMessage':
      // Show a specific message triggered by events
      if (message.message && kubitoController) {
        kubitoController.showEventMessage(message.message);
      }
      break;
  }
});
