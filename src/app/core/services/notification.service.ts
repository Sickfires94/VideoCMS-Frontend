import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AppNotification } from '../../shared/models/appNotification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<AppNotification | null>();
  private nextId = 0; // Simple ID generator

  constructor() { }

  /**
   * Returns an Observable that components can subscribe to,
   * to receive notification messages.
   */
  getNotifications(): Observable<AppNotification | null> {
    return this.notificationSubject.asObservable();
  }

  /**
   * Displays a success notification.
   * @param message The message to display.
   * @param duration Optional duration in milliseconds after which the notification will be dismissed.
   */
  showSuccess(message: string, duration?: number): void {
    this.showNotification('success', message, duration);
  }

  /**
   * Displays an error notification.
   * @param message The message to display.
   * @param duration Optional duration in milliseconds. Errors usually persist until dismissed.
   */
  showError(message: string, duration?: number): void {
    this.showNotification('error', message, duration);
  }

  /**
   * Displays an informational notification.
   * @param message The message to display.
   * @param duration Optional duration in milliseconds.
   */
  showInfo(message: string, duration?: number): void {
    this.showNotification('info', message, duration);
  }

  /**
   * Displays a warning notification.
   * @param message The message to display.
   * @param duration Optional duration in milliseconds.
   */
  showWarning(message: string, duration?: number): void {
    this.showNotification('warning', message, duration);
  }

  /**
   * Emits a new notification message.
   * @param type The type of notification (success, error, info, warning).
   * @param message The message content.
   * @param duration Optional duration for automatic dismissal.
   */
  private showNotification(type: AppNotification['type'], message: string, duration?: number): void {
    const notification: AppNotification = {
      id: String(this.nextId++), // Assign a unique ID
      type,
      message,
      duration
    };
    this.notificationSubject.next(notification);
  }

  /**
   * Dismisses a specific notification by its ID.
   * This is typically called by the component displaying the notifications.
   * @param id The ID of the notification to dismiss.
   */
  dismissNotification(id: string): void {
    // To dismiss a specific notification, the `GlobalNotificationComponent`
    // will manage its internal list of active notifications.
    // Emitting `null` or a specific 'dismiss' event would be another pattern.
    // For simplicity, `GlobalNotificationComponent` will handle filtering its list
    // based on the dismissed ID it receives from `MessageBoxComponent`.
    // The service doesn't need to hold state of active notifications.
    // Instead, it emits a special 'dismiss' type notification, or the consuming component
    // maintains the list and processes dismissals.
    // A simpler way for a global notification component to dismiss:
    // The `GlobalNotificationComponent` receives the `dismissed` event from `MessageBoxComponent`
    // and then removes the notification from its own list. The service doesn't need a public
    // `dismissNotification` method in this pattern.
    // If you need the service to *trigger* a dismissal (e.g., from another service),
    // you'd need a more complex state management in the service or a dedicated dismiss event.
    // For now, `GlobalNotificationComponent` handles its own message removal.
  }

  /**
   * Clears all active notifications.
   * This is a "command" type of notification that the subscriber will interpret.
   */
  clearAllNotifications(): void {
    this.notificationSubject.next({ id: 'clear-all', type: 'info', message: 'clear-all' });
  }
}
