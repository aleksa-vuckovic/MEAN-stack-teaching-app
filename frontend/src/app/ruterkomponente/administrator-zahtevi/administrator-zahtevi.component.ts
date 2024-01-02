import { Component, OnInit } from '@angular/core';
import { AdministratorService } from 'src/app/servisi/administrator.service';

@Component({
  selector: 'app-administrator-zahtevi',
  templateUrl: './administrator-zahtevi.component.html',
  styleUrls: ['./administrator-zahtevi.component.css']
})
export class AdministratorZahteviComponent implements OnInit {

  zahtevi: Array<any> = []

  constructor(private servis: AdministratorService) {}
  ngOnInit(): void {
      this.osvezi()
  }
  osvezi() {
    this.servis.zahtevi().subscribe((res: any) => {
      if (res.poruka == "ok") this.zahtevi = res.podaci
    })
  }

  prihvati(zahtev: any) {
    this.servis.odobreno(zahtev.kime).subscribe((res:any) => {
      if (res.poruka == "ok") this.osvezi()
    })
  }
  odbij(zahtev: any) {
    this.servis.deaktivacija(zahtev.kime).subscribe((res: any) => {
      if (res.poruka == "ok") this.osvezi()
    })
  }
}
