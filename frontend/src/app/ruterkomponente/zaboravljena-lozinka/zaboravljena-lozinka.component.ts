import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrijavaService } from 'src/app/servisi/prijava.service';
import { Utils } from 'src/app/utils';

@Component({
  selector: 'app-zaboravljena-lozinka',
  templateUrl: './zaboravljena-lozinka.component.html',
  styleUrls: ['./zaboravljena-lozinka.component.css']
})
export class ZaboravljenaLozinkaComponent {
  zaboravljenaForm: FormGroup;

  constructor(private fb: FormBuilder, private servis: PrijavaService, private ruter: Router) {
    this.zaboravljenaForm = this.fb.group({
      kime: ['', Validators.required],
      odgovor: ['', [ Validators.required ] ],
      nova: ['', [ Validators.required, Validators.pattern(Utils.lozinkaRegex()) ] ],
      nova2: ['', [ Validators.required ] ],
    });
  }

  greska: string = ""
  alertUspeh: string = ""
  pitanje: string = ""

  korak: number = 1

  ngOnInit(): void {
  }

  korak1() {
    this.greska = this.alertUspeh = ""
    let kime = this.zaboravljenaForm.get('kime')
    if (kime?.hasError('required')) {
      this.greska = "Unesite korisnicko ime!"
    }
    else {
      this.servis.sigurnosnoPitanje(kime?.value).subscribe((res:any) => {
        if (res.poruka != "ok") this.greska = res.poruka;
        else {
          this.pitanje = res.podaci;
          this.korak = 2;
        }
      })
    }
  }
  korak2() {
    this.greska = this.alertUspeh = ""
    let odgovor = this.zaboravljenaForm.get('odgovor')
    if (odgovor?.hasError('required')) {
      this.greska = "Unesite odgovor!"
    }
    else {
      this.servis.sigurnosniOdgovor(this.zaboravljenaForm.value).subscribe((res:any) => {
        if (res.poruka != "ok") this.greska = res.poruka;
        else {
          this.korak = 3;
        }
      })
    }
  }
  korak3() {
    this.greska = this.alertUspeh = ""
    let nova = this.zaboravljenaForm.get('nova')
    let nova2 = this.zaboravljenaForm.get('nova2')
    if (nova?.hasError('required')) {
      this.greska = 'Morate uneti lozinku.'
    }
    else if (nova?.hasError('pattern')) {
      this.greska = Utils.lozinkaZahtevi();
    }
    else if(nova?.value != nova2?.value) {
      this.greska = "Ponovljena lozinka nije ista."
    }
    else {
      this.servis.zaboravljenaLozinka(this.zaboravljenaForm.value).subscribe((res: any) => {
        if (res.poruka != "ok") this.greska = res.poruka;
        else {
          this.alertUspeh = "Lozinka je uspesno promenjena. Preusmeravanje za 6.";
          let cnt = 6;
          let id: any;
          id = setInterval(() => {
            if (cnt > 0) this.alertUspeh = `Lozinka je uspesno promenjena. Preusmeravanje za ${--cnt}.`
            else {
              clearInterval(id);
              this.ruter.navigate(["prijava"])
            }
          }, 1000)
        }
      })
    }
  }
}
