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


  osajtu() {
    if (this.trenutni == "osajtu") return;
    this.ruter.navigate(["osajtu"]);
  }
  prijava() {
    if (this.trenutni == "prijava") return;
    this.ruter.navigate(["prijava"]);
  }
  prijavaAdministrator() {
    if (this.trenutni == "prijavaAdministrator") return;
    this.ruter.navigate(["prijavaAdministrator"]);
  }
  registracija() {
    if (this.trenutni == "registracija") return;
    this.ruter.navigate(["registracija"]);
  }
  promenaLozinke() {
    if (this.trenutni == "promenaLozinke") return;
    this.ruter.navigate(["promenaLozinke"]);
  }
  zaboravljenaLozinka() {
    if (this.trenutni == "zaboravljenaLozinka") return;
    this.ruter.navigate(["zaboravljenaLozinka"]);
  }
  
}
