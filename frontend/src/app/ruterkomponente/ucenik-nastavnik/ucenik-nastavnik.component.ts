import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UcenikService } from 'src/app/servisi/ucenik.service';

@Component({
  selector: 'app-ucenik-nastavnik',
  templateUrl: './ucenik-nastavnik.component.html',
  styleUrls: ['./ucenik-nastavnik.component.css']
})
export class UcenikNastavnikComponent {
  //ime, prezime, profil, mejl, telefon, predmeti, ocene i komentari
  podaci = {
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
        prezime: "Prezima"
      }
      ]
    }

  constructor (private servis: UcenikService, private ruter: Router) {
    let kime = localStorage.getItem("nastavnik") ?? "";
    this.servis.nastavnikProfilPodaci(kime).subscribe((res: any) => {
      console.log(res);
      if (res.poruka == "ok") this.podaci = res.podaci;
    })
  }

  zakazi() {
    this.ruter.navigate(["ucenikZakazivanje"]);
  }
}
