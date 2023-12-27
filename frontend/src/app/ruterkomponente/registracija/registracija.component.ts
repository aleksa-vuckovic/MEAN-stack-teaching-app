import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fajlTipValidator, fajlVelicinaValidator, fajlVisinaSirinaValidator } from '../../validators';
import { Utils } from '../../utils';
import { PrijavaService } from '../../servisi/prijava.service';

@Component({
  selector: 'registracija',
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent {
  private lozinkaRegex = Utils.lozinkaRegex();
  private telefonRegex = Utils.telefonRegex();
  private mejlRegex = Utils.mejlRegex();

  registracijaForm: FormGroup;
  korak2UcenikForm: FormGroup;
  korak2NastavnikForm: FormGroup;

  private profilFajlTipovi = Utils.profilFajlTipovi();
  predmeti = ["Matematika", "Fizika", "Hemija"];

  constructor(private fb: FormBuilder, private servis: PrijavaService) {
    this.servis.sviPredmeti().subscribe((res: any) => {
      if (res.poruka == "ok") this.predmeti = res.podaci;
    })
    this.registracijaForm = this.fb.group({
      kime: ['', Validators.required],
      lozinka: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(10),
          Validators.pattern(this.lozinkaRegex)
        ]
      ],
      pitanje: ['',Validators.required ],
      odgovor: ['', Validators.required],
      ime: ['',Validators.required ],
      prezime: ['',Validators.required ],
      pol: ['',Validators.required ],
      adresa: ['',Validators.required ],
      telefon: ['',[
        Validators.required,
        Validators.pattern(this.telefonRegex)
      ] ],
      mejl: ['', [
        Validators.required,
        Validators.pattern(this.mejlRegex)
       ] ],
      profil: [null, [ fajlTipValidator(this.profilFajlTipovi) ], [fajlVisinaSirinaValidator(300, 300)]],
      tip: ['', Validators.required]
    });
    this.korak2UcenikForm = this.fb.group({
      skola: ['Osnovna', [Validators.required]],
      razred: [1, [Validators.required]]
    });
    this.korak2NastavnikForm = this.fb.group({
      predmeti: [[]],
      drugiPredmet: [''],
      uzrasti: [[]],
      saznao: [''],
      cv: [null, [Validators.required, fajlTipValidator(['pdf']), fajlVelicinaValidator(3*1024)]]
    });
  }

  greskaLozinka: string = ""
  greskaTelefon: string = ""
  greskaMejl: string = ""
  greskaProfil: string = ""

  greskaCV: string = ""

  greska: string = ""

  tip: string = ""

  alertUspeh:string = ""
  alertNeuspeh:string = ""

  promenaTipa() {
    let tip = this.registracijaForm.get('tip')?.value;
    this.tip = tip
  }

  registracija() {
    this.greskaLozinka = this.greskaTelefon = this.greskaMejl = this.greskaProfil = this.greskaCV = this.greska = this.alertNeuspeh = this.alertUspeh = "";
    //provera zajednickih polja
    const lozinka = this.registracijaForm.get('lozinka');
    if (lozinka?.hasError('minLength')) {
      this.greskaLozinka = 'Lozinka mora biti najmanje duzine 6 karaktera.';
    } else if (lozinka?.hasError('maxLength')) {
      this.greskaLozinka = 'Lozinka mora biti najvece duzine 10 karaktera.';
    } else if (lozinka?.hasError('pattern')) {
      this.greskaLozinka = Utils.lozinkaZahtevi();
    }

    const telefon = this.registracijaForm.get('telefon');
    if (telefon?.hasError('pattern')) {
      this.greskaTelefon = Utils.telefonZahtevi();
    }

    const mejl = this.registracijaForm.get('mejl');
    if (mejl?.hasError('pattern')) {
      this.greskaMejl = Utils.mejlZahtevi();
    }

    const profil = this.registracijaForm.get('profil');
    if (profil?.hasError('fajlTip')) {
      this.greskaProfil = 'Tip fajla mora biti jedan od seledecih ' + this.profilFajlTipovi.join(',') + ".";
    }
    else if (profil?.hasError('fajlVisinaSirina')) {
      this.greskaProfil = 'Fajl moze imati maksimalnu sirinu i visinu od 300 piksela.';
    }

    if (this.greskaLozinka + this.greskaMejl + this.greskaProfil + this.greskaTelefon == "" && this.registracijaForm.invalid) {
      this.greska = "Polja oznacena sa * su obavezna.";
    }

    if (this.registracijaForm.valid) {
      return true;
    }
    else return false;
  }

  registracijaUcenik() {
    if (this.registracija()) {
      if (this.korak2UcenikForm.invalid) {
        this.greska = "Sva polja oznacena sa * su obavezna!"
      }
      else {
        let skola = this.korak2UcenikForm.get('skola')?.value
        let razred = this.korak2UcenikForm.get('razred')?.value

        if (skola != "Osnovna" && razred > 4) {
          this.greska = "Razred za srednju skolu moze biti od 1 do 4."
        }
        else {
          //submit 
          let forma = new FormData();
          Utils.dodajUFormu(forma, this.registracijaForm.value)
          Utils.dodajUFormu(forma, this.korak2UcenikForm.value)

          this.servis.registracija(forma).subscribe((res: any) => {
            if (res.poruka == "ok") this.alertUspeh = "Registracija je uspela! Mozete da se ulogujete."
            else this.alertNeuspeh = res.poruka;
            Utils.skrolDoVrha();
          })
        }
      }
    }
  }

  registracijaNastavnik() {
    if (this.registracija()) {
      const cv = this.korak2NastavnikForm.get('cv')
      if (cv?.hasError('required')) {
        this.greskaCV = 'Biografija je obavezna.'
      }
      else if (cv?.hasError('fajlTip')) {
        this.greskaCV = 'Tip fajl mora biti pdf.'
      }
      else if (cv?.hasError('fajlVelicina')) {
        this.greskaCV = 'Velicina fajl je maksimalno 3MB.';
      }
      else {
        //submit data
        let forma = new FormData();
        Utils.dodajUFormu(forma, this.registracijaForm.value)

        let tmp = this.korak2NastavnikForm.value;
        //predmeti, uzrasti, saznao, cv
        forma.append('saznao', tmp.saznao);
        forma.append('cv', tmp['cv']);
        for (let predmet of tmp.predmeti) forma.append('predmeti', predmet);
        if (tmp.drugiPredmet != "") forma.append('predmeti', tmp.drugiPredmet);
        for (let uzrast of tmp.uzrasti) forma.append('uzrasti', uzrast);

        this.servis.registracija(forma).subscribe((res: any) => {
          if (res.poruka == "ok") this.alertUspeh = "Registracija je uspela! Admin mora da je odobri."
          else this.alertNeuspeh = res.poruka;
          Utils.skrolDoVrha();
        })
      }
    }
  }
}
