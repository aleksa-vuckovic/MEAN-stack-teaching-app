import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatumVreme } from 'src/app/DatumVreme';
import { UcenikService } from 'src/app/servisi/ucenik.service';

@Component({
  selector: 'app-ucenik-arhiva',
  templateUrl: './ucenik-arhiva.component.html',
  styleUrls: ['./ucenik-arhiva.component.css']
})
export class UcenikArhivaComponent {


  //od, do, predmet, ime, prezime, komentar (nastavnika), ocenjen
  casovi: Array<any> = []

  constructor(private servis: UcenikService, public modalServis: NgbModal) {
    this.servis.arhiva().subscribe((res: any) => {
      if (res.poruka == "ok") {
        for (let elem of res.podaci) {
          elem.od = new DatumVreme(elem.od)
          elem.do = new DatumVreme(elem.do)
          elem.trajanje = elem.do.razlikaUMinutima(elem.od)
        }
        this.casovi = res.podaci
      }
      
    })
  }

  @ViewChild('modal') modal!:ElementRef;
  odabran: any = null
  ocena: number = 0
  komentar: string = ""
  recenzija(cas: any) {
    if (cas.ocenjen) return;
    this.odabran = cas
    this.ocena = 0
    this.komentar = ""
    this.modalServis.open(this.modal)
  }

  recenzijaOk() {
    let ocena = this.ocena == 0 ? null : this.ocena;
    this.servis.recenzija(this.odabran.od, this.odabran.nastavnik, ocena, this.komentar).subscribe((res:any) => {
      if (res.poruka == "ok") {
        this.odabran.ocenjen = true
      }
      this.modalServis.dismissAll()
    })
  }
}
