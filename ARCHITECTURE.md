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

### **2. Kubito Walker (`src/webview/kubito.ts`)**

- **Animation Engine**: Handles movement, direction changes, and sprite
  switching
- **Interaction System**: Click-to-jump functionality with priority handling
- **Message System**: Random messages that intelligently follow Kubito
- **Collision Detection**: Smart direction changes to avoid message-edge
  collisions
- **State Management**: Handles jumping, idle, walking, and messaging states

### **3. Message System**

- **Auto-generation**: Messages appear every 3-7 seconds
- **Dynamic Following**: Speech bubbles follow Kubito as he moves
- **Smart Positioning**: Messages trigger direction changes to avoid edge
  collisions
- **Priority Handling**: Jump interactions cancel active messages
- **Content Types**: Emojis, text, and custom Kubit team images

## 🎨 Animation States & Movement System

### **Enhanced State Machine**

```
WAVING ──timer(1.5s)──→ WANDERING ──timer(4-8s)──→ PAUSED ──timer(1-2.5s)──→ WANDERING
(startup only)             ↑                          ↓                          ↑
                           └── Message Display ──────┼── TALKING ──timer(3s)────┘
                                                      ↓
                                                Jump(20% chance)
                                                      ↓
                                                  JUMPING ──800ms── → back to appropriate state
```

### **Kubito States (KubitoState enum)**

- **WAVING**: Initial greeting state (1.5 seconds) when extension loads, centered and stationary
- **WANDERING**: Active movement at 0.08px/frame with boundary detection and potential direction changes
- **PAUSED**: Stationary state lasting 1-2.5 seconds, safe zone for messages
- **JUMPING**: 800ms autonomous jump animation with cooldown system
- **TALKING**: Message display state with Kubito paused and speech bubble following

### **Sprite Management**

- **Waving State**: `kubito-waving.gif` - Friendly greeting animation
- **Walking State**: `kubito-walking.gif` - Smooth continuous movement animation
- **Jumping State**: `kubito-jumping.gif` - Jump sequence with landing
- **Idle State**: `kubito-idle.gif` -  Idle animation
- **Direction Classes**: `walking-right` / `walking-left` for CSS transforms

### **Smart Timing System**

- **Waving Duration**: 1.5 seconds on extension load
- **Wandering Duration**: 4-8 seconds of active movement
- **Pause Duration**: 1-2.5 seconds
- **Jump Probability**: 20% chance when entering pause state
- **Message Safe Zone**: 70% center area for optimal visibility and collision avoidance
- **Jump Cooldown**: 1-second buffer prevents jumps in rapid succession
- **Movement Speed**: 0.08px/frame for smooth, non-distracting motion

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

### **Smart Message System**

1. Timer triggers (3-7s random) → Validate conditions (paused + safe zone)
2. Show speech bubble → Transition to TALKING state
3. Follow Kubito's position → Maintain bubble alignment during pause
4. Smart positioning → Prevent edge collisions with 70% center safe zone
5. After 3s → Fade out bubble → Brief pause before returning to wandering

### **Performance Optimizations**

1. **Efficient DOM Updates**: State tracking prevents unnecessary image changes
2. **Frame-perfect Timing**: RequestAnimationFrame ensures 60fps smoothness
3. **Memory Management**: Proper event cleanup and state management

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
