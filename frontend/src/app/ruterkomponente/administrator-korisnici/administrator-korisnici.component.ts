import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdministratorService } from 'src/app/servisi/administrator.service';

@Component({
  selector: 'app-administrator-korisnici',
  templateUrl: './administrator-korisnici.component.html',
  styleUrls: ['./administrator-korisnici.component.css']
})
export class AdministratorKorisniciComponent {

  korisnici: Array<{tip: string, ime: string, prezime: string, mejl: string, kime: string}> = []

  pretraga =  {
    ime: "",
    prezime: "",
    mejl: "",
    sort: "",
    opadajuce: false
  }

  osvezi() {
    this.servis.korisniciPretraga(this.pretraga).subscribe((res: any) => {
      if (res.poruka == "ok") this.korisnici = res.podaci;
    })
  }

  constructor (private servis: AdministratorService, private ruter: Router) {}
  ngOnInit(): void {
    this.osvezi();
  }

  sort: any = {
    ime: false,
    prezime: false,
    mejl: false
  }

  klikSort(polje: string) {
    this.sort[polje] = !this.sort[polje]
    this.pretraga.sort = polje
    this.pretraga.opadajuce = this.sort[polje]
    this.osvezi();
  }

  klik(korisnik: any) {
    if (korisnik.tip == "Nastavnik") {
      localStorage.setItem("nastavnik", korisnik.kime)
      this.ruter.navigate(["administratorNastavnik"])
    }
    else {
      localStorage.setItem("ucenik", korisnik.kime)
      this.ruter.navigate(["administratorUcenik"])
    }
  }
}
