import { Component, ElementRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'fajl-input',
  templateUrl: './fajl-input.component.html',
  styleUrls: ['./fajl-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting: FajlInputComponent
    }
  ]
})
export class FajlInputComponent implements ControlValueAccessor {
  private onChange = (file: File | null) => {}
  private onTouched = () => {}
  private disabled = false;
  private touched = false;
  writeValue(obj: any): void {
    this.fajl = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  @Input() greska: boolean = false

  private fajl: File | null = null;

  promena( event: any ) {
    if (this.disabled) return;
    if (event.target && event.target.files && event.target.files.length > 0)
      this.fajl = event.target.files[0];
    else this.fajl = null
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
    this.onChange(this.fajl);
  }

  constructor( private host: ElementRef<HTMLInputElement> ) {
  }
}