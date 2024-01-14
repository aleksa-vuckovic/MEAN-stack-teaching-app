import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-sastanak',
  templateUrl: './sastanak.component.html',
  styleUrls: ['./sastanak.component.css']
})
export class SastanakComponent implements AfterViewInit {

  @ViewChild('video') video!: ElementRef;
  api: any
  constructor(private location: Location) {}
  ngAfterViewInit(): void {
      let cas = JSON.parse(localStorage.getItem("cas") ?? "{}")
      const domain = 'meet.jit.si';
      const options = {
        roomName: cas.id.toString(),
        width: "100%",
        height: "100%",
        parentNode: this.video.nativeElement,
        userInfo: {
          email: cas.mejl,
          displayName: cas.ime
      }
      };
      this.api = new JitsiMeetExternalAPI(domain, options);
  }

  izlaz() {
    this.location.back()
  }

 
  
  
}
