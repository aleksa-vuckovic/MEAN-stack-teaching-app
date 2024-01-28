import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UcenikService } from 'src/app/servisi/ucenik.service';

@Component({
  selector: 'app-ucenik-nastavnici',
  templateUrl: './ucenik-nastavnici.component.html',
  styleUrls: ['./ucenik-nastavnici.component.css']
})
export class UcenikNastavniciComponent {

  nastavnici: Array<{ime: string, prezime: string, predmet: string, ocena: number, kime: string}> = []

  pretraga: any =  {
    ime: "",
    prezime: "",
    predmet: "",
    sort: "",
    opadajuce: false
  }

  osvezi() {
    this.servis.nastavniciPretraga(this.pretraga).subscribe((res: any) => {
      console.log(res)
      if (res.poruka == "ok") this.nastavnici = res.podaci;
    })
  }

  constructor (private servis: UcenikService, private ruter: Router) {}
  ngOnInit(): void {
    this.servis.profilPodaci().subscribe((res: any) => {
      if (res.poruka == "ok") {
        let razred = res.podaci.razred
        let skola = res.podaci.skola
        let uzrast = "Srednja";
        if (skola == "Osnovna") uzrast = razred <= 4 ? "Osnovna 1-4" : "Osnovna 5-8";
        this.pretraga.uzrast = uzrast;
        this.osvezi();
      }
    })
  }

  sort: any = {
    ime: false,
    prezime: false,
    predmet: false
  }

  klikSort(polje: string) {
    this.sort[polje] = !this.sort[polje]
    this.pretraga.sort = polje
    this.pretraga.opadajuce = this.sort[polje]
    this.osvezi();
  }

  zaokruzi(broj: number) {
    return Math.round(broj);
  }

  nastavnik(kime: string) {
    localStorage.setItem("nastavnik", kime);
    this.ruter.navigate(["ucenikNastavnik"]);
  } 
}
