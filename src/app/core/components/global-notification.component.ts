// src/app/core/components/global-notification/global-notification.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common'; // Required for ngFor, ngIf etc. in template
import { MessageBoxComponent } from '../../shared/components/message-box/message-box.component';
import { AppNotification } from '../../shared/models/appNotification';
import { NotificationService } from '../services/notification.service';

@Component({ // IMPORTANT: Ensure this decorator is present and correct
  selector: 'app-global-notification',
  standalone: true, // IMPORTANT: Mark as standalone
  imports: [CommonModule, MessageBoxComponent], // Import dependencies directly
  templateUrl: './global-notification.component.html', // Path should be lowercase kebab-case
  styleUrls: ['./global-notification.component.scss'] // Assuming file exists, lowercase kebab-case
})
export class GlobalNotificationComponent implements OnInit, OnDestroy {
  activeNotifications: AppNotification[] = [];
  private notificationSubscription!: Subscription;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationSubscription = this.notificationService.getNotifications().subscribe(
      (notification: AppNotification | null) => {
        if (notification) {
          if (notification.id === 'clear-all') {
            this.activeNotifications = [];
          } else {
            this.activeNotifications.push(notification);
            if (notification.duration) {
              setTimeout(() => {
                this.dismissNotification(notification.id);
              }, notification.duration);
            }
          }
        }
      }
    );
  }

  dismissNotification(id: string): void {
    this.activeNotifications = this.activeNotifications.filter(n => n.id !== id);
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }
}
