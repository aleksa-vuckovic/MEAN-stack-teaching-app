import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as bootstrap from 'bootstrap';
import { DatumVreme } from 'src/app/DatumVreme';
import { NastavnikService } from 'src/app/servisi/nastavnik.service';

@Component({
  selector: 'app-nastavnik-casovi',
  templateUrl: './nastavnik-casovi.component.html',
  styleUrls: ['./nastavnik-casovi.component.css']
})
export class NastavnikCasoviComponent {

  casovi: Array<any> = []
  limit: number = 5;
  constructor(private servis: NastavnikService, public modalServis: NgbModal) {
    this.osveziCasove()
  }
  sada: DatumVreme = DatumVreme.sada()
  mogucOtkaz(od: DatumVreme) {
    return od.razlikaUMinutima(this.sada) >= 4*60
  }
  osveziCasove() {
    this.servis.casovi(this.limit).subscribe((res: any) => {
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

  //otkazivanje
  otkazivanjeDatum: DatumVreme = DatumVreme.sada()
  obrazlozenje: string = ""
  greskaOtkazivanje: string = ""
  @ViewChild('modal') modal!: ElementRef;
  otkazi(od: DatumVreme) {
    this.otkazivanjeDatum = od;
    this.obrazlozenje = ""
    this.greskaOtkazivanje = ""
    this.modalServis.open(this.modal)
  }
  otkaziDefinitivno() {
    this.servis.otkazi(this.otkazivanjeDatum, this.obrazlozenje).subscribe((res: any) => {
      if (res.poruka == "ok") {
        this.modalServis.dismissAll()
        this.osveziCasove()
      }
      else this.greskaOtkazivanje = res.poruka
    })
  }
}
