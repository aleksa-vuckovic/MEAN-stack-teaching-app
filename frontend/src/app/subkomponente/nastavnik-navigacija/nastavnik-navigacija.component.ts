import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NastavnikService } from 'src/app/servisi/nastavnik.service';
import { PrijavaService } from 'src/app/servisi/prijava.service';

@Component({
  selector: 'nastavnik-navigacija',
  templateUrl: './nastavnik-navigacija.component.html',
  styleUrls: ['./nastavnik-navigacija.component.css']
})
export class NastavnikNavigacijaComponent {

  
  constructor(private ruter: Router, private servis: PrijavaService) {
  }

  @Input() trenutni:string = "nastavnikProfil"
  ciljevi=["nastavnikProfil", "nastavnikKalendar", "nastavnikCasovi", "nastavnikZahtevi", "odjava"]
  labele=["Profil", "Kalendar", "Casovi", "Zahtevi", "Odjava"]

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
