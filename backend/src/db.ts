import mongoose from 'mongoose';
import korisnikModel from './modeli/Korisnik';
import podatakModel from './modeli/Podatak';
import casModel from "./modeli/Cas";
import { Utils } from './utils';
import { DatumVreme } from './DatumVreme';



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

    private static prosecnaOcenaPipeline = [
        {
            $lookup: {
              from: 'casovi', 
              localField: 'kime', 
              foreignField: 'nastavnik', 
              as: 'casovi'
            }
        },
        {
            $addFields: {
              ocena: {
                $avg: '$casovi.ocenaUcenik'
              }
            }
        }
        ];
    static nastavniciPretraga(pretraga: any, ocene: boolean = false, kime: boolean = false): Promise<Array<any>> {
        let upit: any = {}
        if (pretraga.ime && pretraga.ime != "") upit.ime = {$regex: new RegExp(pretraga.ime, 'i')}
        if (pretraga.prezime && pretraga.prezime != "") upit.prezime = {$regex: new RegExp(pretraga.prezime, 'i')}
        if (pretraga.predmet && pretraga.predmet != "") upit.predmeti = {$regex: new RegExp(pretraga.predmet, 'i')}
        if (pretraga.uzrast && pretraga.uzrast != "") upit.uzrasti = pretraga.uzrast;
        let sort: any = null
        if (pretraga.sort) {
            sort = {}
            sort[pretraga.sort] = pretraga.opadajuce ? -1 : 1;
        }
        let projekcija: any = {
            ime: 1, 
            prezime: 1, 
            predmet: '$predmeti', 
            _id: 0
        }
        if (ocene) projekcija.ocena = 1;
        if (kime) projekcija.kime = 1;
        let tmp: Array<any> = [
            {
                $match: {
                  tip: 'Nastavnik', 
                  odobren: true, 
                  aktivan: true
                }
            }
        ];
        if (ocene) tmp.push(...this.prosecnaOcenaPipeline);
        tmp.push({ $unwind: { path: '$predmeti' } });
        tmp.push({ $match: upit });
        tmp.push({ $project: projekcija });
        if (sort) tmp.push({$sort: sort});
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

    static nastavnikProfilPodaci(kime: string): Promise<any> {
        //ime, prezime, profil, mejl, telefon, predmeti, ocene i komentari
        return new Promise((resolve, reject) => { 
            korisnikModel.findOne({kime: kime}).then(res => {
                if (!res) resolve(null);
                else {
                    casModel.aggregate([
                        {
                            $match: {
                                nastavnik: kime,
                                ocenaUcenik: {$ne: null}
                            }
                        },
                        {
                            $lookup: {
                                from: "korisnici",
                                localField: "ucenik",
                                foreignField: "kime",
                                as: "ostalo"
                            }
                        },
                        {
                            $unwind: {path: "$ostalo"}
                        }
                        ,
                        {
                            $project: {
                                _id: 0,
                                ocena: "$ocenaUcenik",
                                komentar: "$komentarUcenik",
                                kime: "$ostalo.kime",
                                profil: {$concat: [Utils.slikaPrefiks(), "$ostalo.profil"]},
                                ime: "$ostalo.ime",
                                prezime: "$ostalo.prezime"
                            }
                        }
                    ]).then((res2: any) => {
                        if (!res2) resolve(null);
                        else resolve({
                            ime: res.ime,
                            prezime: res.prezime,
                            profil: Utils.slikaUrl(res.profil as string),
                            mejl: res.mejl,
                            telefon: res.telefon,
                            predmeti: res.predmeti,
                            komentari: res2
                        });
                    })
                }
            })
        })
    }


    /*
    Ako postoji nedostupnost vraca je u obliku 
    {
        od: DatumVreme,
        do: DatumVreme
    }
    */
    static nastavnikNedostupan(kime: string, od: DatumVreme, do_: DatumVreme): Promise<any> {
        return new Promise((resolve, reject) => {
            korisnikModel.aggregate([
                {
                    $match: { kime: kime, tip: "Nastavnik", nedostupnost: {$exists: true} }
                },
                {
                    $unwind: { path: "$nedostupnost" }
                },
                {
                    $match: { $expr: {$or: [
                        {
                            $and: [{$gte: [od.broj(), "$nedostupnost.od"]}, {$lt: [od.broj(), "$nedostupnost.do"]}]
                        },
                        {
                            $and: [{$lte: [do_.broj(), "$nedostupnost.do"]}, {$gt: [do_.broj(), "$nedostupnost.od"]}]
                        }
                    ]}}
                }
            ]).then((res: Array<any>) => {
                if (res.length > 0) resolve({
                    od: new DatumVreme(res[0].nedostupnost.od),
                    do: new DatumVreme(res[0].nedostupnost.do)
                })
                else resolve(null)
            })
        })
    }
    /*
        Ako se interval ne preklapa sa radnim vremenom, vraca radno vreme za taj dan u obliku
        {
            od: DatumVreme,
            do: DatumVreme
        }
    */
    static nastavnikRadi(kime: string, od: DatumVreme, do_: DatumVreme): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!od.istiDan(do_)) {
                this.nastavnikRadi(kime, od, od.krajDana()).then((res:any) => {
                    if (res) resolve(res);
                    else this.nastavnikRadi(kime, do_.vreme(0), do_).then((res: any) => {
                        if (res) resolve(res);
                        else resolve(null);
                    })
                })
            }
            else {
                korisnikModel.findOne({kime: kime, tip: "Nastavnik", radnovreme: {$exists: true}}).then((res: any) => {
                    if (!res) resolve(null);
                    else {
                        let radnovreme = res.radnovreme[od.danUNedelji()];
                        if (od.sirovoVreme() >= radnovreme.od && do_.sirovoVreme() <= radnovreme.do) resolve(null);
                        else resolve({
                            od: new DatumVreme(radnovreme.od),
                            do: new DatumVreme(radnovreme.do)
                        });
                    }
                })
            }
        })
    }

    /*
        Ako nastavnik ima neotkazan i neodbijen cas u zadatom intervalu, vraca objekat:
        {
            ucenik: string
            od: DatumVreme
            do: DatumVreme
            predmet: string
            potvrdjen: number
        }
    */
    static nastavnikImaCas(kime: string, od: DatumVreme, do_: DatumVreme) {
        return new Promise((resolve, reject) => {
            casModel.findOne(
                { nastavnik: kime, odbijen: null, otkazan: null, $expr: {$or: [
                        {
                            $and: [{$gte: [od.broj(), "$od"]}, {$lt: [od.broj(), "$do"]}]
                        },
                        {
                            $and: [{$lte: [do_.broj(), "$do"]}, {$gt: [do_.broj(), "$od"]}]
                        }
                ]}}
            ).then((res: any) => {
                if (res) resolve({
                    ucenik: res.ucenik,
                    od: new DatumVreme(res.od),
                    do: new DatumVreme(res.do),
                    predmet: res.predmet,
                    potvrdjen: res.potvrdjen
                })
                else resolve(null);
            })
        })
    }

    static nastavnikTerminStatus(kime: string, datum: DatumVreme, slot: number, detaljno: boolean) {
        let od = datum.dodajVreme(slot*30);
        let do_ = od.dodajVreme(30);

        return new Promise((resolve, reject) => {
            if (od.proslost()) resolve({status: 5, rb: 1, duzina: 1, tekst: ""})
            else this.nastavnikNedostupan(kime, od, do_).then((res: any) => {
                if (res) {
                    resolve({
                        status: 1, //Nedostupan
                        rb: 1,
                        duzina: 1,
                        tekst: ""
                    })
                }
                else {
                    this.nastavnikRadi(kime, od, do_).then((res: any) => {
                        if (res) {
                            resolve({
                                status: 2,
                                rb: 1,
                                duzina: 1,
                                tekst: ""
                            })
                        }
                        else {
                            this.nastavnikImaCas(kime, od, do_).then((res: any) => {
                                if (res) {
                                    let slotOd = res.od.slotOd();
                                    let slotDo = res.do.slotDo();
                                    if (!res.od.istiDan(res.do)) slotDo += 24;
                                    let ret = {
                                        status: (res.potvrdjen ? 4 : 3),
                                        rb: slot - slotOd + 1,
                                        duzina: slotDo - slotOd + 1,
                                        tekst: ""
                                    };
                                    if (detaljno) DB.korisnikPoKime(res.ucenik).then((res: any) => {
                                        ret.tekst = `${res.ime} ${res.prezime} (${res.predmet})`;
                                        resolve(ret);
                                    })
                                    else resolve(ret);
                                }
                                else {
                                    resolve({
                                        status: 0,
                                        rb: 1,
                                        duzina: 1,
                                        tekst: ""
                                    })
                                }
                            })
                        }
                    })
                }
            })
        })
    }

    static nastavnikTerminStatusZaDan(kime: string, dan: DatumVreme, detaljno: boolean): Promise<any> {
        let ret: Array<any> = Array(48);
        let complete = 0;
        dan = dan.vreme(0);
        return new Promise((resolve, reject) => {
            for (let i = 0; i < 48; i++) {
                this.nastavnikTerminStatus(kime, dan, i, detaljno).then((res: any) => {
                    ret[i] = res;
                    if (++complete == 48) resolve(ret);
                })
            } 
        })
    }

    static zakazi(nastavnik: string, ucenik: string, od: DatumVreme, do_: DatumVreme, predmet: String, opis: String): Promise<string> {
        return new Promise((resolve, reject) => {
            casModel.insertMany([
                {
                    ucenik: ucenik,
                    nastavnik: nastavnik,
                    od: od.broj(),
                    do: do_.broj(),
                    predmet: predmet,
                    opis: opis
                }
            ]).then(res => {
                resolve("ok");
            }).catch(err => {
                resolve("Greska u bazi.")
            })
        })
    }
}