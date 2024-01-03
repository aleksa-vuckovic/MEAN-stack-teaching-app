import { Component, inject } from '@angular/core';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatumVreme } from './DatumVreme';
import { UcenikService } from './servisi/ucenik.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  
  data={
    labels: ["M", "Z"],
    datasets: [
      {
        label: "Broj nastavnika",
        data: [5, 10]
      },
      {
        label: "Broj ucenika",
        data: [10, 10]
      }
    ]
  }
  
  options = {
    responsive: true
  }
  legend=false
  type='bar'
}
