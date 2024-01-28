import { Component, ElementRef, HostListener, ViewChild, inject } from '@angular/core';
import * as moment from 'moment'
import 'chartjs-adapter-moment'
import { Router } from '@angular/router';
import { ChartTypeRegistry } from 'chart.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  
  constructor(private ruter: Router) {}

  datasets = [
    {
      data: [
        
        { x: '2023-01-01', y: 10 },
        { x: new Date('2023-02-05'), y: 20 },
        { x: new Date('2023-04-10'), y: 15 },
        /*
        { x: moment(new Date("2023-01-01").toISOString()), y: 10 },
        { x: moment("2023-02-01"), y: 20 },
        { x: moment("2023-04-01"), y: 15 },*/
        // Add more data points as needed
      ],
      pointBackgroundColor: 'red', // customize the point color
      pointRadius: 5, // customize the point radius
      label: 'Profesor 1'
    },
  ];
  type: keyof ChartTypeRegistry = 'scatter'
  legend = true
  // Define your scatter chart options
  options: any = {
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
            // Convert milliseconds to minutes or hours as needed
            if (value < 20) {  // Less than 1 hour
              return value.toFixed(2) + "min"
            } else {
              return value.toString() + "hr"
            }
          },
        }
      }
    }
  };

}
