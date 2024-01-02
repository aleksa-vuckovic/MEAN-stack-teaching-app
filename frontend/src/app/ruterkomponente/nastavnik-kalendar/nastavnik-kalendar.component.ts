import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DatumVreme } from 'src/app/DatumVreme';
import { NastavnikService } from 'src/app/servisi/nastavnik.service';

@Component({
  selector: 'app-nastavnik-kalendar',
  templateUrl: './nastavnik-kalendar.component.html',
  styleUrls: ['./nastavnik-kalendar.component.css']
})
export class NastavnikKalendarComponent {

  radnovremeForma: FormGroup;

  constructor (private servis: NastavnikService, private ruter: Router, private fb: FormBuilder) {
    this.radnovremeForma = this.fb.group({
      "0": [{od: 0, do: 0}],
      "1": [{od: 0, do: 0}],
      "2": [{od: 0, do: 0}],
      "3": [{od: 0, do: 0}],
      "4": [{od: 0, do: 0}],
      "5": [{od: 0, do: 0}],
      "6": [{od: 0, do: 0}],
    });
  }
  ngOnInit(): void {
    this.datum = DatumVreme.sada().vreme(0);
    this.osvezi();
  }
  osvezi() {
    this.osveziKalendar();
    this.osveziRadnovreme();
  }
  osveziKalendar() {
    let tmp = 0;
    let termini = Array(7);
    for (let i = 0; i < 7; i++) {
      this.servis.termini(this.datum.dodajDan(i)).subscribe((res: any) => {
        console.log(res)
        if (res.poruka != "ok") return;
        termini[i] = res.podaci; tmp++;
        if (tmp == 7) this.termini = termini;
      })
    }
  }
  osveziRadnovreme() {
    this.servis.radnovreme().subscribe((res: any) => {
      this.radnovremeForma.setValue(res.podaci);
    })
  }
  //kalendar
  termini: Array<any> | null = null;
  datum: DatumVreme = DatumVreme.sada();
  period: number = 7;
  velicina: number = 20;
  kalendarStrelica(gore:boolean) {
    let noviDatum = this.datum;
    if (gore) noviDatum = noviDatum.dodajDan(-1);
    else noviDatum = noviDatum.dodajDan(1);2
    let datumZaPretragu;
    if (gore) datumZaPretragu = noviDatum;
    else datumZaPretragu = this.datum.dodajDan(this.period);

    this.servis.termini(datumZaPretragu).subscribe((res: any) => {
      if (gore) {
        console.log(res)
        this.termini?.unshift(res.podaci);
        this.termini?.pop();
      }
      else {
        this.termini?.push(res.podaci);
        this.termini?.shift();
      }
      this.datum = noviDatum;
    })
  }

  //radno vreme
  greskaRadnovreme: string = ""
  uspehRadnovreme: string = "";
  azurirajRadnovreme() {
    this.greskaRadnovreme = "";
    this.uspehRadnovreme = "";
    this.servis.radnovremeAzuriranje(this.radnovremeForma.value).subscribe((res: any) => {
      if (res.poruka != "ok") this.greskaRadnovreme = res.poruka;
      else {
        this.uspehRadnovreme = "Radno vreme je azurirano!"
        setTimeout(() => {this.uspehRadnovreme=""}, 3000)
        this.osveziKalendar();
      }
    })
  }

  //nedostupnost
  nedostupnostOd: DatumVreme = DatumVreme.sada().vreme(12*60)
  nedostupnostDo: DatumVreme = DatumVreme.sada().vreme(12*60)
  uspehNedostupnost: string = ""
  greskaNedostupnost: string = ""
  azurirajNedostupnost() {
    this.greskaNedostupnost = this.uspehNedostupnost = ""
    let od = this.nedostupnostOd;
    let do_ = this.nedostupnostDo;
    if (do_.sirovoVreme() == 0) do_ = do_.vreme(24*60); //specijalni slucaj kao i kod radnog vremena
    this.servis.nedostupnostAzuriranje(od, do_).subscribe((res: any) => {
      if (res.poruka == "ok") {
        this.uspehNedostupnost = "Uspesno ste dodali nedostupnost od " + od.datumVremeString() + " do " + do_.datumVremeString() + "."
        setTimeout(() => {this.uspehNedostupnost = ""}, 3000)
        this.osveziKalendar()
      }
      else {
        this.greskaNedostupnost = res.poruka;
      }
    })
  }

}
