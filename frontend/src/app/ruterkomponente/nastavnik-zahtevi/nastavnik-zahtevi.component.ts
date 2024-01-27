import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatumVreme } from 'src/app/DatumVreme';
import { NastavnikService } from 'src/app/servisi/nastavnik.service';

@Component({
  selector: 'app-nastavnik-zahtevi',
  templateUrl: './nastavnik-zahtevi.component.html',
  styleUrls: ['./nastavnik-zahtevi.component.css']
})
export class NastavnikZahteviComponent {
  zahtevi: Array<any> = []
  constructor(private servis: NastavnikService, public modalServis: NgbModal) {
    this.osveziZahteve()
  }
  osveziZahteve() {
    this.servis.zahtevi().subscribe((res: any) => {
      if (res.poruka == "ok") {
        for (let elem of res.podaci) {
          elem.od = new DatumVreme(elem.od)
          elem.do = new DatumVreme(elem.do)
          elem.trajanje = elem.do.razlikaUMinutima(elem.od)
        }
        this.zahtevi = res.podaci
      }
    })
  }

  //otkazivanje
  odabran: any = null
  potvrda: boolean = false
  obrazlozenje: string = ""
  greska: string = ""
  @ViewChild('modal') modal!: ElementRef;
  potvrdi(zahtev: any) {
    this.servis.potvrdi(zahtev._id).subscribe((res:any) => {
      if (res.poruka == "ok") this.osveziZahteve();
    })
  }
  odbij(zahtev: any) {
    this.odabran = zahtev;
    this.obrazlozenje = ""
    this.modalServis.open(this.modal)
  }
  odbijDefinitivno() {
    this.servis.odbij(this.odabran._id, this.obrazlozenje).subscribe((res: any) => {
      if (res.poruka == "ok") {
        this.modalServis.dismissAll()
        this.osveziZahteve()
      }
    })
  }
}
