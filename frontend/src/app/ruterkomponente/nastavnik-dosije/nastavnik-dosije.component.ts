import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatumVreme } from 'src/app/DatumVreme';
import { NastavnikService } from 'src/app/servisi/nastavnik.service';

@Component({
  selector: 'app-nastavnik-dosije',
  templateUrl: './nastavnik-dosije.component.html',
  styleUrls: ['./nastavnik-dosije.component.css']
})
export class NastavnikDosijeComponent {

  
  podaci = {
    ime: "Ime",
    prezime: "Prezime",
    mejl: "mejl",
    telefon: "telefon",
    skola: "Osnovna",
    razred: "Razred",
    profil: ""
  }
  ucenik: string = ""

  //_id, od, do, predmet, ocena, komentar
  casovi: Array<any> = []

  constructor(private servis: NastavnikService, public modalServis: NgbModal) {
    this.ucenik = localStorage.getItem("dosije") ?? ""
    this.servis.dosijeProfil(this.ucenik).subscribe((res: any) => {
      if (res.poruka == "ok") this.podaci = res.podaci
    })
    this.servis.dosije(this.ucenik).subscribe((res: any) => {
      console.log(res)
      
      if (res.poruka == "ok") {
        for (let elem of res.podaci) {
          elem.od = new DatumVreme(elem.od)
          elem.do = new DatumVreme(elem.do)
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
    if (cas.ocena || cas.komentar) return;
    this.odabran = cas
    this.ocena = 0
    this.komentar = ""
    this.modalServis.open(this.modal)
  }

  recenzijaOk() {
    let ocena = this.ocena == 0 ? null : this.ocena;
    this.servis.recenzija(this.odabran._id, ocena, this.komentar).subscribe((res:any) => {
      if (res.poruka == "ok") {
        this.odabran.ocena = ocena
        this.odabran.komentar = this.komentar
      }
      this.modalServis.dismissAll()
    })
  }


}
