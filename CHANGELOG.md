# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
