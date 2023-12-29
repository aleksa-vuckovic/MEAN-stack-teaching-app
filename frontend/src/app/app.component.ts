import { Component, inject } from '@angular/core';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatumVreme } from './DatumVreme';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  model: NgbDateStruct = inject(NgbCalendar).getToday();

  odabranDatum(datum: any) {
    console.log(datum);
    console.log(this.model);
  }

  proba: DatumVreme = DatumVreme.sada();

  range(i: number) {
    let res = [];
    for (let j = 0; j < i; j++) res.push(j);
    return res;
  }

  promena(i: number) {
    console.log(i)
  }

}
