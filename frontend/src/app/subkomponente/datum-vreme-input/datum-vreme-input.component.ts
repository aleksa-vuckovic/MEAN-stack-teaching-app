import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatumVreme } from 'src/app/DatumVreme';

@Component({
  selector: 'datum-vreme-input',
  templateUrl: './datum-vreme-input.component.html',
  styleUrls: ['./datum-vreme-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting: DatumVremeInputComponent
    }
  ]
})
export class DatumVremeInputComponent implements ControlValueAccessor {
  private onChange = (dv: DatumVreme) => {}
  private onTouched = () => {}
  private disabled = false;
  private touched = false;
  writeValue(dv: DatumVreme): void {
    if (!dv) return;
    this.vreme = dv.sirovoVreme();
    this.model = dv.ngbDatum();
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
    year: 0,
    month: 0,
    day: 0
  }
  vreme  = 0;
  promena() {
    if (this.disabled) return;
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
    let datumvreme = DatumVreme.datum(this.model).vreme(this.vreme);
    this.onChange(datumvreme);
  }


}
