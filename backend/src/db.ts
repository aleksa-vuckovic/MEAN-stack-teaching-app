import mongoose from 'mongoose';
import korisnikModel from './modeli/Korisnik';
import podatakModel from './modeli/Podatak';
import { Utils } from './utils';

export class DB {
    static korisnikPoKime(kime: string): Promise<any> {
        return new Promise((resolve, reject) => {
            korisnikModel.findOne({kime: kime}).then(res => {
                resolve(res) //null ako ne postoji
            }).catch((err) => {
                resolve(null)
            })
        })   
    }

    static korisnikPoMejlu(mejl: String): Promise<any> {
        return new Promise((resolve, reject) => {
            korisnikModel.findOne({mejl: mejl}).then(res => {
                resolve(res) //null ako ne postoji
            }).catch((err) => {
                resolve(null)
            })
        })  
    }

    static dodajKorisnika(kor: any): Promise<string> {
        return new Promise((resolve, reject) => {
            korisnikModel.insertMany([kor]).then(res => {
                resolve("ok")
            }).catch(err => {
                resolve("Greska u bazi.")
            })
        })
    }

    static promeniLozinku(kime: string, nova: string): Promise<string> {
        return new Promise((resolve, reject) => {
            korisnikModel.updateOne({kime: kime}, {$set: {lozinka: nova}}).then(res => {
                if (res.modifiedCount > 0) resolve("ok")
                else resolve("Nije pronadjen korisnik.")
            }).catch(err => {
                resolve("Greska u bazi.")
            })
        })
    }

    static sviPredmeti(): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            podatakModel.findOne({podatak: "predmeti"}).then((res:any) => {
                resolve(res.vrednosti);
            }).catch(err => {
                resolve([])
            })
        })
    }

    /* Vraca {
        brojNastavnika: x
        brojUcenika: y
    }
    */
    static statistika(): Promise<any> {
        return new Promise((resolve, reject) => {
            korisnikModel.aggregate([
                {
                  $match: {
                    tip: 'Nastavnik', 
                    odobren: true, 
                    aktivan: true
                  }
                }, {
                  $count: 'broj'
                }
              ]).then((res: any) => {
                let brojNastavnika = res[0].broj;

                korisnikModel.aggregate([
                    {
                      $match: {
                        tip: 'Ucenik', 
                        odobren: true, 
                        aktivan: true
                      }
                    }, {
                      $count: 'broj'
                    }
                  ]).then((res: any) => {
                    let brojUcenika = res[0].broj;
                    resolve({
                        brojNastavnika: brojNastavnika,
                        brojUcenika: brojUcenika
                    })
                  }).catch(err => {resolve(null);})
              }).catch(err => { resolve(null); })
        })
    }

    static sviNastavnici(pretraga: any): Promise<Array<any>> {
        let upit: any = {}
        if (pretraga.ime && pretraga.ime != "") upit.ime = {$regex: new RegExp(pretraga.ime, 'i')}
        if (pretraga.prezime && pretraga.prezime != "") upit.prezime = {$regex: new RegExp(pretraga.prezime, 'i')}
        if (pretraga.predmet && pretraga.predmet != "") upit.predmet = {$regex: new RegExp(pretraga.predmet, 'i')}
        let sort: any = null
        if (pretraga.sort) {
            sort = {}
            sort[pretraga.sort] = pretraga.opadajuce ? -1 : 1;
        }
        let tmp: Array<any> = [
            {
              $match: {
                tip: 'Nastavnik', 
                odobren: true, 
                aktivan: true
              }
            }, {
              $unwind: {
                path: '$predmeti'
              }
            }, {
              $project: {
                ime: 1, 
                prezime: 1, 
                predmet: '$predmeti', 
                _id: 0
              }
            }, {
                $match: upit
            }
          ];
        if (sort) tmp.push({$sort: sort});
        console.log(tmp);
        return new Promise((resolve, reject) => {
            korisnikModel.aggregate(tmp).then(res => {
                resolve(res);
            }).catch(err => {
                resolve([]);
            })
        })
    }

    static azurirajProfil(kime: string, podaci: any): Promise<string> {
        podaci = {$set: podaci};
        return new Promise((resolve, reject) => {
            korisnikModel.updateOne({kime: kime}, podaci).then(res => {
                if (res.modifiedCount > 0) resolve("ok");
                else resolve("Korisnik nije pronadjen u bazi.")
            }).catch(err => {
                resolve("Greska u bazi.")
            })
        })
    }

    static ucenikProfilPodaci(kime: string): Promise<any> {
        //ime, prezime, skola, razred, mejl, adresa, telefon
        return new Promise((resolve, reject) => {
            this.korisnikPoKime(kime).then((res: any) => {
                console.log(res);
                if (res == null) resolve(null);
                else resolve({
                    ime: res.ime,
                    prezime: res.prezime,
                    skola: res.skola,
                    razred: res.razred,
                    mejl: res.mejl,
                    adresa: res.adresa,
                    telefon: res.telefon,
                    profil: Utils.slikaUrl(res.profil)
                })
            })
        })
    }
}