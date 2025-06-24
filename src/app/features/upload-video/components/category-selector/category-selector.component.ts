// src/app/features/categories/components/category-selector/category-selector.component.ts
import { CommonModule } from "@angular/common";
import { Component, OnInit, Input, Output, EventEmitter, ElementRef, HostListener, OnDestroy } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { debounceTime, distinctUntilChanged, tap, filter, switchMap, catchError, of, finalize, takeUntil } from "rxjs";
import { Subject } from "rxjs";
import { LoadingSpinnerComponent } from "../../../../shared/components/loading-spinner/loading-spinner.component";
import { CategoryDto } from "../../../../shared/models/category";
import { CategoryService } from "../../services/category.service";

@Component({
  selector: 'app-category-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.scss']
})
export class CategorySelectorComponent implements OnInit, OnDestroy {
  @Input() selectedCategory: CategoryDto | null = null;
  @Output() categorySelected = new EventEmitter<CategoryDto | null>();

  mainCategorySearchControl = new FormControl<string>('');
  mainSearchResults: CategoryDto[] = [];
  isLoadingMainResults: boolean = false;
  showCreateNewCategoryOption: boolean = false;

  // Renamed to better reflect "related" instead of strictly "parent"
  relatedCategorySearchControl = new FormControl<string>(''); 
  relatedSearchResults: CategoryDto[] = [];
  isLoadingRelatedResults: boolean = false;
  selectedRelatedCategory: CategoryDto | null = null; // Renamed from selectedParentCategory

  showMainSearchDropdown: boolean = false;
  showRelatedSearchDropdown: boolean = false; // Renamed from showParentSearchDropdown

  private destroy$ = new Subject<void>();

  constructor(private categoryService: CategoryService, private elementRef: ElementRef) { }

  ngOnInit(): void {
    // --------------------------------------------------------------------------------
    // Logic for MAIN CATEGORY search/validation
    // --------------------------------------------------------------------------------
    this.mainCategorySearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.isLoadingMainResults = true;
        this.mainSearchResults = [];
        this.showCreateNewCategoryOption = false;
        this.showMainSearchDropdown = true;

        if (this.selectedCategory && this.mainCategorySearchControl.value?.trim().toLowerCase() !== this.selectedCategory.categoryName.toLowerCase()) {
          this.selectedCategory = null;
          this.categorySelected.emit(null);
        }

        if (!this.mainCategorySearchControl.value?.trim()) {
          this.isLoadingMainResults = false;
          this.showMainSearchDropdown = false;
        }
      }),
      filter(query => (query && query.length > 2) || query === ''),
      switchMap(query => {
        if (query) {
          return this.categoryService.searchCategories(query).pipe(
            catchError(error => {
              console.error('Error in main category search:', error);
              return of([]);
            })
          );
        } else {
          return of([]);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.mainSearchResults = results;
      this.isLoadingMainResults = false;

      const currentQuery = this.mainCategorySearchControl.value?.trim();
      this.showCreateNewCategoryOption = !!(currentQuery && currentQuery.length > 0 &&
                                         !results.some(c => c.categoryName.toLowerCase() === currentQuery.toLowerCase()) &&
                                         !this.selectedCategory);
      this.showMainSearchDropdown = true;
    });

    // --------------------------------------------------------------------------------
    // Logic for RELATED CATEGORY search/selection
    // --------------------------------------------------------------------------------
    this.relatedCategorySearchControl.valueChanges.pipe( // Renamed control
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.isLoadingRelatedResults = true; // Renamed loading flag
        this.relatedSearchResults = []; // Renamed results array
        this.showRelatedSearchDropdown = true; // Renamed dropdown flag

        if (this.selectedRelatedCategory && this.relatedCategorySearchControl.value?.trim().toLowerCase() !== this.selectedRelatedCategory.categoryName.toLowerCase()) {
          this.selectedRelatedCategory = null;
        }

        if (!this.relatedCategorySearchControl.value?.trim()) {
          this.isLoadingRelatedResults = false;
          this.showRelatedSearchDropdown = false;
        }
      }),
      filter(query => (query && query.length > 2) || query === ''),
      switchMap(query => {
        if (query) {
          return this.categoryService.searchCategories(query).pipe(
            catchError(error => {
              console.error('Error in related category search:', error);
              return of([]);
            })
          );
        } else {
          return of([]);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.relatedSearchResults = results; // Renamed results array
      this.isLoadingRelatedResults = false;
      this.showRelatedSearchDropdown = true; // Renamed dropdown flag
    });

    if (this.selectedCategory) {
      this.mainCategorySearchControl.setValue(this.selectedCategory.categoryName, { emitEvent: false });
      if (this.selectedCategory.categoryParent?.categoryName) {
        this.relatedCategorySearchControl.setValue(this.selectedCategory.categoryParent.categoryName, { emitEvent: false }); // Renamed control
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.showMainSearchDropdown = false;
      this.showRelatedSearchDropdown = false; // Renamed
      this.mainSearchResults = [];
      this.relatedSearchResults = []; // Renamed
      this.showCreateNewCategoryOption = false;
      
      const mainCategoryValue = this.mainCategorySearchControl.value?.trim().toLowerCase();
      if (this.selectedCategory && mainCategoryValue !== this.selectedCategory.categoryName.toLowerCase()) {
          this.selectedCategory = null;
          this.categorySelected.emit(null);
          if (!mainCategoryValue) {
              this.mainCategorySearchControl.setValue('');
          }
      } else if (!this.selectedCategory && mainCategoryValue) {
          if (!this.showCreateNewCategoryOption) {
              this.mainCategorySearchControl.setValue('');
          }
      } else if (!this.selectedCategory && !mainCategoryValue) {
          this.mainCategorySearchControl.setValue('');
      }

      const relatedCategoryValue = this.relatedCategorySearchControl.value?.trim().toLowerCase(); // Renamed
      if (this.selectedRelatedCategory && relatedCategoryValue !== this.selectedRelatedCategory.categoryName.toLowerCase()) { // Renamed
          this.selectedRelatedCategory = null; // Renamed
          this.relatedCategorySearchControl.setValue(''); // Renamed
      } else if (!this.selectedRelatedCategory && relatedCategoryValue) { // Renamed
           this.relatedCategorySearchControl.setValue(''); // Renamed
      } else if (!this.selectedRelatedCategory && !relatedCategoryValue) { // Renamed
          this.relatedCategorySearchControl.setValue(''); // Renamed
      }

      console.log('CategorySelectorComponent: Closed by click outside.');
    }
  }

  // ----------------------------------------------------------------------
  // Main Category Input & Selection
  // ----------------------------------------------------------------------

  selectExistingCategory(category: CategoryDto, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedCategory = category;
    this.mainCategorySearchControl.setValue(category.categoryName, { emitEvent: false });
    this.mainSearchResults = [];
    this.showCreateNewCategoryOption = false;
    this.showMainSearchDropdown = false;
    this.categorySelected.emit(category);
  }

  clearSelectedCategory(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedCategory = null;
    this.mainCategorySearchControl.setValue('');
    this.mainSearchResults = [];
    this.showCreateNewCategoryOption = false;
    this.showMainSearchDropdown = false;
    this.categorySelected.emit(null);
    this.clearRelatedCategory(); // Renamed
  }

  onMainCategoryBlur(): void {
    setTimeout(() => {
      const activeElement = document.activeElement;
      const componentContainsActiveElement = this.elementRef.nativeElement.contains(activeElement);

      if (!componentContainsActiveElement) {
        this.showMainSearchDropdown = false;
        this.mainSearchResults = [];
        this.showCreateNewCategoryOption = false;

        const currentValue = this.mainCategorySearchControl.value?.trim().toLowerCase();
        if (this.selectedCategory && currentValue !== this.selectedCategory.categoryName.toLowerCase()) {
          this.selectedCategory = null;
          this.categorySelected.emit(null);
        } else if (!this.selectedCategory && currentValue && !this.showCreateNewCategoryOption) {
          this.mainCategorySearchControl.setValue('');
        }
      }
    }, 150);
  }

  onMainCategoryFocus(): void {
    const currentValue = this.mainCategorySearchControl.value?.trim();
    if (currentValue && currentValue.length > 0 || this.selectedCategory) {
      this.showMainSearchDropdown = true;
      if (currentValue && currentValue.length > 2) {
        this.mainCategorySearchControl.updateValueAndValidity({ emitEvent: true });
      }
    }
  }

  // ----------------------------------------------------------------------
  // Related Category Input & Selection (formerly Parent)
  // ----------------------------------------------------------------------

  /**
   * Selects a category for the "Related Category" field.
   * @param category The selected CategoryDto to be a related category.
   * @param event The mousedown event to stop propagation.
   */
  selectRelatedCategory(category: CategoryDto, event: MouseEvent): void { // Renamed method
    event.stopPropagation();
    this.selectedRelatedCategory = category; // Renamed property
    this.relatedCategorySearchControl.setValue(category.categoryName, { emitEvent: false }); // Renamed control
    this.relatedSearchResults = []; // Renamed results array
    this.showRelatedSearchDropdown = false; // Renamed dropdown flag
  }

  /**
   * Clears the selected related category.
   * @param event The click event to stop propagation.
   */
  clearRelatedCategory(event?: MouseEvent): void { // Renamed method
    event?.stopPropagation();
    this.selectedRelatedCategory = null; // Renamed property
    this.relatedCategorySearchControl.setValue(''); // Renamed control
    this.relatedSearchResults = []; // Renamed results array
    this.showRelatedSearchDropdown = false; // Renamed dropdown flag
  }

  /**
   * Handles blur for the "Related Category" input.
   */
  onRelatedCategoryBlur(): void { // Renamed method
    setTimeout(() => {
      const activeElement = document.activeElement;
      const componentContainsActiveElement = this.elementRef.nativeElement.contains(activeElement);

      if (!componentContainsActiveElement) {
        this.showRelatedSearchDropdown = false; // Renamed
        this.relatedSearchResults = []; // Renamed
        const currentValue = this.relatedCategorySearchControl.value?.trim().toLowerCase(); // Renamed
        if (this.selectedRelatedCategory && currentValue !== this.selectedRelatedCategory.categoryName.toLowerCase()) { // Renamed
          this.selectedRelatedCategory = null; // Renamed
        } else if (!this.selectedRelatedCategory && currentValue) { // Renamed
          this.relatedCategorySearchControl.setValue(''); // Renamed
        }
      }
    }, 150);
  }

  /**
   * Handles focus for the related category input to show results
   */
  onRelatedCategoryFocus(): void { // Renamed method
    const currentValue = this.relatedCategorySearchControl.value?.trim(); // Renamed
    if (currentValue && currentValue.length > 0 || this.selectedRelatedCategory) { // Renamed
      this.showRelatedSearchDropdown = true; // Renamed
      if (currentValue && currentValue.length > 2) { // Renamed
        this.relatedCategorySearchControl.updateValueAndValidity({ emitEvent: true }); // Renamed
      }
    }
  }

  // ----------------------------------------------------------------------
  // Category Creation
  // ----------------------------------------------------------------------

  /**
   * Creates a new category. Allows optional selection of a related category (parent).
   * @param event The mouse event to stop propagation.
   */
  onCreateNewCategory(event: MouseEvent): void {
    event.stopPropagation();
    
    const newCategoryName = this.mainCategorySearchControl.value?.trim();
    if (!newCategoryName) {
      console.warn("New category name cannot be empty.");
      // Add user-facing notification
      return;
    }

    this.isLoadingMainResults = true;
    // Pass categoryId of the selected related category, or null if none selected.
    const parentCategoryId = this.selectedRelatedCategory ? this.selectedRelatedCategory.categoryId : null;

    this.categoryService.createCategory(newCategoryName, parentCategoryId).pipe(
      finalize(() => this.isLoadingMainResults = false),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (createdCategory: CategoryDto) => {
        console.log('Category created:', createdCategory);
        this.selectExistingCategory(createdCategory, event); // Select the newly created one
        this.clearRelatedCategory(); // Clear related category input after successful creation
      },
      error: (err: any) => {
        console.error('Failed to create category:', err);
        // Add user-facing error notification here
      }
    });
  }
}