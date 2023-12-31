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
}
