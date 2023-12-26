import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'prijava',
  templateUrl: './prijava.component.html',
  styleUrls: ['./prijava.component.css']
})
export class PrijavaComponent implements OnInit {
  prijavaForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.prijavaForm = this.fb.group({
      kime: ['', Validators.required],
      lozinka: ['', [ Validators.required ] ]
    });
  }

  greskaKime: string = ""
  greskaLozinka: string = ""

  ngOnInit(): void {
  }

  prijava() {
    this.greskaKime = this.greskaLozinka = "";
    // Check individual controls for errors
    const kime = this.prijavaForm.get('kime');
    if (kime?.hasError('required')) {
      this.greskaKime = 'Korisnicko ime je obavezno.';
    }

    const lozinka = this.prijavaForm.get('lozinka');
    if (lozinka?.hasError('required')) {
      this.greskaLozinka = 'Lozinka je obavezna.';
    }

    if (this.prijavaForm.valid) {
      alert("Prijava ok");
    }
  }
}
