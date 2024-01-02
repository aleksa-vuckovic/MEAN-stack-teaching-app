import { Component, OnInit } from '@angular/core';
import { DatumVreme } from 'src/app/DatumVreme';
import { UcenikService } from 'src/app/servisi/ucenik.service';

@Component({
  selector: 'app-ucenik-obavestenja',
  templateUrl: './ucenik-obavestenja.component.html',
  styleUrls: ['./ucenik-obavestenja.component.css']
})
export class UcenikObavestenjaComponent implements OnInit {


  obavestenja: Array<any> = []
  kraj = false
  constructor(private servis: UcenikService) {}
  ngOnInit(): void {
      this.jos()
  }

  jos() {
    if (this.kraj) return
    let do_ = DatumVreme.sada().dodajDan(1);
    if (this.obavestenja.length > 0) do_ = this.obavestenja[this.obavestenja.length - 1].datumvreme
    this.servis.obavestenja(do_).subscribe((res: any) => {
      console.log(res)
      if (res.poruka=="ok") {
        for (let elem of res.podaci) {
          elem.datumvreme = new DatumVreme(elem.datumvreme)
          this.obavestenja.push(elem)
        }
        if (res.podaci.length == 0) this.kraj = true
      }
    })
  }

}
