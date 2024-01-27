import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatumVreme } from 'src/app/DatumVreme';
import { NastavnikService } from 'src/app/servisi/nastavnik.service';

@Component({
  selector: 'app-nastavnik-casovi',
  templateUrl: './nastavnik-casovi.component.html',
  styleUrls: ['./nastavnik-casovi.component.css']
})
export class NastavnikCasoviComponent implements OnInit {

  profil = {ime: "", prezime: "", mejl : ""}
  casovi: Array<any> = []
  limit: number = 5;
  constructor(private servis: NastavnikService, public modalServis: NgbModal, private ruter: Router) {}
  ngOnInit(): void {
    this.osveziCasove()
    this.servis.profilPodaci().subscribe((res:any) => {
      if (res.poruka == "ok") this.profil = res.podaci
    })
  }
  sada: DatumVreme = DatumVreme.sada()
  mogucOtkaz(cas: any) {
    return cas.od.razlikaUMinutima(this.sada) >= 4*60
  }
  mogucePrikljucenje(cas: any) {
    return cas.od.razlikaUMinutima(this.sada) <= 15
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
  odabran: any = null
  obrazlozenje: string = ""
  greska: string = ""
  @ViewChild('modal') modal!: ElementRef;
  otkazi(cas: any) {
    this.odabran = cas;
    this.obrazlozenje = ""
    this.greska = ""
    this.modalServis.open(this.modal)
  }
  otkaziDefinitivno() {
    this.servis.otkazi(this.odabran._id, this.obrazlozenje).subscribe((res: any) => {
      if (res.poruka == "ok") {
        this.modalServis.dismissAll()
        this.osveziCasove()
      }
      else this.greska = res.poruka
    })
  }

  //prikljucenje
  prikljucenje(cas: any) {
    if (!this.mogucePrikljucenje(cas)) return;
    localStorage.setItem("cas", JSON.stringify({
      id: cas._id,
      ime: this.profil.ime + " " + this.profil.prezime,
      mejl: this.profil.mejl
    }))
    this.ruter.navigate(["sastanak"])
  }
}
