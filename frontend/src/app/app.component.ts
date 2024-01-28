import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import 'chartjs-adapter-moment'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  
  constructor() {}
}
