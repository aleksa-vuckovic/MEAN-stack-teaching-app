import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrijavaService } from 'src/app/servisi/prijava.service';

@Component({
  selector: 'app-prijava-administrator',
  templateUrl: './prijava-administrator.component.html',
  styleUrls: ['./prijava-administrator.component.css']
})
export class PrijavaAdministratorComponent {
  prijavaForm: FormGroup;

  constructor(private fb: FormBuilder, private servis: PrijavaService, private ruter: Router) {
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
    if (this.prijavaForm.invalid) {
      this.greska = "Sva polja su obavezna"
    }
    else if (this.prijavaForm.valid) {
      this.servis.prijava(this.prijavaForm.value).subscribe((res: any) => {
        if (res.poruka != "ok") this.greska = res.poruka;
        else {
          let data = res.podaci;
          if (data.tip == "Administrator") {
            //login admin
            localStorage.setItem("korisnik", JSON.stringify(data))
            this.ruter.navigate(["administratorKorisnici"])
          }
          else {
            this.greska = "Niste administrator."
          }
        }
      })
    }
  }
}
