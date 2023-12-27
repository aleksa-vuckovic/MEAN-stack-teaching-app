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
    if (this.prijavaForm.invalid) {
      this.greska = "Sva polja su obavezna."
    }
    else if (this.prijavaForm.valid) {
      this.servis.prijava(this.prijavaForm.value).subscribe((res: any) => {
        if (res.poruka != "ok") this.greska = res.poruka;
        else {
          let data = res.podaci;
          if (data.tip == "Administrator") {
            //Pristup administratorima je sa druge putanje
            this.greska = "Administratori pristupaju sa posebne stranice."
            return;
          }
          localStorage.setItem("korisnik", JSON.stringify(data));
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
