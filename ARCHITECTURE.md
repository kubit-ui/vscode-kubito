# Kubito Extension - Architecture v1.0.0

## 📁 Project Structure

```
src/
├── extension.ts          # Extension backend (Node.js/VS Code APIs)
└── webview/
    ├── tsconfig.json     # TypeScript config for webview
    └── kubito.ts         # Webview frontend (DOM/Browser APIs)

```
media/
├── kubito.css           # Webview styles
├── kubito.js            # Compiled JavaScript from TypeScript
├── kubito.js.map        # Source map for debugging
├── kubito-walking.gif   # Walking animation
├── kubito-jumping.gif   # Jumping animation
├── kubito-idle.gif      # Idle animation
├── kubito-waving.gif    # Waving greeting animation
├── kubito-footing.gif   # Dragging/falling animation
├── kubito-idle-christmas.gif    # Christmas variant: Idle animation with Santa hat
├── kubito-walking-christmas.gif # Christmas variant: Walking with Santa hat
├── kubito-jumping-christmas.gif # Christmas variant: Jumping with Santa hat
├── kubito-waving-christmas.gif  # Christmas variant: Waving with Santa hat
├── kubito-footing-christmas.gif # Christmas variant: Dragging/falling with Santa hat
├── kubit-logo.png       # Custom message icon
└── kubit-love.png       # Custom message icon
```

out/                     # Compiled extension files
└── extension.js         # Compiled backend
```

## 🎮 Core Components

### **1. Extension Backend (`src/extension.ts`)**

- **Webview Provider**: Creates and manages the Kubito webview
- **Resource Management**: Provides secure URIs for all assets
- **VS Code Integration**: Registers commands and handles extension lifecycle
- **Asset Loading**: Makes all sprites and resources available to webview

### **2. Kubito Controller (`src/webview/kubito.ts`)**

- **Animation Engine**: Handles movement, direction changes, and sprite switching
- **Interaction System**:
  - Click-to-jump functionality with priority handling
  - Drag & drop detection with 5px threshold
  - Smart distinction between click and drag
- **Physics Engine** (NEW):
  - Gravity acceleration (0.5 px/frame²) with terminal velocity (15 px/frame)
  - Progressive bounce damping - each bounce reduces more velocity
  - Throw physics that maintains momentum from mouse velocity
  - Horizontal friction (2% loss per frame) for realistic sliding
  - Wall and ceiling collision detection with bounce effects
  - Landing shake effect animation
- **Message System**: Random messages that intelligently follow Kubito
- **Collision Detection**: Smart direction changes to avoid message-edge collisions
- **State Management**: Handles jumping, idle, walking, dragging, falling, and messaging states

### **3. Message System**

- **Auto-generation**: Messages appear every 3-7 seconds
- **Dynamic Following**: Speech bubbles follow Kubito as he moves
- **Smart Positioning**: Messages trigger direction changes to avoid edge
  collisions
- **Priority Handling**: Jump interactions cancel active messages
- **Content Types**: Emojis, text, and custom Kubit team images
- **Christmas Mode Integration**: 100% Christmas-themed text messages when active (emojis still work)

### **4. Configuration System**

- **Christmas Mode**: Seasonal theme with decorations and themed animations
  - **Auto Mode** (default): Automatically enables during December
  - **Enabled**: Force Christmas mode year-round
  - **Disabled**: Disable Christmas mode even in December
- **Dynamic Asset Loading**: Switches between normal and Christmas GIF variants based on configuration
- **Welcome Notification**: One-time notification with 8-second delay to inform users about Christmas mode
- **Commands**:
  - `kubito.enableChristmas`: Enable Christmas mode
  - `kubito.disableChristmas`: Disable Christmas mode

## 🎨 Animation States & Movement System

### **Enhanced State Machine**

```
WAVING ──timer(1.5s)──→ WANDERING ──timer(4-8s)──→ PAUSED ──timer(1-2.5s)──→ WANDERING
(startup only)             ↑                          ↓                          ↑
                           └── Message Display ──────┼── TALKING ──timer(3s)────┘
                                                      ↓
                                                Jump(20% chance)
                                                      ↓
                                                  JUMPING ──800ms──┐
                                                      ↑             │
                                                      └─────────────┘

                    Drag & Drop with Physics (NEW)
                    ─────────────────────────────
PAUSED/WANDERING/TALKING ──mousedown+mousemove──→ DRAGGING ──drop──→ FALLING
                                                                         ↓
                                                                    BOUNCING (progressive damping)
                                                                         ↓
                                                                      PAUSED
```

### **Kubito States (KubitoState enum)**

- **WAVING**: Initial greeting state (1.5 seconds) when extension loads, centered and stationary
- **WANDERING**: Active movement at 0.08px/frame with boundary detection and potential direction changes
- **PAUSED**: Stationary state lasting 1-2.5 seconds, safe zone for messages
- **JUMPING**: 800ms autonomous jump animation with cooldown system
- **TALKING**: Message display state with Kubito paused and speech bubble following
- **DRAGGING** (NEW): User is dragging Kubito with mouse, shows footing animation
- **FALLING** (NEW): Kubito falling from drop, applies gravity physics and bouncing

### **Sprite Management**

- **Waving State**: `kubito-waving.gif` - Friendly greeting animation
- **Walking State**: `kubito-walking.gif` - Smooth continuous movement animation
- **Jumping State**: `kubito-jumping.gif` - Jump sequence with landing
- **Idle State**: `kubito-idle.gif` - Idle animation
- **Dragging/Falling State**: `kubito-footing.gif` - Used during drag and fall states
- **Christmas Variants**: All animations have `-christmas.gif` variants with Santa hat
- **Dynamic Loading**: GIF source switches based on `christmasMode` configuration
- **Direction Classes**: `walking-right` / `walking-left` for CSS transforms

### **Smart Timing System**

- **Waving Duration**: 1.5 seconds on extension load
- **Wandering Duration**: 4-8 seconds of active movement
- **Pause Duration**: 1-2.5 seconds
- **Jump Probability**: 20% chance when entering pause state
- **Message Safe Zone**: 70% center area for optimal visibility and collision avoidance
- **Jump Cooldown**: 1-second buffer prevents jumps in rapid succession
- **Landing Cooldown**: 1-second buffer prevents messages immediately after drop (NEW)
- **Movement Speed**: 0.08px/frame for smooth, non-distracting motion
- **Click vs Drag Threshold**: 5px movement required to trigger drag (NEW)

### **Physics Constants** (NEW)

```typescript
// Gravity & Bouncing
GRAVITY: 0.5                    // Acceleration in px/frame²
TERMINAL_VELOCITY: 15           // Maximum falling speed
BOUNCE_DAMPING: 0.4             // 40% initial bounce reduction (progressive)
MIN_BOUNCE_VELOCITY: 2          // Minimum velocity required to bounce
SHAKE_DURATION: 200             // Landing shake effect duration (ms)
SHAKE_INTENSITY: 3              // Shake movement distance (pixels)

// Throw Physics
THROW_VELOCITY_SCALE: 0.5       // Scale factor: 50% of mouse velocity
THROW_MAX_VELOCITY: 20          // Maximum throw speed (px/frame)
THROW_FRICTION: 0.98            // Horizontal friction (2% loss per frame)
THROW_MIN_VELOCITY: 0.5         // Velocity threshold to stop horizontal movement
```

**Progressive Bounce System**: Each bounce reduces more velocity
- 1st bounce: 40% damping (60% velocity remains)
- 2nd bounce: 60% damping (40% velocity remains)
- 3rd bounce: 80% damping (20% velocity remains)
- And so on, up to maximum 90% damping

## 🔄 Event Flow

### **Autonomous Movement Cycle**

1. **Waving Phase** (1.5s): Extension loads → Kubito waves greeting from center position
2. **Transition to Wandering**: After waving completes → Kubito begins walking with potential direction change
3. **Wandering Phase**: Kubito moves at 0.08px/frame for 4-8 seconds
4. **Transition to Pause**: Natural deceleration to stationary state
5. **Pause Phase**: 1-2.5 seconds of idle animation in safe zone
6. **Optional Jump**: 20% probability of autonomous jump with 800ms animation
7. **Message Opportunity**: Messages only appear during pause in safe zone
8. **Return to Wandering**: Cycle continues with potential direction changes

### **Drag & Drop Physics Flow**

1. **Click Detection** (mousedown): Record initial mouse position and timestamp
2. **Drag Threshold** (mousemove): If movement > 5px → transition to DRAGGING state
3. **Dragging**: Show footing animation, follow cursor position, track velocity for throw
4. **Velocity Calculation**: Calculate throw velocity based on mouse delta and time
5. **Drop Trigger**:
   - Release mouse (mouseup) → start falling with throw velocity
   - Leave viewport (mouseleave) → immediate drop
   - ESC key → cancel drag immediately
6. **Falling Phase**:
   - Apply gravity acceleration
   - Apply horizontal friction to throw velocity
   - Check ceiling/floor collisions
7. **Bounce Phase**:
   - Land on floor → calculate bounce with progressive damping
   - If velocity > MIN_BOUNCE_VELOCITY → bounce up with reduced velocity
   - If velocity ≤ MIN_BOUNCE_VELOCITY → stop bouncing
8. **Landing State**: Return to PAUSED with shake effect and landing cooldown
9. **Resume Autonomy**: After landing cooldown → resume normal state machine (WANDERING)

### **Smart Message System**

1. Timer triggers (3-7s random) → Validate conditions (paused + safe zone)
2. Show speech bubble → Transition to TALKING state
3. Follow Kubito's position → Maintain bubble alignment during pause
4. Smart positioning → Prevent edge collisions with 70% center safe zone
5. After 3s → Fade out bubble → Brief pause before returning to wandering

### **Christmas Mode Flow**

1. **Configuration Check**: Read `kubito.christmasMode` setting ('auto'/'enabled'/'disabled')
2. **Auto Detection**: If 'auto' → check if current month is December
3. **Asset Selection**: Load `-christmas.gif` variants if Christmas mode active
4. **CSS Decorations**: Apply Christmas decorations (snowflakes, lights, shooting stars)
5. **Message Pool**: Switch to 100% Christmas-themed text messages (10 messages in 14 languages)
6. **Welcome Notification**: Show one-time notification after 8 seconds (if not previously shown)
7. **User Actions**: User can keep, disable, or open settings from notification
8. **Persistence**: Store notification state in globalState to show only once

### **Performance Optimizations**

1. **Efficient DOM Updates**: State tracking prevents unnecessary image changes
2. **Frame-perfect Timing**: RequestAnimationFrame ensures 60fps smoothness
3. **Memory Management**: Proper event cleanup and state management
4. **Physics Optimization** (NEW): Velocity-based calculations with early termination when below thresholds
5. **Collision Detection** (NEW): Optimized boundary checks for wall, ceiling, and floor collisions

## 🔧 Build Process

```bash
# Development
npm run compile:extension  # Compiles backend TypeScript
npm run compile:webview    # Compiles webview TypeScript → media/kubito.js
npm run compile           # Compiles everything

# Testing
npm run test             # Runs all tests (16 test cases)
npm run lint             # ESLint code analysis
npm run lint:fix         # Auto-fix linting issues

# Production
vsce package             # Creates .vsix file
```

## 🎯 Performance Optimizations

- **60fps Animation Loop**: RequestAnimationFrame for smooth movement with intelligent state transitions
- **Efficient State Updates**: KubitoState enum eliminates redundant DOM operations
- **Optimized Movement Speed**: 0.08px/frame for natural, non-distracting interaction
- **Minimal DOM Manipulation**: Reuse elements when possible
- **Smart Safe Zone**: 70% center area reduces collision detection overhead
- **Velocity-Based Physics** (NEW): Early termination of physics calculations when velocity below minimum thresholds
- **Efficient Collision Detection** (NEW): Optimized boundary checks for smooth interactions

## 🎄 Christmas Mode Architecture

### **CSS Decorations**

Seven CSS animations create the festive atmosphere:

1. **Snowflakes** (`@keyframes snowfall`): Three layers with different speeds and sizes
2. **Christmas Lights** (`@keyframes blink`): Alternating red/green lights with twinkling effect
3. **Shooting Stars** (`@keyframes shooting-star`): Three variants with different trajectories

### **Localization System**

- **10 Christmas Messages**: Added to all 14 supported languages
- **ITranslations Interface**: Extended with Christmas message fields
- **Message Priority**: When Christmas mode active, text messages are 100% Christmas-themed
- **Emoji Support**: Emoji messages continue to work alongside Christmas messages

### **Configuration Architecture**

```typescript
enum ChristmasMode {
  auto = 'auto',      // Default: auto-detect December
  enabled = 'enabled', // Force enabled year-round
  disabled = 'disabled' // Force disabled even in December
}
```

### **Asset Management**

- **Naming Convention**: Base GIF + `-christmas.gif` suffix
- **Dynamic Loading**: `getGifPath()` function checks configuration and appends suffix
- **Fallback Safety**: If Christmas variant missing, falls back to normal GIF
- **5 Animation Variants**: All Kubito states have Christmas versions

## 🔒 Security Considerations

- **Sandboxed Webview**: Isolated from main VS Code process
- **Secure Resource Loading**: All assets served via VS Code's URI system
- **CSP Compliance**: Content Security Policy for web resources
- **No External Dependencies**: All resources bundled locally

## 📝 Development Notes

- **TypeScript First**: Both backend and frontend use TypeScript
  interaction
- **Extensible**: Easy to add new sprites, messages, or behaviors
- **VS Code Standards**: Follows VS Code extension development best practices
