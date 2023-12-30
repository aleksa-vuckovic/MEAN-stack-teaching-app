import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DatumVreme } from 'src/app/DatumVreme';

@Component({
  selector: 'kalendar',
  templateUrl: './kalendar.component.html',
  styleUrls: ['./kalendar.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting: KalendarComponent
    }
  ]
})
export class KalendarComponent implements ControlValueAccessor {
  private onChange = (dv: DatumVreme) => {}
  private onTouched = () => {}
  disabled = false;
  private touched = false;
  writeValue(dv: DatumVreme): void {
    this.datumvreme = dv;
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

  //Odabrani slot
  datumvreme: DatumVreme = DatumVreme.sada()
  @Input() datum: DatumVreme = DatumVreme.sada() //Prvi datum koji se prikazuje
  @Input() period: number = 7 //Broj dana koji se prikazuje, ujedno duzina niza podataka
  @Input() velicina: number = 16 //Broj slotova koju se prikazuje u jednom redu
  //Podaci koji se prikazuju a koji odgovaraju datumima od datum do datum.dodajDan(period).
  //Za svaki dan, jedna niz od 48 elemenata koji predstavljaju stanje slota
  //Svaki element ima status, tekst, kao i duzina (koliko kolona zauzima) i rb (redni broj u jednom nizu spojenih slotova)
  @Input() podaci: Array<Array<any>> | null = null;

  //kada korisnik klikne nagore: true, kada klikne nadole: false
  @Output() strelica: EventEmitter<boolean> = new EventEmitter();

  //pomeraj u slotovima odnosu na nulti slot
  pomeraj: number = 20 
  klik(dv: DatumVreme) {
    if (this.disabled) return;
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
    this.datumvreme = dv;
    this.onChange(this.datumvreme);
  }

  goreDole(tip: boolean) {
    this.strelica.emit(tip);
  }

  levoDesno(tip: boolean) {
    if (tip) {
      //levo
      if (this.pomeraj > 0) this.pomeraj--;
    }
    else {
      //desno
      if (this.pomeraj < 48 - this.velicina) this.pomeraj++;
    }
  }  

  opseg(od: number, do_: number) {
    let res = Array.from({length: do_-od}, (_, i) => od+i)
    return res;
  }
  min(x: number, y:number) {
    return x > y ? y : x;
  }
  satZaglavlje(i: number) {
    return i%2 ? "" : `${i/2}h`
  }
}
