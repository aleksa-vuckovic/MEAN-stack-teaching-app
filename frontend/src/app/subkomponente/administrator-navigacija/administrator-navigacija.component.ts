import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PrijavaService } from 'src/app/servisi/prijava.service';

@Component({
  selector: 'administrator-navigacija',
  templateUrl: './administrator-navigacija.component.html',
  styleUrls: ['./administrator-navigacija.component.css']
})
export class AdministratorNavigacijaComponent {
  constructor(private ruter: Router, private servis: PrijavaService) {
  }

  @Input() trenutni:string = "nastavnikProfil"
  ciljevi=["administratorKorisnici","administratorZahtevi", "administratorPredmeti", "statistikaBrojNastavnika", "statistikaPol", 
  "statistikaBrojCasova", "statistikaAngazovanje", "odjava"]
  labele=["Korisnici", "Zahtevi", "Predmeti", "Broj nastavnika", "Pol", "Broj casova", "Angazovanje nastavnika", "Odjava"]

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
