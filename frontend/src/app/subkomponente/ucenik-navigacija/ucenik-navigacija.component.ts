import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PrijavaService } from 'src/app/servisi/prijava.service';

@Component({
  selector: 'ucenik-navigacija',
  templateUrl: './ucenik-navigacija.component.html',
  styleUrls: ['./ucenik-navigacija.component.css']
})
export class UcenikNavigacijaComponent {

  constructor(private ruter: Router, private servis: PrijavaService) {
  }

  @Input() trenutni:string = "ucenikProfil"
  ciljevi=["ucenikProfil","ucenikNastavnici", "ucenikArhiva", "ucenikCasovi", "ucenikObavestenja", "odjava"]
  labele=["Profil", "Nastavnici", "Arhiva", "Casovi", "Obavestenja", "Odjava"]

  klik(cilj: string) {
    if (cilj == "odjava") {
      this.servis.odjava().subscribe((res: any) => {
        if (res.poruka == "ok") this.ruter.navigate(["prijava"]);
      })
    }
    else if (this.trenutni == cilj) return;
    else this.ruter.navigate([cilj]);
  }
}
