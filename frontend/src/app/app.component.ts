import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatumVreme } from './DatumVreme';
import { UcenikService } from './servisi/ucenik.service';
import * as bootstrap from 'bootstrap';
import { Router } from '@angular/router';

declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  
  constructor(private ruter: Router) {}
  startMeeting() {
    let cas = {
      id: 19238571093485710935,
      mejl: "aleksa@gmail.com",
      ime: "Aleksa Vuckovic"
    }
    localStorage.setItem("cas", JSON.stringify(cas))
    this.ruter.navigate(["sastanak"])
  }
}
