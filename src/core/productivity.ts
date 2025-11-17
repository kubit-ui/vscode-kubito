/**
 * Productivity Manager for Kubito
 *
 * Handles intelligent reminders and coding metrics to improve developer productivity.
 * Features:
 * - Break reminders with configurable intervals
 * - Water intake reminders
 * - Active pause suggestions
 * - Coding session metrics (lines written, time spent, files modified)
 * - Productivity insights and trends
 */

import * as vscode from 'vscode';

/**
 * Interface for coding session metrics
 */
export interface ICodingMetrics {
  sessionStart: Date;
  linesWritten: number;
  linesDeleted: number;
  filesModified: Set<string>;
  totalKeystrokes: number;
  activeTimeMs: number;
  lastActivityTime: Date;
  languages: Record<string, number>; // Language -> lines written
}

/**
 * Interface for reminder types
 */
export interface IReminder {
  type: 'break' | 'water' | 'posture' | 'eyes';
  message: string;
  interval: number; // minutes
  lastShown: Date | null;
  enabled: boolean;
}

/**
 * Productivity insights for display
 */
export interface IProductivityInsights {
  sessionDuration: string;
  linesPerHour: number;
  mostActiveLanguage: string;
  filesModified: number;
  productivityScore: number; // 0-100
  suggestions: string[];
}

/**
 * Manages productivity features for Kubito
 */
export class ProductivityManager {
  private metrics: ICodingMetrics;
  private reminders: Map<string, IReminder>;
  private reminderTimers: Map<string, ReturnType<typeof setInterval>>;
  private metricsTimer: ReturnType<typeof setInterval> | null = null;
  private lastKeystrokeTime: Date = new Date();
  private readonly IDLE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly onShowMessage: (message: { type: string; content: string }) => void
  ) {
    this.metrics = this.initializeMetrics();
    this.reminders = this.initializeReminders();
    this.reminderTimers = new Map();

    this.startProductivityTracking();
  }

  /**
   * Initialize coding metrics
   */
  private initializeMetrics(): ICodingMetrics {
    return {
      sessionStart: new Date(),
      linesWritten: 0,
      linesDeleted: 0,
      filesModified: new Set<string>(),
      totalKeystrokes: 0,
      activeTimeMs: 0,
      lastActivityTime: new Date(),
      languages: {}
    };
  }

  /**
   * Initialize reminder system
   */
  private initializeReminders(): Map<string, IReminder> {
    const config = vscode.workspace.getConfiguration('kubito.productivity');

    const reminders = new Map<string, IReminder>();

    reminders.set('break', {
      type: 'break',
      message: 'Time for a short break! 🧘‍♂️',
      interval: config.get<number>('breakInterval', 30),
      lastShown: null,
      enabled: config.get<boolean>('reminders', true)
    });

    reminders.set('water', {
      type: 'water',
      message: 'Stay hydrated! 💧',
      interval: config.get<number>('waterInterval', 45),
      lastShown: null,
      enabled: config.get<boolean>('reminders', true)
    });

    reminders.set('posture', {
      type: 'posture',
      message: 'Check your posture! 🪑',
      interval: 25,
      lastShown: null,
      enabled: config.get<boolean>('reminders', true)
    });

    reminders.set('eyes', {
      type: 'eyes',
      message: 'Rest your eyes - look away for 20 seconds! 👀',
      interval: 20,
      lastShown: null,
      enabled: config.get<boolean>('reminders', true)
    });

    return reminders;
  }

  /**
   * Start productivity tracking and reminder timers
   */
  public startProductivityTracking(): void {
    this.startReminderTimers();
    this.startMetricsTracking();
    this.registerEventListeners();
  }

  /**
   * Start reminder timers
   */
  private startReminderTimers(): void {
    this.reminders.forEach((reminder, key) => {
      if (reminder.enabled) {
        const timer = setInterval(
          () => {
            this.checkAndShowReminder(key);
          },
          reminder.interval * 60 * 1000
        ); // Convert minutes to milliseconds

        this.reminderTimers.set(key, timer);
      }
    });
  }

  /**
   * Start metrics tracking
   */
  private startMetricsTracking(): void {
    const config = vscode.workspace.getConfiguration('kubito.productivity');
    const metricsInterval = config.get<number>('metricsInterval', 60);

    if (config.get<boolean>('showMetrics', true)) {
      this.metricsTimer = setInterval(
        () => {
          this.updateActiveTime();
          this.showMetricsUpdate();
        },
        metricsInterval * 60 * 1000
      );
    }
  }

  /**
   * Register event listeners for tracking
   */
  private registerEventListeners(): void {
    // Track text document changes
    const onDocumentChange = vscode.workspace.onDidChangeTextDocument(event => {
      this.trackTextChanges(event);
    });

    // Track file saves
    const onDocumentSave = vscode.workspace.onDidSaveTextDocument(document => {
      this.trackFileSave(document);
    });

    // Track active editor changes
    const onActiveEditorChange = vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor) {
        this.trackFileActivity(editor.document.fileName);
      }
    });

    this.context.subscriptions.push(onDocumentChange, onDocumentSave, onActiveEditorChange);
  }

  /**
   * Track text changes for metrics
   */
  private trackTextChanges(event: vscode.TextDocumentChangeEvent): void {
    this.lastKeystrokeTime = new Date();
    this.metrics.lastActivityTime = new Date();

    event.contentChanges.forEach(change => {
      const linesChanged = change.text.split('\n').length - 1;
      const language = event.document.languageId;

      if (change.text.length > change.rangeLength) {
        // Text added
        this.metrics.linesWritten += linesChanged;
        this.metrics.languages[language] = (this.metrics.languages[language] || 0) + linesChanged;
      } else if (change.text.length < change.rangeLength) {
        // Text deleted
        this.metrics.linesDeleted += Math.abs(linesChanged);
      }

      this.metrics.totalKeystrokes += change.text.length;
    });

    this.trackFileActivity(event.document.fileName);
  }

  /**
   * Track file save events
   */
  private trackFileSave(document: vscode.TextDocument): void {
    this.trackFileActivity(document.fileName);
  }

  /**
   * Track file activity
   */
  private trackFileActivity(fileName: string): void {
    this.metrics.filesModified.add(fileName);
  }

  /**
   * Update active coding time
   */
  private updateActiveTime(): void {
    const now = new Date();
    const timeSinceLastActivity = now.getTime() - this.metrics.lastActivityTime.getTime();

    if (timeSinceLastActivity < this.IDLE_THRESHOLD_MS) {
      // Only count as active time if user was recently active
      const timeSinceLastUpdate = now.getTime() - this.lastKeystrokeTime.getTime();
      this.metrics.activeTimeMs += Math.min(timeSinceLastUpdate, this.IDLE_THRESHOLD_MS);
    }
  }

  /**
   * Check and show reminder if needed
   */
  private checkAndShowReminder(reminderKey: string): void {
    const reminder = this.reminders.get(reminderKey);
    if (!reminder || !reminder.enabled) {
      return;
    }

    const now = new Date();
    if (
      !reminder.lastShown ||
      now.getTime() - reminder.lastShown.getTime() >= reminder.interval * 60 * 1000
    ) {
      this.onShowMessage({
        type: 'reminder',
        content: reminder.message
      });

      reminder.lastShown = now;
    }
  }

  /**
   * Show periodic metrics update
   */
  private showMetricsUpdate(): void {
    const insights = this.getProductivityInsights();

    const metricsMessage =
      `📊 Session: ${insights.sessionDuration} | ` +
      `${insights.linesPerHour} lines/hour | ` +
      `Score: ${insights.productivityScore}/100`;

    this.onShowMessage({
      type: 'metrics',
      content: metricsMessage
    });
  }

  /**
   * Get current productivity insights
   */
  public getProductivityInsights(): IProductivityInsights {
    this.updateActiveTime();

    const sessionDurationMs = new Date().getTime() - this.metrics.sessionStart.getTime();
    const sessionHours = sessionDurationMs / (1000 * 60 * 60);
    const activeHours = this.metrics.activeTimeMs / (1000 * 60 * 60);

    const linesPerHour = activeHours > 0 ? Math.round(this.metrics.linesWritten / activeHours) : 0;

    // Find most active language
    const mostActiveLanguage =
      Object.entries(this.metrics.languages).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';

    // Calculate productivity score (0-100)
    const productivityScore = this.calculateProductivityScore(sessionHours, activeHours);

    const insights: IProductivityInsights = {
      sessionDuration: this.formatDuration(sessionDurationMs),
      linesPerHour,
      mostActiveLanguage,
      filesModified: this.metrics.filesModified.size,
      productivityScore,
      suggestions: this.generateSuggestions({
        sessionDuration: this.formatDuration(sessionDurationMs),
        linesPerHour,
        mostActiveLanguage,
        filesModified: this.metrics.filesModified.size,
        productivityScore,
        suggestions: []
      })
    };

    return insights;
  }

  /**
   * Calculate productivity score based on various factors
   */
  private calculateProductivityScore(sessionHours: number, activeHours: number): number {
    if (sessionHours === 0) {
      return 0;
    }

    const activeRatio = activeHours / sessionHours;
    const linesPerActiveHour = activeHours > 0 ? this.metrics.linesWritten / activeHours : 0;

    // Base score on activity ratio (0-50 points)
    let score = Math.min(activeRatio * 50, 50);

    // Add points for productivity (0-30 points)
    if (linesPerActiveHour > 100) {
      score += 30;
    } else if (linesPerActiveHour > 50) {
      score += 20;
    } else if (linesPerActiveHour > 20) {
      score += 10;
    }

    // Add points for file diversity (0-20 points)
    if (this.metrics.filesModified.size > 5) {
      score += 20;
    } else if (this.metrics.filesModified.size > 3) {
      score += 15;
    } else if (this.metrics.filesModified.size > 1) {
      score += 10;
    }

    return Math.round(Math.min(score, 100));
  }

  /**
   * Generate productivity suggestions
   */
  private generateSuggestions(insights: IProductivityInsights): string[] {
    const suggestions: string[] = [];

    if (insights.productivityScore < 30) {
      suggestions.push('Consider taking more frequent breaks');
    }

    if (insights.linesPerHour < 20) {
      suggestions.push('Try time-boxing your tasks');
    }

    if (insights.filesModified < 2) {
      suggestions.push('Break down tasks into smaller files');
    }

    return suggestions;
  }

  /**
   * Format duration from milliseconds to human readable string
   */
  private formatDuration(durationMs: number): string {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Update configuration when settings change
   */
  public updateConfiguration(): void {
    // Clear existing timers
    this.reminderTimers.forEach(timer => clearInterval(timer));
    this.reminderTimers.clear();

    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = null;
    }

    // Reinitialize with new settings
    this.reminders = this.initializeReminders();
    this.startProductivityTracking();
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.reminderTimers.forEach(timer => clearInterval(timer));
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }
  }
}
