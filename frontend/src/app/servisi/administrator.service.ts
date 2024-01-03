import { HttpClient } from '@angular/common/http';
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

  korisniciPretraga(pretraga: any) {
    return this.http.post(this.url + "korisnicipretraga", pretraga, this.opcije)
  }

  nastavnikPodaci(kime: string) {
    return this.http.get(this.url + "nastavnikpodaci?kime=" + kime, this.opcije)
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
}
