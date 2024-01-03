import { Component } from '@angular/core';
import { ChartTypeRegistry } from 'chart.js';
import { AdministratorService } from 'src/app/servisi/administrator.service';

@Component({
  selector: 'app-statistika-angazovanje',
  templateUrl: './statistika-angazovanje.component.html',
  styleUrls: ['./statistika-angazovanje.component.css']
})
export class StatistikaAngazovanjeComponent {

  labels = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"]
  datasets = [
    {
      label: "Nastavnik Nastavnikovic",
      data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    }
  ]

  options={
    responsive: true
  }
  legend = true
  type: keyof ChartTypeRegistry='line'

  constructor(private servis: AdministratorService) {}
  ngOnInit(): void {
    this.servis.angazovanjeNastavnika().subscribe((res: any) => {
      console.log(res)
      if (res.poruka == "ok") {
        let podaci = []
        for (let elem of res.podaci) {
          podaci.push({
            label: elem.ime,
            data: elem.podaci
          })
        }
        this.datasets = podaci
      }
    })
  }
}
