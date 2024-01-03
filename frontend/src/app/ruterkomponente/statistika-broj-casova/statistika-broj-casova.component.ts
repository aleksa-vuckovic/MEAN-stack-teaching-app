import { Component } from '@angular/core';
import { ChartTypeRegistry } from 'chart.js';
import { AdministratorService } from 'src/app/servisi/administrator.service';

@Component({
  selector: 'app-statistika-broj-casova',
  templateUrl: './statistika-broj-casova.component.html',
  styleUrls: ['./statistika-broj-casova.component.css']
})
export class StatistikaBrojCasovaComponent {

  poDanuPodaci: any = {
    labels: ["PON", "UTO", "SRE", "CET", "PET", "SUB", "NED"],
    datasets: 
      [
        {
          data: [0, 1, 2, 3, 4, 5, 6]
        }
      ]
  }
  poSatuPodaci = {
    labels: Array.from({length: 24}, (_, i) => i),
    datasets: 
      [
      {
        data: Array.from({length: 24}, (_, i) => i*10),
      }
    ]
  }

  opcije={
    responsive: true,
    barPercentage: 1.0,
    categoryPercentage: 1.0,
    backgroundColor: 'rgba(75, 192, 192, 0.5)'
  }
  legenda = false
  tip: keyof ChartTypeRegistry='bar'

  constructor(private servis: AdministratorService) {}
  ngOnInit(): void {
    this.servis.brojCasovaPoDanuNedelje().subscribe((res: any) => {
      console.log(res)
      if (res.poruka == "ok") {
        let tmp = {...this.poDanuPodaci}
        tmp.datasets = [{data: res.podaci}]
        this.poDanuPodaci = tmp
      }
    })
    this.servis.brojCasovaPoSatu().subscribe((res: any) => {
      console.log(res)
      if (res.poruka == "ok") {
        let tmp = {...this.poSatuPodaci}
        tmp.datasets = [{data: res.podaci}]
        this.poSatuPodaci = tmp
      }
    })
  }
}
