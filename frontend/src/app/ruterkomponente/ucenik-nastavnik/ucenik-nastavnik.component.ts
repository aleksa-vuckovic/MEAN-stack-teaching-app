import { Component } from '@angular/core';
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

  constructor (private servis: UcenikService) {
    let kime = localStorage.getItem("nastavnik") ?? "";
    this.servis.nastavnikProfilPodaci(kime).subscribe((res: any) => {
      console.log(res);
      if (res.poruka == "ok") this.podaci = res.podaci;
    })
  }
}
