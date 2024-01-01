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
    const headers = new HttpHeaders({
      'enctype': 'multipart/form-data'
    });
    return this.http.post(this.url+"profilazuriranje", podaci, this.opcijeMultipart);
  }

  profilPodaci() {
    return this.http.get(this.url + "profilpodaci", this.opcije);
  }

  termini(datum: DatumVreme) {
    return this.http.post(this.url + "termini", {
      datum: datum.broj()
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
      od: od.broj(),
      do: do_.broj()
    }, this.opcije)
  }

  casovi(limit: number) {
    return this.http.get(this.url + "casovi?limit=" + limit, this.opcije);
  }

  otkazi(od: DatumVreme, obrazlozenje: string) {
    return this.http.post(this.url + "otkazi", {
      od: od.broj(),
      obrazlozenje: obrazlozenje
    }, this.opcije)
  }

  zahtevi() {
    return this.http.get(this.url + "zahtevi", this.opcije)
  }

  potvrdi(od: DatumVreme) {
    return this.http.post(this.url + "potvrdi", {
      od: od.broj()
    }, this.opcije)
  }
  odbij(od: DatumVreme, obrazlozenje: string) {
    return this.http.post(this.url + "odbij", {
      od: od.broj(),
      obrazlozenje: obrazlozenje
    }, this.opcije)
  }
}
