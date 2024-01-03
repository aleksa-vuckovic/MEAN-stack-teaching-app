import { Component } from '@angular/core';
import { ChartTypeRegistry } from 'chart.js';
import { AdministratorService } from 'src/app/servisi/administrator.service';

@Component({
  selector: 'app-statistika-pol',
  templateUrl: './statistika-pol.component.html',
  styleUrls: ['./statistika-pol.component.css']
})
export class StatistikaPolComponent {

  labels = ["Z", "M"]
  nastavnikPodaci = [
    {
      data: [1, 2]
    }
  ]
  ucenikPodaci = [
    {
      data: [1, 2]
    }
  ]

  opcije={
    responsive: true
  }
  legenda = true
  tip: keyof ChartTypeRegistry='pie'

  constructor(private servis: AdministratorService) {}
  ngOnInit(): void {
    this.servis.brojKorisnikaPoPolu().subscribe((res: any) => {
      if (res.poruka == "ok") {
        console.log(res)
        this.nastavnikPodaci = [
          {
            data: [res.podaci.Nastavnik.Z, res.podaci.Nastavnik.M]
          }
        ]
        this.ucenikPodaci = [
          {
            data: [res.podaci.Ucenik.Z, res.podaci.Ucenik.M]
          }
        ]
      }
    })
  }
}
