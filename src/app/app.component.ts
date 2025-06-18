// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthFacade } from './features/auth/services/auth.facade';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html', // or app.html if that's what you truly named it
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Angular SOLID MVVM Auth Demo';

  constructor(public authFacade: AuthFacade) {} 
}