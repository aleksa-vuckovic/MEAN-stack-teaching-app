import { Component, OnInit } from '@angular/core';
import { DatumVreme } from 'src/app/DatumVreme';
import { UcenikService } from 'src/app/servisi/ucenik.service';

@Component({
  selector: 'app-ucenik-casovi',
  templateUrl: './ucenik-casovi.component.html',
  styleUrls: ['./ucenik-casovi.component.css']
})
export class UcenikCasoviComponent implements OnInit {

  //od, do, nastavnik, predmet, ime, prezime, opis
  casovi: Array<any> = []

  constructor(private servis: UcenikService) {}
  ngOnInit(): void {
    this.servis.casovi().subscribe((res: any) => {
      if (res.poruka == "ok") {
        this.sada = DatumVreme.sada()
        for (let elem of res.podaci) {
          elem.od = new DatumVreme(elem.od)
          elem.do = new DatumVreme(elem.do)
          elem.trajanje = elem.do.razlikaUMinutima(elem.od)
        }
        this.casovi = res.podaci
      }
    })
  }

  sada: DatumVreme = DatumVreme.sada()
  mogucePrikljucenje(cas: any) {
    return cas.od.razlikaUMinutima(this.sada) <= 15
  }

  //prikljucenje
  prikljucenje(cas: any) {
  
  }
}
