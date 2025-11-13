# Kubito Extension - Architecture v1.0.0

## 📁 Project Structure

```
src/
├── extension.ts          # Extension backend (Node.js/VS Code APIs)
└── webview/
    ├── tsconfig.json     # TypeScript config for webview
    └── kubito.ts         # Webview frontend (DOM/Browser APIs)

media/
├── kubito.css           # Webview styles
├── kubito.js            # Compiled JavaScript from TypeScript
├── kubito.js.map        # Source map for debugging
├── kubito-walking.gif   # Walking animation
├── kubito-jumping.gif   # Jumping animation
├── kubito-idle.gif      # Idle animation
├── kubit-logo.png       # Custom message icon
└── kubit-love.png       # Custom message icon

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
WANDERING ──timer(3-5s)──→ PAUSED ──timer(1-2.5s)──→ WANDERING
    ↑                         ↓                          ↑
    └── Message Display ──────┼── TALKING ──timer(3s)────┘
                              ↓
                        Jump(20% chance)
                              ↓
                          JUMPING ──800ms── → back to appropriate state
```

### **Kubito States (KubitoState enum)**

- **WANDERING**: Active movement at 0.15px/frame with boundary detection
- **PAUSED**: Stationary state lasting 1-2.5 seconds, safe zone for messages
- **JUMPING**: 800ms autonomous jump animation with cooldown system
- **TALKING**: Message display state with Kubito paused and speech bubble following

### **Sprite Management**

- **Walking State**: `kubito-walking.gif` - Smooth continuous movement animation
- **Jumping State**: `kubito-jumping.gif` - 800ms jump sequence with landing
- **Idle State**: `kubito-idle.gif` -  Idle animation
- **Direction Classes**: `walking-right` / `walking-left` for CSS transforms

### **Smart Timing System**

- **Wandering Duration**: 3-5 seconds of active movement
- **Pause Duration**: 1-2.5 seconds
- **Jump Probability**: 20% chance when entering pause state
- **Message Safe Zone**: 90% center area for optimal visibility
- **Jump Cooldown**: 1-second buffer prevents message conflicts

## 🔄 Event Flow

### **Autonomous Movement**

1. **Wandering Phase**: Kubito moves at 0.15px/frame for 3-5 seconds
2. **Transition to Pause**: Natural deceleration to stationary state
3. **Pause Phase**: 1-2.5 seconds of idle animation in safe zone
4. **Optional Jump**: 20% probability of autonomous jump with 800ms animation
5. **Message Opportunity**: Messages only appear during pause in safe zone
6. **Return to Wandering**: Cycle continues with potential direction changes

### **Smart Message System**

1. Timer triggers (3-7s random) → Validate conditions (paused + safe zone + no jump cooldown)
2. Show speech bubble → Transition to TALKING state
3. Follow Kubito's position → Maintain bubble alignment during pause
4. Smart positioning → Prevent edge collisions with expanded safe zone
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
- **Optimized Movement Speed**: 0.15px/frame for natural, comfortable interaction
- **Minimal DOM Manipulation**: Reuse elements when possible

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
