// src/app/features/auth/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // For routerLink
import { LoginViewModel } from '../../viewmodels/login.viewmodel'; // Import ViewModel

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [LoginViewModel] // Provide the ViewModel for this component instance
})
export class LoginComponent implements OnInit {
  // Public property for the ViewModel instance, accessible in the template
  constructor(public viewModel: LoginViewModel) {}

  ngOnInit(): void {
    // Optionally perform initial setup or data loading via viewModel if needed
  }
}