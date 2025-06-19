import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    // IMPORTANT: Standalone components are NOT declared here.
    // This array MUST be empty.
  ],
  imports: [
    CommonModule // CommonModule is often useful to export for shared modules
  ],
  exports: [
    CommonModule // Export CommonModule for convenience
    // IMPORTANT: Standalone components (LoadingSpinnerComponent, MessageBoxComponent)
    // are NOT exported from a module in the traditional sense.
    // Consumers import them directly into their 'imports' array where needed.
    // So, remove them from exports.
  ]
})
export class SharedModule { }