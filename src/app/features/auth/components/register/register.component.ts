// src/app/features/auth/components/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegisterViewModel } from '../../viewmodels/register.viewmodel'; // Import ViewModel

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [RegisterViewModel] // Provide the ViewModel for this component instance
})
export class RegisterComponent implements OnInit {
  constructor(public viewModel: RegisterViewModel) {}

  ngOnInit(): void {
    // Optionally perform initial setup or data loading via viewModel
  }
}