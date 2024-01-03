import { Component, OnInit } from '@angular/core';
import { AdministratorService } from 'src/app/servisi/administrator.service';
import { PrijavaService } from 'src/app/servisi/prijava.service';

@Component({
  selector: 'app-administrator-predmeti',
  templateUrl: './administrator-predmeti.component.html',
  styleUrls: ['./administrator-predmeti.component.css']
})
export class AdministratorPredmetiComponent implements OnInit {

  predmeti: Array<string> = []
  predlozi: Array<string> = []

  constructor(private servis: AdministratorService, private prijavaServis: PrijavaService) {}
  ngOnInit(): void {
    this.prijavaServis.sviPredmeti().subscribe((res: any) => {
      if (res.poruka == "ok") this.predmeti = res.podaci
    })
    this.servis.predlozeniPredmeti().subscribe((res: any) => {
      if (res.poruka == "ok") this.predlozi = res.podaci
    })
  }

  drugiPredmet: string = ""
  greska: string = ""

  dodaj(predmet: string) {
    this.greska = ""
    this.servis.dodajPredmet(predmet).subscribe((res: any) => {
      if (res.poruka == "ok") {
        this.predmeti.push(predmet)
        let i = this.predlozi.indexOf(predmet)
        if (i != -1) this.predlozi.splice(i, 1)
        if (this.drugiPredmet == predmet) this.drugiPredmet = ""
      }
      else {
        this.greska = res.poruka
      }
    })
  }

  ukloni(predmet: string) {
    this.servis.ukloniPredmet(predmet).subscribe((res: any) => {
      if (res.poruka == "ok") {
        let i = this.predmeti.indexOf(predmet)
        if (i != -1) {
          this.predmeti.splice(i, 1)
          this.predlozi.push(predmet)
        }
      }
    })
  }
}
