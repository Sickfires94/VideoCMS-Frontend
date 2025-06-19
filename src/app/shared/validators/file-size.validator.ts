import { AbstractControl, ValidatorFn } from '@angular/forms';

export function fileSizeValidator(maxSizeInBytes: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const file = control.value;
    if (file && file instanceof File) {
      if (file.size > maxSizeInBytes) {
        const maxSizeMB = maxSizeInBytes / (1024 * 1024);
        return { 'fileSize': { 'actualSize': file.size, 'requiredSize': maxSizeMB } };
      }
    }
    return null;
  };
}