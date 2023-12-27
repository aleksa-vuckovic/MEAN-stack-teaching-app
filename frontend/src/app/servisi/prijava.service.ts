import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrijavaService {

  constructor(private http: HttpClient) {  }

  url = "http://localhost:4000/"
  opcije = {
    withCredentials: true
  }
  opcijeMultipart = {
    withCredentials: true,
    headers: new HttpHeaders({
      'enctype': 'multipart/form-data'
    })
  }

  registracija(korisnik: FormData) {
    return this.http.post(this.url+"registracija", korisnik, this.opcijeMultipart);
  }

  prijava(podaci: any) {
    return this.http.post(this.url + "prijava", podaci, this.opcije
    );
  }

  promenaLozinke(podaci: any) {
    return this.http.post(this.url + "promenalozinke", podaci, this.opcije);
  }

  sigurnosnoPitanje(kime: string) {
    return this.http.get(this.url + "sigurnosnopitanje?kime=" + kime, this.opcije);
  }

  sigurnosniOdgovor(podaci: any) {
    return this.http.post(this.url + "sigurnosniodgovor", podaci, this.opcije);
  }

  zaboravljenaLozinka(podaci: any) {
    return this.http.post(this.url + "zaboravljenalozinka", podaci, this.opcije);
  }

  sviPredmeti() {
    return this.http.get(this.url + "svipredmeti", this.opcije);
  }

  statistika() {
    return this.http.get(this.url + "statistika", this.opcije);
  }

  sviNastavnici(pretraga: any) {
    return this.http.post(this.url + "svinastavnici", pretraga, this.opcije);
  }

  odjava() {
    return this.http.get(this.url + "odjava", this.opcije);
  }
}
