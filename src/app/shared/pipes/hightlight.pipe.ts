// src/app/shared/pipes/highlight.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string | null | undefined, searchTerm: string | null | undefined): SafeHtml {
    console.groupCollapsed('HighlightPipe Transform Call'); // Group logs for clarity
    console.log('  Input Text:', text);
    console.log('  Input SearchTerm:', searchTerm);

    // Check each condition individually
    const isTextInvalid = !text;
    const isSearchTermInvalid = !searchTerm;
    const isSearchTermEmptyAfterTrim = (searchTerm !== null && searchTerm !== undefined) && searchTerm.trim() === '';

    console.log('  Condition check: !text =', isTextInvalid);
    console.log('  Condition check: !searchTerm =', isSearchTermInvalid);
    console.log('  Condition check: searchTerm.trim() === "" (if applicable) =', isSearchTermEmptyAfterTrim);

    if (isTextInvalid || isSearchTermInvalid || isSearchTermEmptyAfterTrim) {
      console.warn('HighlightPipe: Returning original text due to invalid input.');
      console.groupEnd();
      return this.sanitizer.bypassSecurityTrustHtml(text || '');
    }

    const escapedSearchTerm = this.escapeRegExp(searchTerm!.trim()); // Use ! to assert non-null/undefined after checks
    const searchTermRegex = new RegExp(`(${escapedSearchTerm})`, 'gi');

    // Make sure 'text' is definitely a string here for .replace()
    const textString = text!; // Assert text is a string
    const highlightedText = textString.replace(searchTermRegex, '<span class="bg-yellow-200">$1</span>');

    console.log('HighlightPipe: Regex used:', searchTermRegex);
    console.log('HighlightPipe: Original text after assertion:', textString);
    console.log('HighlightPipe: Highlighted HTML output:', highlightedText);
    console.groupEnd(); // End the log group

    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }

  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}