import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fajlTipValidator, fajlVelicinaValidator, fajlVisinaSirinaValidator } from '../validators';

@Component({
  selector: 'registracija',
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.css']
})
export class RegistracijaComponent {

  registracijaForm: FormGroup;

  korak2UcenikForm: FormGroup;
  korak2NastavnikForm: FormGroup;

  profilFajlTipovi = ['png', 'jpg', 'jpeg'];
  predmeti = ["Matematika", "Fizika", "Hemija"];

  constructor(private fb: FormBuilder) {
    this.registracijaForm = this.fb.group({
      kime: ['', Validators.required],
      lozinka: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(10),
          Validators.pattern(/^(?=(.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z].{5,9}$/)
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
        Validators.pattern(/^\+381(\d){8,9}$/)
      ] ],
      mejl: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z\d]+(\.[a-zA-Z\d]+)*@[a-zA-Z\d]+(\.[a-zA-Z\d]+)*$/)
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
      cv: [null, [Validators.required, fajlTipValidator(['pdf'])], [fajlVelicinaValidator(3*1024)]]
    });
  }

  greskaLozinka: string = ""
  greskaTelefon: string = ""
  greskaMejl: string = ""
  greskaProfil: string = ""

  greskaCV: string = ""

  greska: string = ""

  tip: string = ""

  promenaTipa() {
    let tip = this.registracijaForm.get('tip')?.value;
    this.tip = tip
  }

  registracija() {
    this.greskaLozinka = this.greskaTelefon = this.greskaMejl = this.greskaProfil = this.greskaCV = this.greska = "";
    //provera zajednickih polja
    const lozinka = this.registracijaForm.get('lozinka');
    if (lozinka?.hasError('minLength')) {
      this.greskaLozinka = 'Lozinka mora biti najmanje duzine 6 karaktera.';
    } else if (lozinka?.hasError('maxLength')) {
      this.greskaLozinka = 'Lozinka mora biti najvece duzine 10 karaktera.';
    } else if (lozinka?.hasError('pattern')) {
      this.greskaLozinka = 'Lozinka mora imati: 1 veliko slovo, 3 mala slova, 1 specijalan karakter, 1 cifru i mora poceti slovom.'
    }

    const telefon = this.registracijaForm.get('telefon');
    if (telefon?.hasError('pattern')) {
      this.greskaTelefon = "Telefon mora biti u formatu +381xx xxx xxx(x)";
    }

    const mejl = this.registracijaForm.get('mejl');
    if (mejl?.hasError('pattern')) {
      this.greskaMejl = 'Mejl mora biti u standardnom formatu za mejl.';
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
    return false;
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
      }
    }
  }
}
