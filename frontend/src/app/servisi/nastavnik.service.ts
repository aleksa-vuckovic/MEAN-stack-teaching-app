import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DatumVreme } from '../DatumVreme';

@Injectable({
  providedIn: 'root'
})
export class NastavnikService {

  constructor(private http: HttpClient) {  }

  url = "http://localhost:4000/nastavnik/";
  opcije = {
    withCredentials: true
  }
  opcijeMultipart = {
    withCredentials: true,
    headers: new HttpHeaders({
      'enctype': 'multipart/form-data'
    })
  }

  profilAzuriranje(podaci: FormData) {
    return this.http.post(this.url+"profilazuriranje", podaci, this.opcijeMultipart);
  }

  profilPodaci() {
    return this.http.get(this.url + "profilpodaci", this.opcije);
  }

  termini(datum: DatumVreme) {
    return this.http.post(this.url + "termini", {
      datum: datum.date
    }, this.opcije)
  }

  radnovreme() {
    return this.http.get(this.url + "radnovreme", this.opcije);
  }

  radnovremeAzuriranje(radnovreme: any) {
    return this.http.post(this.url + "radnovremeazuriranje", radnovreme, this.opcije)
  }

  nedostupnostAzuriranje(od: DatumVreme, do_: DatumVreme) {
    return this.http.post(this.url + "nedostupnostazuriranje", {
      od: od.date,
      do: do_.date
    }, this.opcije)
  }

  casovi(limit: number) {
    return this.http.get(this.url + "casovi?limit=" + limit, this.opcije);
  }

  otkazi(id: string, obrazlozenje: string) {
    return this.http.post(this.url + "otkazi", {
      id: id,
      obrazlozenje: obrazlozenje
    }, this.opcije)
  }

  zahtevi() {
    return this.http.get(this.url + "zahtevi", this.opcije)
  }

  potvrdi(id: string) {
    return this.http.post(this.url + "potvrdi", {
      id: id
    }, this.opcije)
  }
  odbij(id: string, obrazlozenje: string) {
    return this.http.post(this.url + "odbij", {
      id: id,
      obrazlozenje: obrazlozenje
    }, this.opcije)
  }

  ucenici() {
    return this.http.get(this.url + "ucenici", this.opcije)
  }

  dosije(ucenik: string) {
    return this.http.post(this.url + "dosije", {
      ucenik: ucenik
    }, this.opcije);
  }

  recenzija(id: string, ocena: number | null, komentar: string) {
    return this.http.post(this.url + "recenzija", {
      id: id,
      ocena: ocena,
      komentar: komentar
    }, this.opcije)
  }

  dosijeProfil(ucenik: string) {
    return this.http.post(this.url + "dosijeprofil", {
      ucenik: ucenik
    }, this.opcije)
  }
}
