import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'zvezde',
  templateUrl: './zvezde.component.html',
  styleUrls: ['./zvezde.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting: ZvezdeComponent
    }
  ]
})
export class ZvezdeComponent implements ControlValueAccessor {
  private onChange = (br: number) => {}
  private onTouched = () => {}
  @Input() disabled = false;
  private touched = false;
  writeValue(obj: any): void {
    this.broj = obj;
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

  @Input() broj: number = 0;
  @Input() visina: string = "30px";
  @Output() naKlik: EventEmitter<any> = new EventEmitter();

  niz(od: number, do_: number) {
    let res = []
    if (do_ < od) return [];
    for (let i = od; i <= do_; i++) res.push(i);
    return res;
  }

  klik(i: number) {
    if (!this.disabled) {
      if (!this.touched) {
        this.touched = true;
        this.onTouched();
      }
      this.broj = i;
      this.onChange(i);
      this.naKlik.emit(i);
    }
  }
}
