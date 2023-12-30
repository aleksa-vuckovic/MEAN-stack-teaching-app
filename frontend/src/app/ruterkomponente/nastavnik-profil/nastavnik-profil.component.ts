import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NastavnikService } from 'src/app/servisi/nastavnik.service';
import { PrijavaService } from 'src/app/servisi/prijava.service';
import { Utils } from 'src/app/utils';
import { fajlTipValidator, fajlVisinaSirinaValidator } from 'src/app/validators';

@Component({
  selector: 'app-nastavnik-profil',
  templateUrl: './nastavnik-profil.component.html',
  styleUrls: ['./nastavnik-profil.component.css']
})
export class NastavnikProfilComponent {
  podaci = {
    ime: "Ime",
    prezime: "Prezime",
    mejl: "mejl",
    adresa: "adresa",
    telefon: "telefon",
    profil: null,
    predmeti: ["Matematika", "Fizika"],
    uzrasti: ["Osnovna 1-4"],
    ocena: 4.4,
    cv: ""
  }
  predmeti = ["Matematika", "Fizika"]

  azuriranjeForma: FormGroup;

  constructor(private servis: NastavnikService, private prijavaServis: PrijavaService, private fb: FormBuilder) {
    this.servis.profilPodaci().subscribe((res: any) => {
      if (res.poruka == "ok") this.podaci = res.podaci;
    })
    this.prijavaServis.sviPredmeti().subscribe((res: any) => { this.predmeti = res.podaci;})
    this.azuriranjeForma = this.fb.group({
      ime: ["", Validators.required],
      prezime: ["", Validators.required],
      mejl: ["", [Validators.required, Validators.pattern(Utils.mejlRegex())]],
      adresa: ["", Validators.required],
      telefon: ["", [Validators.required, Validators.pattern(Utils.telefonRegex())]],
      profil: [null, [ fajlTipValidator(Utils.profilFajlTipovi()) ], [fajlVisinaSirinaValidator(300, 300)]],
      predmeti: [[]],
      drugiPredmet: [""],
      uzrasti: [[]]
    })
  }

  prikaz2: boolean = false;
  greska: string = ""

  azuriranje() {
    this.greska = "";
    let tmp : any = {... this.podaci};
    tmp.profil = null;
    delete tmp.ocena;
    delete tmp.cv;
    tmp.drugiPredmet = "";
    this.azuriranjeForma.setValue(tmp);
    for (let elem of this.podaci.predmeti) {
      //dodajem u izbor predmete koje je nastavnik odabrao u opciji nesto drugo
      if (this.predmeti.indexOf(elem) == -1) this.predmeti.push(elem);
    }

    this.prikaz2 = true;
  }
  azuriraj() {
    this.greska = "";
    if (this.azuriranjeForma.get('mejl')?.hasError('pattern')) this.greska = Utils.mejlZahtevi();
    else if (this.azuriranjeForma.get('telefon')?.hasError('pattern')) this.greska = Utils.telefonZahtevi();
    else if (this.azuriranjeForma.get('profil')?.hasError('fajlTip')) this.greska = "Tip fajl mora biti " + Utils.profilFajlTipovi().join(',')  + ".";
    else if (this.azuriranjeForma.get('profil')?.hasError('fajlVisinaSirina')) this.greska = "Velicin fajl je je ogranicena na 300x300.";
    else if (this.azuriranjeForma.invalid) this.greska = "Popunite sve podatke."
    else {
      let forma = new FormData();
      let tmp = this.azuriranjeForma.value;
      //predmeti, uzrasti, saznao, cv
      forma.append('ime', tmp.ime);
      forma.append('prezime', tmp.prezime);
      forma.append('mejl', tmp.mejl);
      forma.append('adresa', tmp.adresa);
      forma.append('telefon', tmp.telefon);
      forma.append('profil', tmp.profil);
      for (let predmet of tmp.predmeti) forma.append('predmeti', predmet);
      if (tmp.drugiPredmet != "") forma.append('predmeti', tmp.drugiPredmet);
      for (let uzrast of tmp.uzrasti) forma.append('uzrasti', uzrast);

      this.servis.profilAzuriranje(forma).subscribe((res: any) => {
        if (res.poruka != "ok") this.greska = res.poruka;
        else {
          this.podaci = res.podaci;
          this.prikaz2 = false;
        }
      })
    }
  }

  odustani() {
    this.prikaz2 = false;
  }
}