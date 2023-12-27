import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PrijavaService } from 'src/app/servisi/prijava.service';
import { Utils } from 'src/app/utils';

@Component({
  selector: 'app-promena-lozinke',
  templateUrl: './promena-lozinke.component.html',
  styleUrls: ['./promena-lozinke.component.css']
})
export class PromenaLozinkeComponent {
  promenaForm: FormGroup;

  constructor(private fb: FormBuilder, private servis: PrijavaService) {
    this.promenaForm = this.fb.group({
      kime: ['', Validators.required],
      stara: ['', [ Validators.required ] ],
      nova: ['', [ Validators.required, Validators.pattern(Utils.lozinkaRegex()) ] ],
      nova2: ['', [ Validators.required ] ],
    });
  }

  greska: string = ""
  alertUspeh: string = ""

  ngOnInit(): void {
  }

  promena() {
    this.greska = this.alertUspeh = ""
    if (this.promenaForm.get('nova')?.hasError('pattern')) {
      this.greska = Utils.lozinkaZahtevi();
    }
    else if (this.promenaForm.invalid) {
      this.greska = "Sva polja su obavezna."
    }
    else if (this.promenaForm.valid) {
      let data = this.promenaForm.value;
      if (data.nova != data.nova2) {
        this.greska = "Ponovljena lozinka nije ista.";
      }
      else {
        this.servis.promenaLozinke(data).subscribe((res:any) => {
          if (res.poruka != "ok") {
            this.greska = res.poruka;
          }
          else {
            this.alertUspeh = "Lozinka je uspesno promenjena!";
          }
        })
      }
    }
  }
}
