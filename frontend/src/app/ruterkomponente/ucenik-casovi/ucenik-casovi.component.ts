import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  profil = {ime: "", prezime: "", mejl: ""}


  constructor(private servis: UcenikService, private ruter: Router) {}
  ngOnInit(): void {
    this.servis.casovi().subscribe((res: any) => {
      if (res.poruka == "ok") {
        console.log(res)
        this.sada = DatumVreme.sada()
        for (let elem of res.podaci) {
          elem.od = new DatumVreme(elem.od)
          elem.do = new DatumVreme(elem.do)
          elem.trajanje = elem.do.razlikaUMinutima(elem.od)
        }
        this.casovi = res.podaci
      }
    })
    this.servis.profilPodaci().subscribe((res: any) => {
      if (res.poruka == "ok") this.profil = res.podaci
    })
  }

  sada: DatumVreme = DatumVreme.sada()
  mogucePrikljucenje(cas: any) {
    return cas.od.razlikaUMinutima(this.sada) <= 15
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
