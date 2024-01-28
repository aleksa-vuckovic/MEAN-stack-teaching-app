import { Component } from '@angular/core';
import { ChartTypeRegistry } from 'chart.js';
import * as moment from 'moment';
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
    this.servis.nastavniciOtkazivanjaOdbijanja().subscribe((res: any) => {
      console.log(res)
      if (res.poruka == "ok") {
        this.nastavnici = res.podaci
        this.odabran = this.nastavnici[0]
        this.odabranNastavnik()
      }
    })
  }

  //otkazivanja
  odabran ={
    kime: "",
    ime: "",
    prezime: "",
    otkazano: 0,
    odbijeno: 0,
    odrzano: 0,
    procenat: 0
  }
  nastavnici = [
    this.odabran
  ]
  odabranNastavnik() {
    console.log("azurira se za nastavnika")
    console.log(this.odabran)
    this.azurirajUdeo(this.odabran)
    this.azurirajOtkazivanja(this.odabran)
  }
  
  udeoType: keyof ChartTypeRegistry="pie"
  udeoLabels = ["Otkazano", "Odbijeno", "Odrzano"]
  udeoDatasets = [
    {
      data: [1, 2, 3]
    }
  ]
  udeoLegend = true
  udeoOptions = {
    responsive: true
  }
  azurirajUdeo(nastavnik: any) {
    this.udeoDatasets = [{data: [nastavnik.otkazano, nastavnik.odbijeno, nastavnik.odrzano]}]
  }

  otkazivanjaType: keyof ChartTypeRegistry="scatter"
  otkazivanjaDatasets = [
    {
      data: [
        { x: moment("2023-01-01"), y: 10 },
        { x: moment("2023-02-01"), y: 1000 },
        { x: moment("2023-04-01"), y: 10000 },
        // Add more data points as needed
      ],
      pointBackgroundColor: 'red', // customize the point color
      pointRadius: 5, // customize the point radius
      label: 'Profesor 1'
    },
  ];
  azurirajOtkazivanja(nastavnik: any) {
    this.servis.nastavnikOtkazivanja(nastavnik.kime).subscribe((res: any) => {
      console.log(res)
      if (res.poruka == "ok") {
        this.otkazivanjaDatasets = [
          {
            data: res.podaci,
            pointBackgroundColor: 'red', // customize the point color
            pointRadius: 5, // customize the point radius
            label: `${nastavnik.ime} ${nastavnik.prezime}`
          }
        ]
      }
    })
  }
  otkazivanjaLegend = true
  otkazivanjaOptions: any = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            day: 'MMM YY',
            month: "MMM YY",
            week: "MMM YY",
            year: "MMM YY",
            quarter: 'MMM YY'
          }
        },
        scaleLabel: {
          display: true,
          labelString: 'Date'
        }
      },
      y: {
        min: 0,
        type: 'logarithmic',
        scaleLabel: {
          display: true,
          labelString: 'Values'
        },
        ticks: {
          callback: function(value: number) {
            if (value < 60) {  // Less than 1 hour
              return value.toFixed(0) + "min"
            } else if (value <= 60*72) {
              return (value / 60).toFixed(0) + "hr"
            } else return (value / (60*24)).toFixed(0) + "d"
          },
        }
      }
    }
  };
}
