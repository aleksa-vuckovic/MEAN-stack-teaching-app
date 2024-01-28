import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UcenikService } from 'src/app/servisi/ucenik.service';
import { Utils } from 'src/app/utils';
import { fajlTipValidator, fajlVisinaSirinaValidator } from 'src/app/validators';

@Component({
  selector: 'app-ucenik-profil',
  templateUrl: './ucenik-profil.component.html',
  styleUrls: ['./ucenik-profil.component.css']
})
export class UcenikProfilComponent {

  podaci: any = {
    ime: "Ime",
    prezime: "Prezime",
    skola: "Skola",
    razred: 4,
    
    mejl: "mejl",
    adresa: "adresa",
    telefon: "telefon",
    profil: ""
  }
  dozvoljenaSrednja: boolean = false;
  dozvoljenaOsnovna: boolean = false;
  dozvoljenPrelazak: boolean = false;
  azurirajDozvoljene() {
    let prelazak = this.azuriranjeForma.get('prelazak')?.value;
    this.dozvoljenaSrednja = this.podaci.skola != "Osnovna" || (this.podaci.razred==8 && prelazak);
    this.dozvoljenaOsnovna = this.podaci.skola == "Osnovna" && (this.podaci.razred < 8 || !prelazak);
    this.dozvoljenPrelazak = !(this.podaci.skola != "Osnovna" && this.podaci.razred == 4);
    let odabranaSkola = this.azuriranjeForma.get('skola')?.value;
    if (!this.dozvoljenaOsnovna && odabranaSkola == "Osnovna") this.azuriranjeForma.get('skola')?.setValue("Gimnazija");
    if (!this.dozvoljenaSrednja && odabranaSkola != "Osnovna") this.azuriranjeForma.get('skola')?.setValue("Osnovna");
  }
  postaviPodatke(podaci: any) {
    this.podaci = podaci
    this.azurirajDozvoljene();
  }

  azuriranjeForma: FormGroup;

  constructor(private servis: UcenikService, private fb: FormBuilder) {
    this.servis.profilPodaci().subscribe((res: any) => {
      if (res.poruka == "ok") this.postaviPodatke(res.podaci);
    })
    this.azuriranjeForma = this.fb.group({
      ime: ["", Validators.required],
      prezime: ["", Validators.required],
      mejl: ["", [Validators.required, Validators.pattern(Utils.mejlRegex())]],
      adresa: ["", Validators.required],
      telefon: ["", [Validators.required, Validators.pattern(Utils.telefonRegex())]],
      skola: ["", Validators.required],
      prelazak: [false],
      profil: [null, [ fajlTipValidator(Utils.profilFajlTipovi()) ], [fajlVisinaSirinaValidator(300, 300, 100, 100)]],
    })
  }

  prikaz2: boolean = false;
  greska: string = ""

  azuriranje() {
    this.greska = "";
    let tmp = {... this.podaci};
    tmp.profil = null;
    delete tmp.razred;
    delete tmp.aktivan;
    tmp.prelazak = false;
    this.azuriranjeForma.setValue(tmp);

    this.prikaz2 = true;
  }
  azuriraj() {
    this.greska = "";
    if (this.azuriranjeForma.get('mejl')?.hasError('pattern')) this.greska = Utils.mejlZahtevi();
    else if (this.azuriranjeForma.get('telefon')?.hasError('pattern')) this.greska = Utils.telefonZahtevi();
    else if (this.azuriranjeForma.get('profil')?.hasError('fajlTip')) this.greska = "Tip fajl mora biti " + Utils.profilFajlTipovi().join(',')  + ".";
    else if (this.azuriranjeForma.get('profil')?.hasError('fajlVisinaSirina')) this.greska = Utils.profilVelicinaZahtevi();
    else if (this.azuriranjeForma.invalid) this.greska = "Sva polja su obavezna."
    else {
      let data = new FormData();
      Utils.dodajUFormu(data, this.azuriranjeForma.value);
      console.log(data.get('prelazak'))
      this.servis.profilAzuriranje(data).subscribe((res: any) => {
        if (res.poruka != "ok") this.greska = res.poruka;
        else {
          this.postaviPodatke(res.podaci);
          this.prikaz2 = false;
        }
      })
    }
  }

  odustani() {
    this.prikaz2 = false;
  }


}
