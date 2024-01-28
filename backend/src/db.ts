import mongoose from 'mongoose';
import korisnikModel from './modeli/Korisnik';
import podatakModel from './modeli/Podatak';
import casModel from "./modeli/Cas";
import obavestenjeModel from "./modeli/Obavestenje";
import { Utils } from './utils';
import { DatumVreme } from './DatumVreme';
import { ReturnDocument } from 'mongodb';



export class DB {
    static async korisnikPoKime(kime: string): Promise<any> {
        return await korisnikModel.findOne({kime: kime})
    }
    static async korisnikPoMejlu(mejl: String): Promise<any> {
        return await korisnikModel.findOne({mejl: mejl})
    }
    static async dodajKorisnika(kor: any): Promise<string> {
        await korisnikModel.insertMany([kor]);
        return "ok"
    }
    static async promeniLozinku(kime: string, nova: string): Promise<string> {
        let ret = await korisnikModel.updateOne({kime: kime}, {$set: {lozinka: nova}})
        if (ret.modifiedCount > 0) return "ok"
        else return "Greska u bazi."
    }

    static async sviPredmeti(): Promise<Array<string>> {
        let ret: any = await podatakModel.findOne({podatak: "predmeti"})
        return ret.vrednosti;
    }

    static async brojAktivnihNastavnika(): Promise<number> {
        let ret: Array<any> = await korisnikModel.aggregate([
            {
            $match: {
                tip: 'Nastavnik', 
                odobren: true, 
                aktivan: true
            }
            }, {
            $count: 'broj'
            }
        ])
        return ret[0].broj
    }
    static async brojAktivnihUcenika(): Promise<number> {
        let ret: Array<any> = await korisnikModel.aggregate([
            {
                $match: {
                tip: 'Ucenik', 
                odobren: true, 
                aktivan: true
                }
            }, {
                $count: 'broj'
            }
        ])
        return ret[0].broj;
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
        },
        {
            $addFields: {
                ocena: {
                    $cond: {
                        if: {$eq: ["$ocena", null]},
                        then: 0,
                        else: "$ocena"
                    }
                }
            }
        }
    ];
    static async nastavniciPretraga(pretraga: any, ocene: boolean = false, kime: boolean = false): Promise<Array<any>> {
        let upit: any = {}
        if (pretraga.ime && pretraga.ime != "") upit.ime = {$regex: new RegExp(pretraga.ime, 'i')}
        if (pretraga.prezime && pretraga.prezime != "") upit.prezime = {$regex: new RegExp(pretraga.prezime, 'i')}
        if (pretraga.predmet && pretraga.predmet != "") upit.predmeti = {$regex: new RegExp(pretraga.predmet, 'i')}
        if (pretraga.uzrast && pretraga.uzrast != "") upit.uzrasti = pretraga.uzrast;
        let sort: any = null
        if (pretraga.sort && pretraga.sort != "") {
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
        
        return await korisnikModel.aggregate(tmp);
    }

    static async azurirajProfil(kime: string, podaci: any): Promise<string> {
        podaci = {$set: podaci};
        let ret = await korisnikModel.updateOne({kime: kime}, podaci)
        return "ok"
    }

    static async ucenikPodaci(kime: string): Promise<any> {
        let ret = await this.korisnikPoKime(kime)
        if (ret == null) return null;
        else return {
            ime: ret.ime,
            prezime: ret.prezime,
            skola: ret.skola,
            razred: ret.razred,
            mejl: ret.mejl,
            adresa: ret.adresa,
            telefon: ret.telefon,
            profil: Utils.slikaUrl(ret.profil),
            aktivan: ret.aktivan
        }
    }

    static async nastavnikOcena(kime: string): Promise<number> {
        let ret = await casModel.aggregate([
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
        ])
        if (ret.length > 0) return ret[0].ocena;
        else return 0
    }
    static async nastavnikKomentari(kime: string): Promise<Array<any>> {
        let ret = await casModel.aggregate([
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
                    prezime: "$ostalo.prezime",
                    predmet: "$predmet",
                    datumvreme: "$od"
                }
            },
            {
                $sort: {
                    datumvreme: -1
                }
            }
        ])
        return ret
    }
    static async nastavnikPodaci(kime: string): Promise<any> {
        let ret = await korisnikModel.findOne({kime: kime, tip: "Nastavnik", odobren: true})
        if (!ret) return null;
        else return {
            ime: ret.ime,
            prezime: ret.prezime,
            mejl: ret.mejl,
            adresa: ret.adresa,
            telefon: ret.telefon,
            profil: Utils.slikaUrl(ret.profil as string),
            predmeti: ret.predmeti,
            uzrasti: ret.uzrasti,
            cv: Utils.slikaUrl(ret.cv as string),
            aktivan: ret.aktivan
        }
    }

    /*
    Ako postoji nedostupnost vraca je u obliku 
    {
        od: DatumVreme,
        do: DatumVreme
    }
    */
    static async nastavnikNedostupan(kime: string, od: DatumVreme, do_: DatumVreme): Promise<any> {
        let ret = await korisnikModel.aggregate([
            {
                $match: { kime: kime, tip: "Nastavnik", nedostupnost: {$exists: true} }
            },
            {
                $unwind: { path: "$nedostupnost" }
            },
            {
                $match: { $expr: {$and: [
                    {$gt: [do_.date, "$nedostupnost.od"]},
                    {$lt: [od.date, "$nedostupnost.do"]}
                ]}}
            }
        ])
        if (ret.length > 0) return {
            od: new DatumVreme(ret[0].nedostupnost.od),
            do: new DatumVreme(ret[0].nedostupnost.do)
        }
        else return null
    }
    /*
        Ako se interval ne preklapa sa radnim vremenom, vraca radno vreme za taj dan u obliku
        {
            od: vreme u milisekundama,
            do: vreme u milisekundama
        }
    */
    static async nastavnikRadi(kime: string, od: DatumVreme, do_: DatumVreme): Promise<any> {
        let ret: any = await korisnikModel.findOne({kime: kime, tip: "Nastavnik", radnovreme: {$exists: true}})
        if (!ret) return null
        let radnovreme = ret.radnovreme
        do_ = do_.neposrednoDo()
        while (!od.istiDan(do_)) {
            let sati = radnovreme[od.danUNedelji()]
            if (od.sirovoVreme() < sati.od || sati.do < 24*60*60*1000) return {
                od: sati.od,
                do: sati.do
            }
            od = od.dodajDan(1).pocetakDana()
        }
        let sati = radnovreme[od.danUNedelji()]
        if (od.sirovoVreme() < sati.od || do_.sirovoVreme() >= sati.do ) return {
            od: sati.od,
            do: sati.do
        }
        return null
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
    static async nastavnikImaCas(kime: string, od: DatumVreme, do_: DatumVreme) {
        let ret: any = await casModel.findOne(
            {
                nastavnik: kime,
                odbijen: null,
                otkazan: null,
                $expr: { $and: [
                    {$gt: [do_.date, "$od"]},
                    {$lt: [od.date, "$do"]}
                ]}
            }
        )
        if (ret) return {
            ucenik: ret.ucenik,
            od: new DatumVreme(ret.od),
            do: new DatumVreme(ret.do),
            predmet: ret.predmet,
            potvrdjen: ret.potvrdjen
        }
        else return null;
    }

    //provarava status termina koji pocinje u "od" i koji traje "trajanje" milisekundi
    static async nastavnikTerminStatus(kime: string, od: DatumVreme, trajanje: number, detaljno: boolean) {
        let do_ = od.dodajMili(trajanje);

        let ret: any = await this.nastavnikImaCas(kime, od, do_)
        if (ret) {
            let slotOd = Math.floor((ret.od.broj() - od.broj())/trajanje)
            let slotDo = Math.floor((ret.do.broj() - 1 - od.broj())/trajanje)
            let result = {
                status: (ret.potvrdjen ? 4 : 3),
                rb: -slotOd + 1,
                duzina: slotDo - slotOd + 1,
                tekst: ""
            };
            if (detaljno) {
                let ucenik = await DB.korisnikPoKime(ret.ucenik)
                result.tekst = `${ucenik.ime} ${ucenik.prezime} (${ret.predmet})`;
            }
            return result
        }
        
        if (od.proslost()) return {status: 5, rb: 1, duzina: 1, tekst: ""} //proslost
        
        ret = await this.nastavnikNedostupan(kime, od, do_)
        if (ret) return {
            status: 1, //Nedostupan
            rb: 1,
            duzina: 1,
            tekst: ""
        }

        ret = await this.nastavnikRadi(kime, od, do_)
        if (ret) return {
            status: 2,
            rb: 1,
            duzina: 1,
            tekst: ""
        }

        return {
            status: 0,
            rb: 1,
            duzina: 1,
            tekst: ""
        }
    }
    static async nastavnikTerminiStatus(kime: string, od: DatumVreme, trajanje: number, broj: number, detaljno: boolean): Promise<Array<any>> {
        let result: Array<any> = [];
        for (let i = 0; i < broj; i++) result.push(await this.nastavnikTerminStatus(kime, od.dodajMili(i*trajanje), trajanje, detaljno))
        return result;
    }
    static async zakazi(nastavnik: string, ucenik: string, od: DatumVreme, do_: DatumVreme, predmet: String, opis: String): Promise<string> {
        await casModel.insertMany([
            {
                ucenik: ucenik,
                nastavnik: nastavnik,
                od: od.date,
                do: do_.date,
                predmet: predmet,
                opis: opis
            }
        ])
        return "ok";
    }


    static async radnovreme(kime: string) : Promise<any> {
        let ret = await DB.korisnikPoKime(kime)
        if (!ret || ret.tip != "Nastavnik" || !ret.radnovreme) return null;
        else return ret.radnovreme;
    }
    static async azurirajRadnovreme(kime: string, radnovreme: any): Promise<string> {
        let ret = await korisnikModel.updateOne({kime: kime}, {$set: {radnovreme: radnovreme}})
        if (ret.modifiedCount > 0) return "ok"
        else return "Greska u bazi."
    }
    static async azurirajNedostupnost(kime: string, nedostupnost: any): Promise<string> {
        let ret = await korisnikModel.updateOne({kime: kime}, {$push: {nedostupnost: nedostupnost}})
        if (ret.modifiedCount > 0) return "ok"
        else return "Greska u bazi."
    }

    static async nastavnikCasovi(kime: string, limit: number): Promise<Array<any>> {
        let ret = await casModel.aggregate([
            {
                $match: {
                    nastavnik: kime,
                    do: {$gt: DatumVreme.sada().date},
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
                    _id: 1,
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
        ])
        return ret
    }

    static async otkaziCas(id:string, obrazlozenje: string): Promise<string> {
        let ret = await casModel.updateOne({
            _id: id,
            potvrdjen: {$ne: null},
            odbijen: null,
            otkazan: null
        },
        {
            $set: {otkazan: DatumVreme.sada().date, komentarNastavnik: obrazlozenje}
        })
        if (ret.modifiedCount > 0) return "ok"
        else return "Cas ne postoji u bazi."
    }

    static async nastavnikZahtevi(nastavnik: string): Promise<Array<any>> {
        let ret = await casModel.aggregate([
            {
                $match: {
                    nastavnik: nastavnik,
                    od: {$gt: DatumVreme.sada().date},
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
                    _id: 1,
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
        ])
        return ret
    }

    static async nastavnikOdgovor(id: string, obrazlozenje: string|null): Promise<string> {
        let vreme = DatumVreme.sada().date
        let set: any = obrazlozenje ? {odbijen: vreme} : {potvrdjen: vreme}
        if (obrazlozenje) set.komentarNastavnik = obrazlozenje
        let ret = await casModel.updateOne({
            _id: id,
            potvrdjen: null,
            odbijen: null,
            otkazan: null
        }, {
            $set: set
        })
        if (ret.modifiedCount > 0) return "ok"
        else return "Nije pronadjen cas."
    }

    static async nastavnikUcenici(nastavnik: string): Promise<Array<any>> {
        let ret = await casModel.aggregate([
            {
                $match: {
                    nastavnik: nastavnik,
                    potvrdjen: {$ne: null},
                    odbijen: null,
                    otkazan: null,
                    od: {$lt: DatumVreme.sada().date}
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
        ])
        return ret
    }

    static async nastavnikDosije(nastavnik: string, ucenik: string): Promise<Array<any>> {
        let ret = await casModel.aggregate([
            {
                $match: {
                    nastavnik: nastavnik,
                    ucenik: ucenik,
                    potvrdjen: {$ne: null},
                    odbijen: null,
                    otkazan: null,
                    do: {$lt: DatumVreme.sada().date}
                }
            },
            {
                $project: {
                    _id: 1,
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
        ])
        return ret
    }

    static async nastavnikRecenzija(id: string, ocena: number, komentar: string): Promise<string> {
        let ret = await casModel.updateOne({
            _id: id,
            potvrdjen: {$ne: null},
            odbijen: null,
            otkazan: null
        }, {
            $set: {
                ocenaNastavnik: ocena,
                komentarNastavnik: komentar
            }
        });
        if (ret.modifiedCount > 0) return "ok"
        else return "Nije pronadjen cas."
    }

    static async cas(id: string): Promise<any> {
        let ret = await casModel.findOne({
            _id: id,
            odbijen: null,
            otkazan: null
        });
        return ret
    }

    static async ucenikCasovi(kime: string): Promise<Array<any>> {
        let ret = await casModel.aggregate([
            {
                $match: {
                    ucenik: kime,
                    do: {$gt: DatumVreme.sada().date},
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
        ])
        return ret
    }

    static async ucenikArhiva(ucenik: string): Promise<Array<any>> {
        let ret = await casModel.aggregate([
            {
                $match: {
                    ucenik: ucenik,
                    potvrdjen: {$ne: null},
                    odbijen: null,
                    otkazan: null,
                    do: {$lt: DatumVreme.sada().date}
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
                    _id: 1,
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
        ])
        return ret
    }

    static async ucenikRecenzija(id: string, ocena: number, komentar: string): Promise<string> {
        let ret = await casModel.updateOne({
            _id: id,
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
        });
        if (ret.modifiedCount > 0) return "ok"
        else return "Nije pronadjen cas."
    }

    static async dodajObavestenje(kime: string, sadrzaj: string): Promise<string> {
        await obavestenjeModel.insertMany([{
            kime: kime,
            datumvreme: DatumVreme.sada().date,
            sadrzaj: sadrzaj
        }])
        return "ok"
    }

    static async obavestenja(kime: string, od: DatumVreme, do_: DatumVreme): Promise<Array<any>> {
        let ret = await obavestenjeModel.aggregate([
            {
                $match: {
                    kime: kime,
                    datumvreme: {$lt: do_.date}
                }
            },
            {
                $project: {
                    _id: 0,
                    datumvreme: "$datumvreme",
                    sadrzaj: "$sadrzaj",
                    novo: { $gt: ["$datumvreme", od.date]}
                }
            },
            {
                $sort: {
                    datumvreme: -1
                }
            },
            {
                $limit: 5
            }
        ])
        return ret
        /*
        if (ret.length == 0) return ret;
        let poslednji = ret[ret.length-1].datumvreme
        let presek = await obavestenjeModel.find({datumvreme: poslednji, kime: kime})
        while(ret.length > 0 && ret[ret.length-1].datumvreme == poslednji) ret.pop()
        ret.push(...presek)
        return ret
        */
    }

    static async prijava(kime: string): Promise<string> {
        let ret = await korisnikModel.updateOne({
            kime: kime
        }, {
            $set: {
                prijava: DatumVreme.sada().date
            }
        })
        if (ret.modifiedCount > 0) return "ok"
        else return "Greska u bazi."
    }

    static async brojOdrzanihCasova(dana: number): Promise<number> {
        let do_ = DatumVreme.sada()
        let od = do_.dodajDan(-dana)

        let ret = await casModel.aggregate([
            {
                $match: {
                    potvrdjen: {$ne: null},
                    odbijen: null,
                    otkazan: null,
                    do: {$lt: do_.date},
                    od: {$gt: od.date}
                }
            },
            {
                $count: "broj"
            }
        ])
        if (ret.length == 0) return 0
        return ret[0].broj
    }


    static async korisniciPretraga(pretraga: any): Promise<Array<any>> {
        let upit: any = {
            tip: {$in: ['Ucenik', 'Nastavnik']}, 
            odobren: true
        }
        if (pretraga.ime && pretraga.ime != "") upit.ime = {$regex: new RegExp(pretraga.ime, 'i')}
        if (pretraga.prezime && pretraga.prezime != "") upit.prezime = {$regex: new RegExp(pretraga.prezime, 'i')}
        if (pretraga.mejl && pretraga.mejl != "") upit.mejl = {$regex: new RegExp(pretraga.mejl, 'i')}
        let sort: any = null
        if (pretraga.sort && pretraga.sort != "") {
            sort = {}
            sort[pretraga.sort] = pretraga.opadajuce ? -1 : 1;
        }
        let projekcija: any = {
            tip: 1,
            kime: 1,
            ime: 1, 
            prezime: 1,
            mejl: 1,
            _id: 0
        }
        let tmp: Array<any> = [
            {
                $match: upit
            },
            {
                $project: projekcija
            }
        ];
        if (sort) tmp.push({$sort: sort});
        
        return await korisnikModel.aggregate(tmp);
    }

    static async korisnikAktivacija(kime: string, aktivan: boolean): Promise<string> {
        let ret = await korisnikModel.updateOne({kime: kime}, {$set: {aktivan: aktivan}})
        if (ret.modifiedCount > 0) return "ok"
        return "Greska u bazi."
    }

    static async zahteviZaRegistraciju(): Promise<Array<any>> {
        let ret = await korisnikModel.aggregate([
            {
                $match: {
                    tip: "Nastavnik",
                    odobren: false,
                    aktivan: true
                }
            },
            {
                $project: {
                    _id: 0,
                    kime: 1,
                    ime: 1,
                    prezime: 1,
                    pol: 1,
                    telefon: 1,
                    mejl: 1,
                    profil: {$concat: [Utils.slikaPrefiks(), "$profil"]},
                    predmeti: 1,
                    uzrasti: 1,
                    saznao: 1,
                    cv: {$concat: [Utils.slikaPrefiks(), "$cv"]}
                }
            }
        ])
        return ret;
    }

    static async odobrenje(kime: string, odobren: boolean): Promise<string> {
        let ret = await korisnikModel.updateOne({kime: kime}, {$set:{odobren: odobren}})
        if (ret.modifiedCount > 0) return "ok"
        else return "Greska u bazi."
    }

    static async predlozeniPredmeti(): Promise<Array<string>> {
        let predmeti = await DB.sviPredmeti()
        let ret = await korisnikModel.aggregate([
            {
                $unwind: { path: "$predmeti"}
            },
            {
                $group: {
                    _id: "$predmeti"
                }
            },
            {
                $match: {
                    _id: {$nin: predmeti}
                }
            }
        ])
        let result = []
        for (let elem of ret) result.push(elem._id)
        return result
    }

    static async dodajPredmet(predmet: string) {
        let predmeti = await DB.sviPredmeti()
        if (predmeti.indexOf(predmet) != -1) return "Predmet vec postoji u bazi."
        let ret = await podatakModel.updateOne({podatak: "predmeti"}, {$push: {vrednosti: predmet}})
        if (ret.modifiedCount > 0) return "ok"
        else return "Greska u bazi."
    }

    static async ukloniPredmet(predmet: string) {
        let ret = await podatakModel.updateOne({podatak: "predmeti"}, {$pull: {vrednosti: predmet}})
        if (ret.modifiedCount > 0) return "ok"
        else return "Greska u bazi."
    }


    //Statistika

    static async brojNastavnikaPoPredmetu(): Promise<Array<any>> {
        let ret = await korisnikModel.aggregate([
            {
                $match: {
                    tip: 'Nastavnik',
                    odobren: true,
                    aktivan: true
                }
            },
            {
                $unwind: { path: "$predmeti"}
            },
            {
                $group: {
                    _id: "$predmeti",
                    broj: {
                        $count: {}
                    }
                }
            },
            {
                $project: {
                    predmet: "$_id",
                    broj: 1
                }
            },
            {
                $sort: {
                    broj: -1
                }
            }
        ])
        return ret
    }

    static async brojNastavnikaPoUzrastu(): Promise<Array<any>> {
        let ret = await korisnikModel.aggregate([
            {
                $match: {
                    tip: 'Nastavnik',
                    odobren: true,
                    aktivan: true
                }
            },
            {
                $unwind: { path: "$uzrasti"}
            },
            {
                $group: {
                    _id: "$uzrasti",
                    broj: {
                        $count: {}
                    }
                }
            },
            {
                $project: {
                    uzrast: "$_id",
                    broj: 1
                }
            },
            {
                $sort: {
                    broj: -1
                }
            }
        ])
        return ret
    }

    static async brojKorisnikaPoPolu(): Promise<Array<any>> {
        let ret = await korisnikModel.aggregate([
            {
                $match: {
                    odobren: true,
                    aktivan: true
                }
            },
            {
                $group: {
                    _id: {
                        pol: "$pol",
                        tip: "$tip"
                    },
                    broj: {
                        $count: {}
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    pol: "$_id.pol",
                    tip: "$_id.tip",
                    broj: 1
                }
            }
        ])
        return ret;
    }

    static async brojCasovaPoDanuNedelje(od: DatumVreme, do_: DatumVreme): Promise<Array<any>> {
        let ret = await casModel.aggregate([
            {
                $match: {
                    potvrdjen: {$ne: null},
                    odbijen: null,
                    otkazan: null,
                    od: {$gte: od.date, $lte: do_.date}
                }
            },
            {
                $project: {
                    //dan: {$mod: [{$add: [{$floor: {$divide: ["$od", Math.pow(2, DatumVreme.vremeShift)]}}, 3]}, 7]}
                    dan: {$mod: [{$add: [{$dayOfWeek: "$od"}, 2]}, 7]}
                }
            },
            {
                $group: {
                    _id: "$dan",
                    broj: {
                        $count: {}
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    dan: "$_id",
                    broj: 1
                }
            },
            {
                $sort: {
                    dan: 1
                }
            }
        ])
        return ret
    }

    static async brojCasovaPoSatu(od: DatumVreme, do_: DatumVreme): Promise<Array<any>> {
        let ret = await casModel.aggregate([
            {
                $match: {
                    potvrdjen: {$ne: null},
                    odbijen: null,
                    otkazan: null,
                    od: {$gte: od.date, $lte: do_.date}
                }
            },
            {
                $project: {
                    //sat: {$floor: {$divide: [{$mod: ["$od", Math.pow(2, DatumVreme.vremeShift)]}, 60]}}
                    sat: {$hour: {date: "$od", timezone: "+01"}}
                }
            },
            {
                $group: {
                    _id: "$sat",
                    broj: {
                        $count: {}
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    sat: "$_id",
                    broj: 1
                }
            }
        ])
        return ret
    }

    static async angazovanjeNastavnikaPoMesecima(od: DatumVreme, do_: DatumVreme): Promise<Array<any>> {
        let ret = await korisnikModel.aggregate([
            {
                $match: {
                    tip: "Nastavnik",
                    odobren: true,
                    aktivan: true
                }
            },
            {
                $lookup: {
                    from: "casovi",
                    localField: "kime",
                    foreignField: "nastavnik",
                    as: "casovi"
                }
            },
            {
                $unwind: { path: "$casovi"}
            },
            {
                $match: {
                    "casovi.od": {$gte: od.date, $lte: do_.date},
                    "casovi.potvrdjen": {$ne: null},
                    "casovi.odbijen": null,
                    "casovi.otkazan":  null
                }
            },
            {
              $project: {
                    kime: "$kime",
                    ime: "$ime",
                    prezime: "$prezime",
                    mesec: {$month: "$casovi.od"}
                    /*
                    mesec: {$month: {
                        $dateAdd: {
                            startDate: new Date('2020-12-31'),
                            amount: {$floor:{$divide:["$casovi.od", 4096]}},
                            unit: 'day'
                        }
                    }}
                    */
                }
            },
            {
                $group: {
                    _id: {
                        kime: "$kime",
                        ime: "$ime",
                        prezime: "$prezime",
                        mesec: "$mesec"
                    },
                    broj: {$count: {}}
                }
            },
            {
                $group: {
                    _id: {
                        kime: "$_id.kime",
                        ime: "$_id.ime",
                        prezime: "$_id.prezime"
                    },
                    podaci: {
                        $push: {
                            mesec: "$_id.mesec",
                            broj: "$broj"
                        }
                    },
                    ukupno: {$sum: "$broj"}
                }
            },
            {
                $project: {
                    _id: 0,
                    ime: {$concat: ["$_id.ime", " ", "$_id.prezime"]},
                    podaci: "$podaci",
                    ukupno: "$ukupno"
                }
            },
            {
                $sort: {
                    ukupno: -1
                }
            },
            {
                $limit: 10
            }
        ])
        return ret
    }

    static async brojCasovaPoPredmetuIPolu(predmeti: Array<string>, pol: string, od: DatumVreme, do_: DatumVreme): Promise<number> {
        let ret = await casModel.aggregate([
            {
                $match: {
                    od: {$gte: od.date, $lte: do_.date},
                    potvrdjen: {$ne: null},
                    odbijen: null,
                    otkazan: null,
                    predmet: {$in: predmeti}
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
                $unwind: {path: "$ucenikPodaci"}
            },
            {
                $match: {
                    "ucenikPodaci.pol": pol
                }
            },
            {
                $count: "broj"
            }
        ])
        if (ret.length > 0) return ret[0].broj
        else return 0
    }

    /*
    static async fixDates(): Promise<string> {
        await obavestenjeModel.updateMany({
            datumvreme: {$ne: null}
        },
        [{
            $set: {
                datumvreme: {
                    $dateAdd: {
                        startDate: {
                            $dateAdd: {
                                startDate: new Date('2020-12-31T00:00+01:00'),
                                amount: {$floor:{$divide:["$datumvreme", 4096]}},
                                unit: 'day'
                            }
                        },
                        amount: {$mod: ["$datumvreme", 4096]},
                        unit: 'minute'
                    }
                }
            }
        }])
        return "ok"
    }*/


    static async nastavniciOtkazivanjeOdbijanje(): Promise<Array<any>> {
        return await korisnikModel.aggregate([
            {
                $match: {
                    tip: "Nastavnik",
                    aktivan: true,
                    odobren: true
                }
            },
            {
                $lookup: {
                    from: "casovi",
                    let: {kime: "$kime"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$nastavnik", "$$kime"]},
                                        {$lt: ["$do", new Date()]}
                                    ]
                                    
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                otkazano: {
                                    $sum: {
                                        $cond: {
                                            if: {$ne: ["$otkazan", null]},
                                            then: 1,
                                            else: 0
                                        }
                                    }
                                },
                                odbijeno: {
                                    $sum: {
                                        $cond: {
                                            if: {$ne: ["$odbijen", null]},
                                            then: 1,
                                            else: 0
                                        }
                                    }
                                },
                                odrzano: {
                                    $sum: {
                                        $cond: {
                                            if: {$and: [
                                                {$ne: ["$potvrdjen", null]},
                                                {$eq: ["$otkazan", null]}
                                            ]},
                                            then: 1,
                                            else: 0
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    as: "podaci"
                }
            },
            {
                $unwind: {path: "$podaci"}
            },
            {
                $project: {
                    kime: "$kime",
                    ime: "$ime",
                    prezime: "$prezime",
                    otkazano: "$podaci.otkazano",
                    odbijeno: "$podaci.odbijeno",
                    odrzano: "$podaci.odrzano",
                    procenat: {
                        $divide: ["$podaci.otkazano", {$add: ["$podaci.otkazano", "$podaci.odrzano"]}]
                    }
                }
            },
            {
                $sort: {
                    procenat: -1
                }
            },
            {
                $limit: 5
            }
        ])
    }

    static async nastavnikOtkazivanja(kime: string) {
        return await casModel.aggregate([
            {
                $match: {
                    nastavnik: kime,
                    otkazan: {$ne: null}
                }
            },
            {
                $project: {
                    x: "$otkazan",
                    y: {
                        $dateDiff: {
                            startDate: "$otkazan",
                            endDate: "$od",
                            unit: "minute"
                        }
                    }
                }
            },
            {
                $sort: {
                    x: 1
                }
            }
        ])
    }

    /*
    static async prepraviObavestenja(): Promise<string> {
        await obavestenjeModel.updateMany({

        },[
        {
            $addFields: {
                sadrzaj: {
                    $replaceAll: {
                        input : {
                            $replaceAll: {
                                input: "$sadrzaj",
                                find: " cas ",
                                replacement: " čas "
                            }
                        },
                        find: "obrazlozenje",
                        replacement: "obrazloženje"
                    } 
                }
            }
        }])
        return "ok"
    }
    */
}