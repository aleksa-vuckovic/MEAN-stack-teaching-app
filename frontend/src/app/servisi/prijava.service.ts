import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrijavaService {

  constructor(private http: HttpClient) {  }

  baseUrl = "http://localhost:4000/"

  registracija(korisnik: FormData) {
    const headers = new HttpHeaders({
      'enctype': 'multipart/form-data'
    });
    return this.http.post(this.baseUrl+"registracija", korisnik, {headers: headers});
  }

  prijava(podaci: any) {
    return this.http.post(this.baseUrl + "prijava", podaci);
  }
}
