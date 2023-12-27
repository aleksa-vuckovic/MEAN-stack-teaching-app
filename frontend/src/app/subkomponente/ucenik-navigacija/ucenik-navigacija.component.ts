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


  ucenikProfil() {
    if (this.trenutni == "ucenikProfil") return;
    this.ruter.navigate(["ucenikProfil"]);
  }
  odjava() {
    if (this.trenutni == "odjava") return;
    this.servis.odjava().subscribe((res: any) => {
      if (res.poruka == "ok") this.ruter.navigate(["prijava"]);
    })
  }
}
