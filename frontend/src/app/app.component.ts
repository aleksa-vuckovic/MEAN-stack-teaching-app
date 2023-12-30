import { Component, inject } from '@angular/core';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatumVreme } from './DatumVreme';
import { UcenikService } from './servisi/ucenik.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  
  constructor(private servis: UcenikService) {

    this.servis.nastavnikTermini("marko", DatumVreme.sada().vreme(0)).subscribe((res: any) => {
      console.log(res);
      if (res.poruka == "ok") this.podaci = [res.podaci];
    })
  }

  podaci: any = null;
  datum: DatumVreme = DatumVreme.sada().vreme(0);
  period: number = 1;

  datumvreme: DatumVreme = DatumVreme.sada();

  promena() {
    console.log(this.datumvreme.vremeString());
  }
}
