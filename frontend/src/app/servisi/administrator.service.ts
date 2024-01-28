import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdministratorService {

  constructor(private http: HttpClient) {  }

  url = "http://localhost:4000/administrator/";
  opcije = {
    withCredentials: true
  }
  opcijeMultipart = {
    withCredentials: true,
    headers: new HttpHeaders({
      'enctype': 'multipart/form-data'
    })
  }

  korisniciPretraga(pretraga: any) {
    return this.http.post(this.url + "korisnicipretraga", pretraga, this.opcije)
  }

  nastavnikPodaci(kime: string) {
    return this.http.get(this.url + "nastavnikpodaci?kime=" + kime, this.opcije)
  }
  
  nastavnikAzuriranje(kime: string, podaci: FormData) {
    return this.http.post(this.url + "nastavnikazuriranje?kime=" + kime, podaci, this.opcijeMultipart)
  }

  aktivacija(kime: string) {
    return this.http.get(this.url + "aktivacija?kime=" + kime, this.opcije)
  }

  deaktivacija(kime: string) {
    return this.http.get(this.url + "deaktivacija?kime=" + kime, this.opcije)
  }

  ucenikPodaci(kime: string) {
    return this.http.get(this.url + "ucenikpodaci?kime=" + kime, this.opcije)
  }

  zahtevi() {
    return this.http.get(this.url + "zahtevi", this.opcije);
  }

  odobreno(kime: string) {
    return this.http.get(this.url + "odobreno?kime=" + kime, this.opcije)
  }

  predlozeniPredmeti() {
    return this.http.get(this.url + "predlozenipredmeti", this.opcije)
  }

  dodajPredmet(predmet: string) {
    return this.http.post(this.url + "dodajpredmet", {predmet: predmet}, this.opcije)
  }

  ukloniPredmet(predmet: string) {
    return this.http.post(this.url + "uklonipredmet", {predmet: predmet}, this.opcije)
  }

  //statistika
  brojNastavnikaPoPredmetu() {
    return this.http.get(this.url + "brojnastavnikapopredmetu", this.opcije)
  }

  brojNastavnikaPoUzrastu() {
    return this.http.get(this.url + "brojnastavnikapouzrastu", this.opcije)
  }

  brojKorisnikaPoPolu() {
    return this.http.get(this.url + "brojkorisnikapopolu", this.opcije)
  }

  brojCasovaPoDanuNedelje() {
    return this.http.get(this.url + "brojcasovapodanunedelje", this.opcije)
  }

  brojCasovaPoSatu() {
    return this.http.get(this.url + "brojcasovaposatu", this.opcije)
  }

  angazovanjeNastavnika() {
    return this.http.get(this.url + "angazovanjenastavnika", this.opcije)
  }

  brojCasovaPoPredmetuPoPolu() {
    return this.http.get(this.url + "brojcasovapopredmetupopolu", this.opcije)
  }

  nastavniciOtkazivanjaOdbijanja() {
    return this.http.get(this.url + "nastavniciotkazivanjaodbijanja", this.opcije)
  }

  nastavnikOtkazivanja(kime: string) {
    return this.http.get(this.url + "nastavnikotkazivanja?kime=" + kime, this.opcije)
  }
}
