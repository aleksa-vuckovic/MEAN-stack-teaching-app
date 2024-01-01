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

    static brojAktivnihNastavnika(): Promise<number> {
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
            ]).then((res: Array<any>) => {
                resolve(res[0].broj);
            })
        })
    }
    static brojAktivnihUcenika(): Promise<number> {
        return new Promise((resolve, reject) => {
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
            ]).then((res: Array<any>) => {
                resolve(res[0].broj);
            })
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

    static ucenikPodaci(kime: string): Promise<any> {
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

    static nastavnikOcena(kime: string): Promise<number> {
        return new Promise((resolve, reject) => {
            casModel.aggregate([
                {
                    $match: {
                        nastavnik: kime,
                        ocenaUcenik: {$ne: null}
                    }
                },
                {
                    $group: {
                        _id: null,
                        ocena: {
                            $avg: "$ocenaUcenik"
                        }
                    }
                }
            ]).then((res: Array<any>) => {
                if (res.length > 0) resolve(res[0].ocena);
                else resolve(0);
            })
        })
    }
    static nastavnikKomentari(kime: string): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
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
            ]).then((res:Array<any>) => {
                resolve(res);
            })
        })
    }
    static nastavnikPodaci(kime: string): Promise<any> {
        return new Promise((resolve, reject) => {
            korisnikModel.findOne({kime: kime, tip: "Nastavnik"}).then((res: any) => {
                if (!res) resolve(null);
                else resolve({
                    ime: res.ime,
                    prezime: res.prezime,
                    mejl: res.mejl,
                    adresa: res.adresa,
                    telefon: res.telefon,
                    profil: Utils.slikaUrl(res.profil as string),
                    predmeti: res.predmeti,
                    uzrasti: res.uzrasti,
                    cv: Utils.slikaUrl(res.cv as string)
                })
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
                    if (detaljno) DB.korisnikPoKime(res.ucenik).then((ucenik: any) => {
                        ret.tekst = `${ucenik.ime} ${ucenik.prezime} (${res.predmet})`;
                        resolve(ret);
                    })
                    else resolve(ret);
                }
                else if (od.proslost()) resolve({status: 5, rb: 1, duzina: 1, tekst: ""}) //proslost
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


    static radnovreme(kime: string) : Promise<any> {
        return new Promise((resolve, reject) => {
            DB.korisnikPoKime(kime).then((res: any) => {
                if (!res || res.tip != "Nastavnik" || !res.radnovreme) resolve(null);
                else resolve(res.radnovreme);
            })
        })
    }
    static azurirajRadnovreme(kime: string, radnovreme: any): Promise<string> {
        return new Promise((resolve, reject) => {
            korisnikModel.updateOne({kime: kime}, {$set: {radnovreme: radnovreme}}).then(res => {
                if (res.modifiedCount > 0) resolve("ok")
                else resolve("Greska u bazi.")
            })
        })
    }
    static azurirajNedostupnost(kime: string, nedostupnost: any): Promise<string> {
        return new Promise((resolve, reject) => {
            korisnikModel.updateOne({kime: kime}, {$push: {nedostupnost: nedostupnost}}).then(res => {
                if (res.modifiedCount > 0) resolve("ok")
                else resolve("Greska u bazi.")
            })
        })
    }

    static nastavnikCasovi(kime: string, limit: number): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            casModel.aggregate([
                {
                    $match: {
                        nastavnik: kime,
                        do: {$gt: DatumVreme.sada().broj()},
                        potvrdjen: {$ne: null},
                        odbijen: null,
                        otkazan: null
                    }
                },
                {
                    $lookup: {
                        from: "korisnici",
                        localField: "ucenik",
                        foreignField: "kime",
                        as: "ucenikPodaci"
                    }
                }, {
                    $unwind: {
                        path: "$ucenikPodaci"
                    }
                },
                {
                    $limit: limit
                },
                {
                    $project: {
                        _id: 0,
                        od: "$od",
                        do: "$do",
                        predmet: "$predmet",
                        ime: "$ucenikPodaci.ime",
                        prezime: "$ucenikPodaci.prezime",
                    }
                },
                {
                    $sort: {
                        od: 1
                    }
                }
            ]).then((res: Array<any>) => {
                resolve(res)
            })
        })
    }

    static otkaziCas(nastavnik: string, datum: DatumVreme, obrazlozenje: string): Promise<string> {
        return new Promise((resolve, reject) => {
            casModel.updateOne({
                nastavnik: nastavnik,
                od: datum.broj(),
                potvrdjen: {$ne: null},
                odbijen: null,
                otkazan: null
            },
            {
                $set: {otkazan: DatumVreme.sada().broj(), komentarNastavnik: obrazlozenje}
            }).then(res => {
                if (res.modifiedCount > 0) resolve("ok")
                else resolve("Cas ne postoji u bazi.")
            })
        })
    }

    static nastavnikZahtevi(nastavnik: string): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            casModel.aggregate([
                {
                    $match: {
                        nastavnik: nastavnik,
                        od: {$gt: DatumVreme.sada().broj()},
                        potvrdjen: {$eq: null},
                        odbijen: null,
                        otkazan: null
                    }
                },
                {
                    $lookup: {
                        from: "korisnici",
                        localField: "ucenik",
                        foreignField: "kime",
                        as: "ucenikPodaci"
                    }
                },
                {
                    $unwind: {
                        path: "$ucenikPodaci"
                    }
                },
                {
                    $lookup: {
                        from: "casovi",
                        localField: "ucenik",
                        foreignField: "ucenik",
                        as: "ucenikOcene"
                    }
                },
                {
                    $project: {
                        od: "$od",
                        do: "$do",
                        predmet: "$predmet",
                        ime: "$ucenikPodaci.ime",
                        prezime: "$ucenikPodaci.prezime",
                        opis: "$opis",
                        ocena: {
                            $avg: "$ucenikOcene.ocenaNastavnik"
                        },
                        brojOcena: {
                            $size: {
                                $filter: {
                                    input: "$ucenikOcene.ocenaNastavnik",
                                    as: "ucenikOcena",
                                    cond: {$ne: ["$$ucenikOcena", null]}
                                }
                            }
                        }
                    }
                }
            ]).then((res: Array<any>) => {
                resolve(res)
            })
        })
    }

    static nastavnikOdgovor(nastavnik: string, od: DatumVreme, obrazlozenje: string|null): Promise<string> {
        let vreme = DatumVreme.sada().broj()
        let set: any = obrazlozenje ? {odbijen: vreme} : {potvrdjen: vreme}
        if (obrazlozenje) set.komentarNastavnik = obrazlozenje
        return new Promise((resolve, reject) => {
            casModel.updateOne({
                nastavnik: nastavnik,
                od: od.broj(),
                potvrdjen: null,
                odbijen: null,
                otkazan: null
            }, {
                $set: set
            }).then(res => {
                if (res.modifiedCount > 0) resolve("ok")
                else resolve("Nije pronadjen cas.")
            })
        })
    }

    static nastavnikUcenici(nastavnik: string): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            casModel.aggregate([
                {
                    $match: {
                        nastavnik: nastavnik,
                        potvrdjen: {$ne: null},
                        odbijen: null,
                        otkazan: null,
                        od: {$lt: DatumVreme.sada().broj()}
                    }
                },
                {
                    $group: {
                        _id: {
                            ucenik: "$ucenik"
                        }
                    }
                },
                {
                    $lookup: {
                        from: "korisnici",
                        localField: "_id.ucenik",
                        foreignField: "kime",
                        as: "podaci"
                    }
                },
                {
                    $unwind: {
                        path: "$podaci"
                    }
                },
                {
                    $project: {
                        kime: "$podaci.kime",
                        ime: "$podaci.ime",
                        prezime: "$podaci.prezime"
                    }
                }
            ]).then((res: Array<any>) => {
                resolve(res)
            }) 
        })
    }

    static nastavnikDosije(nastavnik: string, ucenik: string): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            casModel.aggregate([
                {
                    $match: {
                        nastavnik: nastavnik,
                        ucenik: ucenik,
                        potvrdjen: {$ne: null},
                        odbijen: null,
                        otkazan: null,
                        do: {$lt: DatumVreme.sada().broj()}
                    }
                },
                {
                    $project: {
                        _id: 0,
                        predmet: "$predmet",
                        od: "$od",
                        do: "$do",
                        ocena: "$ocenaNastavnik",
                        komentar: "$komentarNastavnik"
                    }
                },
                {
                    $sort: {
                        od: -1
                    }
                }
            ]).then((res: Array<any>) => {
                resolve(res)
            })
        })
    }

    static nastavnikRecenzija(nastavnik: string, od: DatumVreme, ocena: number, komentar: string): Promise<string> {
        return new Promise((resolve, reject) => {
            casModel.updateOne({
                nastavnik: nastavnik,
                od: od.broj(),
                potvrdjen: {$ne: null},
                odbijen: null,
                otkazan: null,
                ocenaNastavnik: null,
                komentarNastavnik: null
            }, {
                $set: {
                    ocenaNastavnik: ocena,
                    komentarNastavnik: komentar
                }
            }).then(res => {
                if (res.modifiedCount > 0) resolve("ok")
                else resolve("Nije pronadjen cas.")
            })
        })
    }

    static cas(nastavnik: string, od: DatumVreme): Promise<any> {
        return new Promise((resolve, reject) => {
            casModel.findOne({
                nastavnik: nastavnik,
                od: od.broj(),
                odbijen: null,
                otkazan: null
            }).then(res => resolve(res))
        })
    }

    static ucenikCasovi(kime: string): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            casModel.aggregate([
                {
                    $match: {
                        ucenik: kime,
                        do: {$gt: DatumVreme.sada().broj()},
                        potvrdjen: {$ne: null},
                        odbijen: null,
                        otkazan: null
                    }
                },
                {
                    $lookup: {
                        from: "korisnici",
                        localField: "nastavnik",
                        foreignField: "kime",
                        as: "nastavnikPodaci"
                    }
                }, {
                    $unwind: {
                        path: "$nastavnikPodaci"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        nastavnik: "$nastavnik",
                        od: "$od",
                        do: "$do",
                        predmet: "$predmet",
                        opis: "$opis",
                        ime: "$nastavnikPodaci.ime",
                        prezime: "$nastavnikPodaci.prezime",
                    }
                },
                {
                    $sort: {
                        od: 1
                    }
                }
            ]).then((res: Array<any>) => {
                resolve(res)
            })
        })
    }

    static ucenikArhiva(ucenik: string): Promise<Array<any>> {
        return new Promise((resolve, reject) => {
            casModel.aggregate([
                {
                    $match: {
                        ucenik: ucenik,
                        potvrdjen: {$ne: null},
                        odbijen: null,
                        otkazan: null,
                        do: {$lt: DatumVreme.sada().broj()}
                    }
                },
                {
                    $lookup: {
                        from: "korisnici",
                        localField: "nastavnik",
                        foreignField: "kime",
                        as: "nastavnikPodaci"
                    }
                },
                {
                    $unwind: {
                        path: "$nastavnikPodaci"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        nastavnik: "$nastavnik",
                        od: "$od",
                        do: "$do",
                        predmet: "$predmet",
                        ime: "$nastavnikPodaci.ime",
                        prezime: "$nastavnikPodaci.prezime",
                        komentar: "$komentarNastavnik",
                        ocenjen: {$or: [{$ne:["$ocenaUcenik", null]}, {$ne:["$komentarUcenik", null]}]}
                    }
                },
                {
                    $sort: {
                        od: -1
                    }
                }
            ]).then((res: Array<any>) => {
                resolve(res)
            })
        })
    }

    static ucenikRecenzija(nastavnik: string, od: DatumVreme, ocena: number, komentar: string): Promise<string> {
        return new Promise((resolve, reject) => {
            casModel.updateOne({
                nastavnik: nastavnik,
                od: od.broj(),
                potvrdjen: {$ne: null},
                odbijen: null,
                otkazan: null,
                ocenaUcenik: null,
                komentarUcenik: null
            }, {
                $set: {
                    ocenaUcenik: ocena,
                    komentarUcenik: komentar
                }
            }).then(res => {
                if (res.modifiedCount > 0) resolve("ok")
                else resolve("Nije pronadjen cas.")
            })
        })
    }
}