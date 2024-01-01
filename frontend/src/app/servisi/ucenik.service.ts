import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DatumVreme } from '../DatumVreme';

@Injectable({
  providedIn: 'root'
})
export class UcenikService {

  constructor(private http: HttpClient) {  }

  url = "http://localhost:4000/ucenik/";
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

  nastavniciPretraga(pretraga: any) {
    return this.http.post(this.url + "nastavnicipretraga", pretraga, this.opcije);
  }

  nastavnikProfilPodaci(kime: string) {
    return this.http.get(this.url + "nastavnikprofilpodaci?kime=" + kime, this.opcije);
  }

  nastavnikTermini(kime: string, datum: DatumVreme) {
    return this.http.post(this.url + "nastavniktermini", {
      nastavnik: kime,
      datum: datum.broj()
    }, this.opcije)
  }

  zakazi(podaci: any) {
    return this.http.post(this.url + "zakazi", podaci, this.opcije);
  } 

  casovi() {
    return this.http.get(this.url + "casovi", this.opcije)
  }
}

