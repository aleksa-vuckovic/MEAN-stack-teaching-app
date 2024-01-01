import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NastavnikService } from 'src/app/servisi/nastavnik.service';

@Component({
  selector: 'app-nastavnik-ucenici',
  templateUrl: './nastavnik-ucenici.component.html',
  styleUrls: ['./nastavnik-ucenici.component.css']
})
export class NastavnikUceniciComponent {

  ucenici: Array<any> = []
  constructor(private servis: NastavnikService, private ruter: Router) {
    this.servis.ucenici().subscribe((res: any) => {
      if (res.poruka == "ok") this.ucenici = res.podaci;
    })
  }

  klik(kime: string) {
    localStorage.setItem("dosije", kime)
    this.ruter.navigate(["nastavnikDosije"])
  }

}