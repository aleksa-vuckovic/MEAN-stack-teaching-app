import { Component, OnInit } from '@angular/core';
import { ChartTypeRegistry } from 'chart.js';
import { AdministratorService } from 'src/app/servisi/administrator.service';

@Component({
  selector: 'app-statistika-broj-nastavnika',
  templateUrl: './statistika-broj-nastavnika.component.html',
  styleUrls: ['./statistika-broj-nastavnika.component.css']
})
export class StatistikaBrojNastavnikaComponent implements OnInit {

  poPredmetuPodaci = [
    {
      data: [{predmet: "Matematika", broj: 10}, {predmet: "Istorija", broj: 1}],
      parsing: {
        xAxisKey: "predmet",
        yAxisKey: "broj"
      }
    }
  ]
  poUzrastuPodaci = [
    {
      data: [{uzrast: "Osnovna 1-4", broj: 10}, {uzrast: "Srednja", broj: 1}],
      parsing: {
        xAxisKey: "uzrast",
        yAxisKey: "broj"
      }
    }
  ]

  opcije={
    responsive: true,
    backgroundColor: 'rgba(75, 192, 192, 0.5)'
  }
  legenda = false
  tip: keyof ChartTypeRegistry='bar'

  constructor(private servis: AdministratorService) {}
  ngOnInit(): void {
    this.servis.brojNastavnikaPoPredmetu().subscribe((res: any) => {
      if (res.poruka == "ok") {
        this.poPredmetuPodaci = [
          {
            data: res.podaci,
            parsing: {
              xAxisKey: "predmet",
              yAxisKey: "broj"
            }
          }
        ]
      }
    })
    this.servis.brojNastavnikaPoUzrastu().subscribe((res: any) => {
      console.log(res)
      if (res.poruka == "ok") {
        this.poUzrastuPodaci = [
          {
            data: res.podaci,
            parsing: {
              xAxisKey: "uzrast",
              yAxisKey: "broj"
            }
          }
        ]
      }
    })
  }

}
