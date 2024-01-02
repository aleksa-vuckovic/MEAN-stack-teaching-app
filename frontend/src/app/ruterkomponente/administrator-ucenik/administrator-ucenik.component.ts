import { Component } from '@angular/core';
import { AdministratorService } from 'src/app/servisi/administrator.service';

@Component({
  selector: 'app-administrator-ucenik',
  templateUrl: './administrator-ucenik.component.html',
  styleUrls: ['./administrator-ucenik.component.css']
})
export class AdministratorUcenikComponent {

  podaci = {
    ime: "Ime",
    prezime: "Prezime",
    mejl: "mejl",
    telefon: "telefon",
    skola: "Osnovna",
    razred: "Razred",
    profil: "",
    aktivan: true
  }
  kime: string = ""

  //od, do, predmet, ocena, komentar
  casovi: Array<any> = []

  constructor(private servis: AdministratorService) {
    this.kime = localStorage.getItem("ucenik") ?? ""
    this.servis.ucenikPodaci(this.kime).subscribe((res: any) => {
      if (res.poruka == "ok") this.podaci = res.podaci
    })
  }

  aktiviraj() {
    this.servis.aktivacija(this.kime).subscribe((res: any) => {
      if (res.poruka == "ok") this.podaci.aktivan = true
    })
  }
  deaktiviraj() {
    this.servis.deaktivacija(this.kime).subscribe((res: any) => {
      if (res.poruka == "ok") this.podaci.aktivan = false
    })
  }
}
