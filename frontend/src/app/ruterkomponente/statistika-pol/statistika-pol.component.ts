import { Component } from '@angular/core';
import { ChartTypeRegistry } from 'chart.js';
import { AdministratorService } from 'src/app/servisi/administrator.service';

@Component({
  selector: 'app-statistika-pol',
  templateUrl: './statistika-pol.component.html',
  styleUrls: ['./statistika-pol.component.css']
})
export class StatistikaPolComponent {

  labels = ["Ž", "M"]
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

  options={
    responsive: true
  }
  legend = true
  type: keyof ChartTypeRegistry='pie'

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

    this.servis.brojCasovaPoPredmetuPoPolu().subscribe((res:any) => {
      if (res.poruka == "ok") {
        console.log(res)
        this.predmetiLabele = res.podaci.predmeti
        this.predmetiPodaci.push({
          label: "Ž",
          data: res.podaci.podaciZ,
          fill: true
        })
        this.predmetiPodaci.push({
          label: "M",
          data: res.podaci.podaciM,
          fill: true
        })
      }
    })
  }


  predmetiLabele: Array<string> = []
  predmetiPodaci: Array<any> =[]
  predmetiType: keyof ChartTypeRegistry = 'radar'

}
