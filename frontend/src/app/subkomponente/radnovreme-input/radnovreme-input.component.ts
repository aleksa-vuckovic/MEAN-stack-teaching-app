import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'radnovreme-input',
  templateUrl: './radnovreme-input.component.html',
  styleUrls: ['./radnovreme-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting: RadnovremeInputComponent
    }
  ]
})
export class RadnovremeInputComponent implements ControlValueAccessor {
  private onChange = (vrednost: {od: number, do: number}) => {}
  private onTouched = () => {}
  @Input() disabled = false;
  private touched = false;
  writeValue(obj: {od: number, do:number}): void {
    if (!obj) return;
    if (obj.od == obj.do) {
      this.od = this.do = 0
      this.neradan = true;
    }
    else {
      this.od = obj.od;
      this.do = obj.do;
      this.neradan = false;
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
  od:number = 0;
  do:number = 0;
  neradan: boolean = false;

  promena() {
    if (this.disabled) return;
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
    if (!this.neradan && this.do==0) this.onChange({od: this.od, do: 24*60}) //specijalan slucaj, jer treba dozvoliti da "do" bude 24:00
    else if (this.neradan || this.od==this.do) this.onChange({od: 0, do:0})
    else this.onChange({od: this.od, do: this.do})
  }

}
