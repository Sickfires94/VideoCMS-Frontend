// src/app/features/video-searching/components/search-bar/search-bar.component.ts
import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms'; // For reactive forms
import { CommonModule } from '@angular/common'; // For ngIf
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CategoryDto } from '../../../../shared/models/category';
import { VideoSearchQuery } from '../../../../shared/models/VideoSearchQuery';
import { CategoryService } from '../../../upload-video/services/category.service';

@Component({
  selector: 'app-search-bar',
  standalone: true, // Mark as standalone
  imports: [CommonModule, ReactiveFormsModule], // Import dependencies
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'] // Optional
})
export class SearchBarComponent implements OnInit {
  @Input() initialQuery: VideoSearchQuery = {}; // Optional: For pre-filling search
  @Output() search = new EventEmitter<VideoSearchQuery>(); // Emits search criteria

  searchTermControl = new FormControl('');
  selectedCategoryControl = new FormControl(''); // Stores category ID or name
  // You can add more controls for sortBy, sortDirection, tags here

  categories: CategoryDto[] = []; // For category dropdown
  isSearchingCategories: boolean = false;

  constructor(private categoryService: CategoryService) { } // Reuse existing CategoryService

  ngOnInit(): void {
    // Initialize form controls with initial query
    if (this.initialQuery.searchTerm) {
      this.searchTermControl.setValue(this.initialQuery.searchTerm);
    }
    if (this.initialQuery.categoryId) {
      this.selectedCategoryControl.setValue(this.initialQuery.categoryId);
    }

    // Emit search query on search term changes (with debounce)
    this.searchTermControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => {
      this.emitSearch();
    });

    // Handle category selection changes
    this.selectedCategoryControl.valueChanges.subscribe(value => {
      this.emitSearch();
    });

    // Load categories for dropdown
    this.loadCategories();
  }

  loadCategories(): void {
    this.isSearchingCategories = true;
    this.categoryService.searchCategories('').subscribe({ // Empty query to get all or top categories
      next: (categories) => {
        this.categories = categories;
        this.isSearchingCategories = false;
      },
      error: (err) => {
        console.error('Failed to load categories for search bar:', err);
        this.isSearchingCategories = false;
        // Optionally show notification
      }
    });
  }

  emitSearch(): void {
    const currentQuery: VideoSearchQuery = {
      searchTerm: this.searchTermControl.value,
      categoryId: this.selectedCategoryControl.value,
      // Add other filter values here
      // For simplicity, hardcoding sort for now, but these would be controls
      sortBy: 'uploadDate',
      sortDirection: 'desc',
      pageNumber: 1, // Always reset to first page on new search criteria
      pageSize: 10
    };
    this.search.emit(currentQuery);
  }

  // Clear search term
  clearSearchTerm(): void {
    this.searchTermControl.setValue('');
    this.emitSearch(); // Trigger new search
  }

  // Clear category selection
  clearCategorySelection(): void {
    this.selectedCategoryControl.setValue('');
    this.emitSearch(); // Trigger new search
  }
}