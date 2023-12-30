import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'prijava-navigacija',
  templateUrl: './prijava-navigacija.component.html',
  styleUrls: ['./prijava-navigacija.component.css']
})
export class PrijavaNavigacijaComponent {


  constructor(private ruter: Router) {
  }

  @Input() trenutni:string = "osajtu"

  ciljevi=["osajtu", "prijava", "prijavaAdministrator", "registracija", "promenaLozinke", "zaboravljenaLozinka"]
  labele=["O sajtu", "Prijava", "Adminstracija", "Registracija", "Promena lozinke", "Zaboravljena lozinka"]

  klik(cilj: string) {
    if (this.trenutni == cilj) return;
    else this.ruter.navigate([cilj]);
  }
  
}
