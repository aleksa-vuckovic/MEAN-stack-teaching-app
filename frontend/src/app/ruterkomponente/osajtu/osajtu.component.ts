import { Component, OnInit } from '@angular/core';
import { PrijavaService } from 'src/app/servisi/prijava.service';

@Component({
  selector: 'osajtu',
  templateUrl: './osajtu.component.html',
  styleUrls: ['./osajtu.component.css']
})
export class OsajtuComponent implements OnInit {

  statistika: any = {
    brojNastavnika: 0,
    brojUcenika: 0
  }
  nastavnici: Array<{ime: string, prezime: string, predmet: string}> = []

  pretraga =  {
    ime: "",
    prezime: "",
    predmet: "",
    sort: "",
    opadajuce: false
  }

  osvezi() {
    console.log(this.pretraga);
    this.servis.sviNastavnici(this.pretraga).subscribe((res: any) => {
      if (res.message == "ok") this.nastavnici = res.data;
    })
  }

  constructor (private servis: PrijavaService) {}
  ngOnInit(): void {
    this.servis.statistika().subscribe((res:any) => {
      if (res.message == "ok") this.statistika = res.data;
    })
    this.osvezi();
  }

  sort: any = {
    ime: false,
    prezime: false,
    predmet: false
  }

  klikSort(polje: string) {
    this.sort[polje] = !this.sort[polje]
    this.pretraga.sort = polje
    this.pretraga.opadajuce = this.sort[polje]
    this.osvezi();
  }
  
}
