import { Component } from '@angular/core';
import { UcenikService } from 'src/app/servisi/ucenik.service';

@Component({
  selector: 'app-ucenik-profil',
  templateUrl: './ucenik-profil.component.html',
  styleUrls: ['./ucenik-profil.component.css']
})
export class UcenikProfilComponent {

  podaci: any = {
    ime: "Ime",
    prezime: "Prezime",
    skola: "Skola",
    razred: 4,
    
    mejl: "mejl",
    adresa: "adresa",
    telefon: "telefon",
    profil: ""
  }
  constructor(private servis: UcenikService) {
    this.servis.profilPodaci().subscribe((res: any) => {
      if (res.poruka == "ok") this.podaci = res.podaci;
    })
  }

  azuriranje() {

  }


}
