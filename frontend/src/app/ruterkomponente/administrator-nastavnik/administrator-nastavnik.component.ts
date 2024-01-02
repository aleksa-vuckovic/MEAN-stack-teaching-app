import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdministratorService } from 'src/app/servisi/administrator.service';

@Component({
  selector: 'app-administrator-nastavnik',
  templateUrl: './administrator-nastavnik.component.html',
  styleUrls: ['./administrator-nastavnik.component.css']
})
export class AdministratorNastavnikComponent {
    //ime, prezime, profil, mejl, telefon, predmeti, ocene i komentari
    podaci = {
      aktivan: true,
      ime: "Ime",
      prezime: "Prezime",
      mejl: "mejl",
      profil: "",
      telefon: "telefon",
      predmeti: ["Matematika", "Fizika"],
      ocena: 4.4,
      komentari: [
        {
          ocena: 5,
          komentar: "Komentar",
          profil: "",
          ime: "Ime",
          prezime: "Prezime",
          datumvreme: 0,
          predmet: "Matematika"
        }
        ]
    }
    kime: string = ""
    constructor (private servis: AdministratorService) {
      this.kime = localStorage.getItem("nastavnik") ?? "";
      this.servis.nastavnikPodaci(this.kime).subscribe((res: any) => {
        if (res.poruka == "ok") {
          this.podaci = res.podaci;
        }
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
