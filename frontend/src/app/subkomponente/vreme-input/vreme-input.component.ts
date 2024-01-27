import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatumVreme } from 'src/app/DatumVreme';

@Component({
  selector: 'vreme-input',
  templateUrl: './vreme-input.component.html',
  styleUrls: ['./vreme-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting: VremeInputComponent
    }
  ]
})
export class VremeInputComponent implements ControlValueAccessor {
  private onChange = (vreme: number) => {}
  private onTouched = () => {}
  @Input() disabled = false;
  private touched = false;
  writeValue(vreme: number): void {
    vreme = Math.floor(vreme / (60*1000))
    vreme -= vreme % 30;
    this.model = {
      hour: Math.floor(vreme/(60)),
      minute: vreme%60
    }
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

  model = {
    hour: 0,
    minute: 0
  }
  promena() {
    if (this.disabled) return;
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
    this.onChange((this.model.hour*60 + this.model.minute)*60*1000);
  }
}

