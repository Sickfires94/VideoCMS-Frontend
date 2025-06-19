export interface AppNotification {
    id: string; // Unique ID for each notification to allow individual dismissal
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number; // Optional: duration in milliseconds after which the notification disappears
  }