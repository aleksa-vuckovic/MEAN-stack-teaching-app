import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { DatumVreme } from 'src/app/DatumVreme';
import { UcenikService } from 'src/app/servisi/ucenik.service';

@Component({
  selector: 'app-zakazivanje',
  templateUrl: './zakazivanje.component.html',
  styleUrls: ['./zakazivanje.component.css']
})
export class ZakazivanjeComponent implements OnInit {
  //ime, prezime, profil, mejl, telefon, predmeti, ocene i komentari
  nastavniKime = "";
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

  constructor (private servis: UcenikService, private ruter: Router) {}
  ngOnInit(): void {
    this.nastavniKime = localStorage.getItem("nastavnik") ?? "";
    this.servis.nastavnikProfilPodaci(this.nastavniKime).subscribe((res:any) => {
      console.log(res);
      this.podaci = res.podaci; this.predmet = res.podaci.predmeti[0]
    })
    this.datum = DatumVreme.sada().vreme(0);
    let termini = Array(7);
    let tmp = 0;
    for (let i = 0; i < 7; i++) {
      this.servis.nastavnikTermini(this.nastavniKime, this.datum.dodajDan(i)).subscribe((res: any) => {
        termini[i] = res.podaci; tmp++;
        if (tmp == 7) this.termini = termini;
      })
    }
  }
  kalendar:boolean = false;

  //kalendar
  termini: Array<any> | null = null;
  datum: DatumVreme = DatumVreme.sada();
  period: number = 7;
  velicina: number = 20;
  kalendarStrelica(gore:boolean) {
    let noviDatum = this.datum;
    if (gore) noviDatum = noviDatum.dodajDan(-1);
    else noviDatum = noviDatum.dodajDan(1);2
    let datumZaPretragu;
    if (gore) datumZaPretragu = noviDatum;
    else datumZaPretragu = this.datum.dodajDan(this.period);

    this.servis.nastavnikTermini(this.nastavniKime, datumZaPretragu).subscribe((res: any) => {
      if (gore) {
        console.log(res)
        this.termini?.unshift(res.podaci);
        this.termini?.pop();
      }
      else {
        this.termini?.push(res.podaci);
        this.termini?.shift();
      }
      this.datum = noviDatum;
    })
  }

  //forma
  predmet: string = ""
  datumvreme1: DatumVreme = DatumVreme.sada().vreme(60*12);
  datumvreme2: DatumVreme = DatumVreme.sada().vreme(60*12);
  duplicas: boolean = false;
  opis: string = "";


  greska: string = ""
  poruka: string = ""
  modal() {
    new bootstrap.Modal(document.getElementById('modal') as Element).show();
  }
  kraj() {
    this.ruter.navigate(["ucenikNastavnik"]);
  }

  zakazi() {
    this.greska = ""
    let dv = this.kalendar ? this.datumvreme2 : this.datumvreme1;
    this.servis.zakazi({
      nastavnik: this.nastavniKime,
      datumvreme: dv.broj(),
      trajanje: this.duplicas ? 120 : 60,
      opis: this.opis,
      predmet: this.predmet
    }).subscribe((res: any) => {
      if (res.poruka == "ok") {
        this.poruka = "Zakazali ste cas za " + dv.datumVremeString() + " u trajanju od " + (this.duplicas ? "120" : "60") + " minuta, iz predmeta " + this.predmet + "."
        this.modal();
      } else this.greska = res.poruka;
    })
  }

}
