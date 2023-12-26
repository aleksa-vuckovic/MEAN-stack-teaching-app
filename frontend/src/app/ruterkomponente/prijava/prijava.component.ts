import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrijavaService } from 'src/app/servisi/prijava.service';

@Component({
  selector: 'prijava',
  templateUrl: './prijava.component.html',
  styleUrls: ['./prijava.component.css']
})
export class PrijavaComponent implements OnInit {
  prijavaForm: FormGroup;

  constructor(private fb: FormBuilder, private servis: PrijavaService) {
    this.prijavaForm = this.fb.group({
      kime: ['', Validators.required],
      lozinka: ['', [ Validators.required ] ]
    });
  }

  greska: string = ""

  ngOnInit(): void {
  }

  prijava() {
    this.greska = ""
    const kime = this.prijavaForm.get('kime');
    if (kime?.hasError('required')) {
      this.greska = 'Unesi korisnicko ime pobogu.';
    }

    const lozinka = this.prijavaForm.get('lozinka');
    if (lozinka?.hasError('required')) {
      this.greska = 'Unesi lozinku.';
    }

    if (this.prijavaForm.valid) {
      this.servis.prijava(this.prijavaForm.value).subscribe((res: any) => {
        if (res.message != "ok") this.greska = res.message;
        else {
          let data = res.data;
          if (data.tip == "Administrator") {
            //Pristup administratorima je sa druge putanje
            this.greska = "Administratori pristupaj sa posebne stranice."
            return;
          }
          localStorage.setItem("korisnik", data);
          alert(JSON.stringify(data));
          if (data.tip == "Ucenik") {
            //login ucenik
          } else if (data.tip == "Nastavnik") {
            //login nastavnik
          }
        }
      })
    }
  }
}
