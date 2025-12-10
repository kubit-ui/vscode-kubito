# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.7.0] - 2024-12-10

### ✨ Added

- **🎄 Christmas Mode** - Festive holiday theme with visual decorations and contextual messages
  - **Automatic Activation** - Automatically enables during December (configurable)
  - **Configuration Options** - Three modes: `auto` (December only), `enabled` (always on), `disabled` (never)
  - **Visual Decorations**:
    - Animated snowflakes with random sizes, speeds, and positions (15 snowflakes)
    - Christmas lights garland with red/green alternating lights (20 lights with flash animation)
    - Shooting stars with multiple trajectories (diagonal, steep, gentle)
  - **Christmas Messages** - 10 new contextual messages in 14 languages:
    - `merryChristmas`, `hoHoHo`, `santaApproves`, `christmasSpirit`, `jingleCode`
    - `christmasCommit`, `winterCoding`, `giftOfCode`, `codingElf`, `sleighride`
  - **Christmas-Themed Animations** - 5 new GIF variants with Santa hat:
    - `kubito-idle-christmas.gif`, `kubito-walking-christmas.gif`, `kubito-jumping-christmas.gif`
    - `kubito-waving-christmas.gif`, `kubito-footing-christmas.gif`
  - **Welcome Notification** - User-friendly onboarding for Christmas mode:
    - Appears 8 seconds after webview loads (allows users to see decorations first)
    - Three action buttons: "Keep it", "Disable", "Settings"
    - Shows only once per user using VS Code globalState persistence
  - **Commands**:
    - `Kubito: Enable Christmas Mode` - Force enable decorations
    - `Kubito: Disable Christmas Mode` - Force disable decorations
  - **Localization** - Complete translations for all 14 supported languages (EN, ES, FR, DE, PT, IT, JA, KO, ZH-CN, RU, NL, PL, TR, AR)


## [2.5.1] - 2025-11-21

### 🐛 Bug Fixes

- **Message Safe Zone Validation** - Fixed issue where productivity messages (reminders and metrics) and event-triggered messages were displaying outside of Kubito's safe zone, causing text overflow at container edges
  - Added safe zone validation to `showEventMessage()` to prevent productivity messages from appearing at edges
  - Refactored `showMessage()` to include safe zone check for consistent behavior across all message types
  - Removed redundant safe zone validation from `setupRandomMessages()` timer
  - Centralized safe zone logic in message display methods for better maintainability
  - All messages now respect the safe zone (center 70% of container with 15% margin on each side)

### 📚 Documentation

- **README.md Updates** - Enhanced documentation with demo GIF as visual demonstration of extension functionality

## [2.6.0] - 2025-11-19

### ✨ Added

- **🎮 Interactive Drag & Drop** - Kubito can now be dragged and dropped anywhere in the webview
  - Click detection vs drag detection with 5px threshold
  - Gravity physics with terminal velocity and bounce effects
  - Progressive bounce damping (each bounce reduces more velocity)
  - Throw physics - maintains momentum when released during fast movement
  - Wall and ceiling collision detection with bounce
  - Smooth landing with shake effect
  - Message hiding when dragging starts
  - ESC key to cancel drag
  - Drop detection when cursor leaves viewport
- **🎯 New Animation State** - `DRAGGING` state with footing GIF asset
- **🌊 Physics System** - Complete gravity-based physics engine
  - Gravity acceleration: 0.5 px/frame²
  - Terminal velocity: 15 px/frame
  - Bounce damping: 40% initial, progressively increasing
  - Shake effect on landing: 200ms duration
  - Throw velocity scaling and clamping
  - Friction-based horizontal movement

### 🔧 Changed

- **Coordinate System** - Refactored from top-based to bottom-based positioning for easier physics calculations
- **Cursor Behavior** - Improved cursor states: `pointer` on hover, `grabbing` while dragging
- **State Machine** - Enhanced with `DRAGGING` and `FALLING` states for drag & drop
- **CSS** - Removed static `bottom: 0` positioning, now fully dynamic with JavaScript


## [2.5.0] - 2025-11-15

### 🚀 Productivity & Wellness Features

- **🧘‍♂️ Smart Reminders** - Kubito now reminds you to take breaks, drink water,
  check posture, and rest your eyes with configurable intervals
- **📊 Coding Metrics** - Track your productivity with real-time metrics
  including:
  - Session duration and active coding time
  - Lines written per hour
  - Files modified count
  - Productivity score (0-100)
  - Most active programming language
- **⚙️ Productivity Configuration** - New settings to customize:
  - Break reminder intervals (15-120 minutes, default: 30)
  - Water reminder intervals (20-180 minutes, default: 45)
  - Metrics display intervals (30-300 minutes, default: 60)
  - Enable/disable individual reminder types
- **🎯 Productivity Command** - New "Kubito: Show Productivity Metrics" command
  to view detailed stats
- **🌍 Expanded Language Support** - Kubito now supports **14 languages**:
  - 🇪🇸 Spanish (Español)
  - 🇺🇸 English
  - 🇫🇷 French (Français)
  - 🇩🇪 German (Deutsch)
  - 🇵🇹 Portuguese (Português)
  - 🇮🇹 Italian (Italiano)
  - 🇯🇵 Japanese (日本語) - **NEW**
  - 🇰🇷 Korean (한국어) - **NEW**
  - 🇨🇳 Chinese Simplified (中文简体) - **NEW**
  - 🇷🇺 Russian (Русский) - **NEW**
  - 🇳🇱 Dutch (Nederlands) - **NEW**
  - 🇵🇱 Polish (Polski) - **NEW**
  - 🇸🇦 Arabic (العربية) - **NEW**
  - 🇹🇷 Turkish (Türkçe) - **NEW**
- **🎭 Intelligent Tracking** - Automatic activity detection with idle timeout
  to ensure accurate metrics

### 🔧 Technical Improvements

- **📦 Modular Architecture** - New ProductivityManager class for clean
  separation of concerns
- **⚡️ Performance Optimization** - Efficient event tracking with proper
  cleanup and resource management
- **🛡️ Type Safety** - Full TypeScript implementation with comprehensive
  interfaces

## [2.4.0] - 2025-11-14

### ✨ Waving State & Animation Optimization

- **👋 Waving Greeting Animation** - Kubito now waves when the extension loads,
  creating a friendly first impression before starting to wander
- **🎯 Smooth State Transitions** - New WAVING state (1.5 second duration)
  smoothly transitions to wandering behavior
- **⚙️ Optimized Animation Timings** - Further refined movement speed and
  behavior patterns for a less distracting experience:
  - Movement speed reduced from 0.15 to 0.08 pixels/frame for subtler animations
  - Wandering duration increased from 3-5s to 4-8s for more relaxed pacing
  - Pause duration: 1-2.5s range for state balance
  - Jump probability: 20% chance during pause state
  - Safe zone: 70% center area for better message positioning

## [2.3.0] - 2025-11-13

### ✨ Enhanced Movement & Animation System

- **🎮 Natural Wandering Behavior** - Kubito now follows realistic movement
  patterns with alternating wandering and pause states
- **⚡️ Optimized Movement Speed** - Reduced movement speed from 0.2 to 0.15
  pixels/frame for more natural, relaxed pacing
- **🔄 Smart State Management** - New KubitoState system (WANDERING, PAUSED,
  JUMPING, TALKING) with intelligent transitions
- **🎪 Autonomous Jump Behavior** - Kubito now occasionally jumps on his own
  with 20% probability during pause states

### 🛠️ Technical Improvements

- **🏗️ Better Architecture** - Clean separation between movement states, timing
  logic, and visual updates
- **🎯 Message Logic** - Smart timing ensures messages only appear during paused
  state in safe zone (3-7 second intervals)
- **⏱️ Jump Cooldown** - 1-second cooldown after jumps prevents message
  conflicts
- **🎨 Asset Consistency** - Renamed assets from `kubito_*` to `kubito-*` format
  for consistency

## [2.2.0] - 2025-11-12

### ✨ Editor and Git Event Reactions

- **💾 File Save Reactions** - Kubito now shows a disk emoji when you save files
- **🔄 Git Commit Detection** - Shows "Committed!" message when you make Git
  commits
- **🚀 Git Push Detection** - Shows "Pushed!" message when you push to remote
  repositories
- **⚡️ Real-time Response** - Immediate reactions using file system watchers
  for `.git/logs/HEAD` and `.git/logs/refs/remotes`

### ⚙️ Enhanced Configuration

- **🎛️ Event Settings** - New configuration options to control reactions:
  - `kubito.events.fileSave` - Toggle file save reactions (default: enabled)
  - `kubito.events.gitCommit` - Toggle Git commit reactions (default: enabled)
  - `kubito.events.gitPush` - Toggle Git push reactions (default: enabled)
- **⚙️ Quick Settings Access** - New "Kubito: Configure Event Reactions" command
  for easy setup
- **🔧 Event Message Priority** - Event messages interrupt random messages for
  immediate feedback

## [2.1.0] - 2025-11-11

### ✨ Smart Contextual Messages

- **🕐 Time-Aware Messages** - Messages now adapt to the time of day and day of
  the week
- **🌅 Morning Context** - Motivational messages like "Let's code!", "Coffee?",
  "Feeling motivated!" during 6 AM - 12 PM
- **🌆 Evening Context** - Wind-down messages like "Working late", "One more
  bug...", "Need sleep..." during 6 PM - 10 PM
- **🌙 Late Night Context** - Night owl messages like "Coding late night",
  "Infinite loop", "Caffeinated and ready" during 10 PM - 6 AM
- **💙 Monday Blues** - Special Monday motivation with "Monday coding blues",
  "Coffee?", "Let's code!"
- **🎉 Friday Feeling** - End-of-week celebration with "Friday deploy!", "Friday
  feeling!", "Almost there!"
- **📅 Weekend Coding** - Relaxed weekend vibes with "Weekend coding?", "Side
  project time!", "Procrastinating a bit..."

### ⚙️ Enhanced Configuration

- **🔧 Contextual Messages Setting** - New `kubito.contextualMessages` setting
  to enable/disable time-aware messages
- **🎛️ User Control** - Users can choose between contextual messages or
  completely random selection
- **📊 Weighted Selection** - 70% contextual messages, 20% universal, 10% random
  for perfect balance

### 🌍 Extended Localization

- **➕ New Messages** - Added `motivated`, `meetingTime`, `sideProject` messages
  in all 6 languages
- **🔄 Message Consistency** - All contextual messages properly translated
  across English, Spanish, French, German, Portuguese, and Italian

### 🧪 Quality Improvements

- **✅ Comprehensive Testing** - Added full test suite for contextual message
  logic
- **🕐 Time Detection Tests** - Validates morning, afternoon, evening, and late
  night detection
- **📅 Day Context Tests** - Ensures proper Monday, Friday, weekend, and workday
  recognition
- **🔍 Message Validation** - Tests message structure and contextual mapping
  integrity

### Major Language Expansion

- **6 Languages Support** - Complete localization for English, Spanish, French,
  Portuguese, German, and Italian
- **Automatic Language Detection** - Smart detection based on VS Code language
  settings
- **70+ Unique Messages** - Expanded message collection with programming humor
  and developer culture references
- **Language Configuration** - Manual language selection with real-time
  switching

### Enhanced Message System

- **Programming Humor** - Original jokes about bugs, deployments, and developer
  life
- **Developer Culture References** - Messages about Stack Overflow, git,
  debugging, and more
- **Emotional States** - Messages reflecting different coding moods (frustrated,
  inspired, tired, caffeinated)
- **Technology Specific** - References to popular frameworks, languages, and
  tools
- **Time-Contextual** - Messages for different times (Monday blues, Friday
  deploys, late night coding)

### New Message Categories

- **Debugging & Bugs** - Humorous takes on the debugging process
- **Development Tools** - References to popular dev tools and workflows
- **Programming Languages** - Jokes about different programming languages
- **Developer Lifestyle** - Messages about coding habits and developer culture
- **Productivity & Motivation** - Encouraging and relatable developer messages
- **Technical Concepts** - Fun references to algorithms, data structures, and CS
  concepts

### Technical Improvements

- **Expanded Type System** - Complete TypeScript interfaces for all message
  categories
- **Modular Architecture** - Clean separation of localization logic
- **Comprehensive Test Coverage** - Full test suite covering all 6 languages
- **Webview Integration** - Seamless message injection without module conflicts
- **Performance Optimized** - Efficient message loading and language switching

### Bug Fixes

- **Translation Injection** - Fixed issue where message keys were displayed
  instead of translated content
- **Webview Module Loading** - Fixed ES module import issues in webview context
- **Timing Issues** - Resolved race condition between translation loading and
  message display
- **VS Code Compatibility** - Improved compatibility with VS Code 1.74.0+
- **Configuration Listening** - Automatic updates when language settings change
- **Memory Management** - Optimized translation loading and caching

### Language Coverage

#### 🇺🇸 English - Complete localization with developer humor

#### 🇪🇸 Español - Fully localized with cultural programming references

#### 🇫🇷 Français - Complete French translation for developers

#### 🇵🇹 Português - Brazilian Portuguese developer culture

#### 🇩🇪 Deutsch - German localization with tech industry references

#### 🇮🇹 Italiano - Italian translation with programming passion

### Statistics

- **Languages**: 6 (English, Spanish, French, Portuguese, German, Italian)
- **Messages**: 70+ unique programming-related messages per language
- **Categories**: 8+ message categories (debugging, tools, languages, lifestyle,
  etc.)
- **Test Coverage**: 25+ comprehensive tests covering all functionality
- **Compatibility**: VS Code 1.74.0+ (covers 95%+ of active VS Code
  installations)

### Documentation

- **Multi-Language Guide** - Complete documentation for all supported languages
- **Message Categories** - Documentation of all message types and contexts
- **Developer Guide** - Instructions for adding new languages and messages
- **Cultural Notes** - Context for language-specific programming humor

## [2.0.0] - 2025-10-22

🎉 **Major Release** - Kubito VS Code Extension - Production Ready

### 🚀 New Features

- **Interactive Coding Companion** - Kubito walks continuously in the Explorer
  sidebar
- **Click-to-Jump Animation** - Interactive jumping with special animation
  priority and timing
- **Smart Messaging System** - Random encouraging messages, emojis, and Kubit
  branding
- **Intelligent Boundary Detection** - Kubito automatically changes direction at
  container edges
- **Multiple Animation States** - Walking GIF, jumping GIF, and idle PNG with
  smooth transitions
- **Visual Hover Effects** - Attractive glow effect when hovering over Kubito
- **Auto-Show Functionality** - Kubito appears automatically when opening VS
  Code (configurable)
- **User Configuration** - Customizable auto-show behavior via VS Code settings
- **Responsive Design** - Adapts to different webview sizes and VS Code themes

### ⚙️ Technical Improvements

- **Modern ESLint 9 Flat Config** - Updated to latest ESLint configuration
  standard
- **Comprehensive Error Handling** - Graceful fallbacks for missing resources
  and API failures
- **Performance Optimized** - Efficient requestAnimationFrame usage with proper
  cleanup
- **TypeScript Enhanced** - Full type safety with detailed interfaces and
  documentation
- **Memory Management** - Proper cleanup of intervals, timeouts, and animation
  frames
- **Accessibility Ready** - Alt text support and keyboard interaction patterns

### 🛠️ Development & Quality

- **Enhanced Documentation** - Comprehensive English comments throughout
  codebase
- **Improved Test Coverage** - Updated test descriptions and error handling
  validation
- **GitHub Actions Integration** - Automated build, test, and publish pipeline
- **Code Quality** - Prettier formatting, strict TypeScript, and ESLint
  validation
- **CI/CD Pipeline** - Automated version management and marketplace publishing

### 🔧 Bug Fixes & Stability

- **Resolved CI/CD Issues** - Fixed GitHub Actions workflow compilation errors
- **ESLint Configuration** - Migrated from legacy .eslintrc.json to modern flat
  config
- **Build Process** - Proper TypeScript compilation with `out/extension.js`
  generation
- **Test Environment** - Fixed headless testing with xvfb for CI environments
- **Package Lock Files** - Resolved .gitignore conflicts with yarn.lock handling
- **Memory Leaks** - Proper cleanup of animation frames and event listeners
- **Cross-Platform Compatibility** - Ensured consistent behavior across
  operating systems

### 📦 Package & Distribution

- **Production Ready** - Optimized for VS Code Marketplace publication
- **VS Code 1.74+** compatibility with modern extension APIs
- **Cross-Platform Support** - Tested on Windows, macOS, and Linux
- **Apache 2.0 License** - Open source with commercial-friendly licensing
- **Professional Structure** - Follows Microsoft extension development
  guidelines
- **Automated Publishing** - GitHub Actions workflow for seamless releases

### 🎨 Visual & UX Features

- **Smooth Animations** - 60fps performance with requestAnimationFrame
  optimization
- **Interactive Feedback** - Immediate response to user clicks and hover actions
- **Customizable Behavior** - User settings for auto-show and companion
  preferences
- **Responsive Layout** - Adapts dynamically to VS Code panel resizing
- **Theme Compatibility** - Works seamlessly with all VS Code color themes
- **Accessibility** - Proper alt text and keyboard navigation support

### 🚦 Getting Started

1. Install from VS Code Marketplace or via command:
   `ext install Kubit.vscode-kubito`
2. Kubito will automatically appear in your Explorer sidebar
3. Click on Kubito to see jump animations
4. Enjoy motivational messages while coding
5. Configure auto-show behavior in VS Code settings (`kubito.autoShow`)

---

**Full Changelog**: https://github.com/kubit-ui/vscode-kubito/commits/v1.0.0

- **Clean CSS styling** with modern visual effects

---

### 📚 Documentation

- **Complete README rewrite** with examples and best practices
- **Comprehensive usage documentation** with practical examples
- **Contributing guide** for community involvement
- **Changelog** following standard conventions
- **License clarification** with Apache 2.0
