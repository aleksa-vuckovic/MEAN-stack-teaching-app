import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NastavnikService {

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
}
