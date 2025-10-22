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
├── kubito_walking.gif   # Walking animation
├── kubito_jumping.gif   # Jumping animation
├── kubito_idle.png      # Idle sprite
├── kubit_logo.png       # Custom message icon
└── kubit_love.png       # Custom message icon

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

- **Auto-generation**: Messages appear every 5-10 seconds
- **Dynamic Following**: Speech bubbles follow Kubito as he moves
- **Smart Positioning**: Messages trigger direction changes to avoid edge
  collisions
- **Priority Handling**: Jump interactions cancel active messages
- **Content Types**: Emojis, text, and custom Kubit team images

## 🎨 Animation States

### **State Machine**

```
Walking ──click──→ Jumping ──1s──→ Idle ──300ms──→ Walking
   ↑                                                  ↓
   └─────────── Message Display (follows) ←──────────┘
```

### **Sprite Management**

- **Walking State**: `kubito_walking.gif` - Continuous movement
- **Jumping State**: `kubito_jumping.gif` - 1-second jump animation
- **Idle State**: `kubito_idle.png` - 300ms static sprite after landing
- **Direction Classes**: `walking-right` / `walking-left` for CSS transforms

## 🔄 Event Flow

### **User Interaction**

1. User clicks Kubito → Cancel any active message
2. Switch to jumping sprite → Set jumping state
3. After 1s → Switch to idle sprite for 300ms
4. Return to walking sprite → Resume movement

### **Message Lifecycle**

1. Timer triggers (5-10s random) → Check if not jumping
2. Show speech bubble → Set showing message state
3. Follow Kubito's movement → Update bubble position each frame
4. Check edge collision → Change Kubito direction if needed
5. After 3s → Fade out bubble → Reset message state

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

- **60fps Animation Loop**: RequestAnimationFrame for smooth movement
- **Efficient Updates**: Only update bubble position when message is active
- **State Guards**: Prevent redundant operations with state checks
- **Relaxed Speed**: 0.3px/frame for comfortable interaction
- **Minimal DOM Manipulation**: Reuse elements when possible

## 🔒 Security Considerations

- **Sandboxed Webview**: Isolated from main VS Code process
- **Secure Resource Loading**: All assets served via VS Code's URI system
- **CSP Compliance**: Content Security Policy for web resources
- **No External Dependencies**: All resources bundled locally

## 🆕 v1.0.0 Features

- **Professional Structure**: Follows Microsoft VS Code extension standards
- **Comprehensive Testing**: 16 test cases covering all functionality
- **Interactive Jumping**: Click-to-jump with priority over messages
- **Smart Message Following**: Bubbles track Kubito's movement
- **Collision Intelligence**: Direction changes to prevent edge collisions
- **Multi-sprite System**: Walking, jumping, and idle animations
- **Optimized Timing**: Improved animation speeds and durations
- **Enhanced UX**: Hover effects and visual feedback
- **Open Source Ready**: Clean code structure and documentation

## 📝 Development Notes

- **TypeScript First**: Both backend and frontend use TypeScript
- **Modular Design**: Clear separation between animation, messaging, and
  interaction
- **Extensible**: Easy to add new sprites, messages, or behaviors
- **VS Code Standards**: Follows VS Code extension development best practices
