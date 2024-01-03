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
        if (ret.modifiedCount > 0) return "ok";
        else return "Korisnik nije pronadjen u bazi."
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
                $match: { $expr: {$or: [
                    {
                        $and: [{$gte: [od.broj(), "$nedostupnost.od"]}, {$lt: [od.broj(), "$nedostupnost.do"]}]
                    },
                    {
                        $and: [{$lte: [do_.broj(), "$nedostupnost.do"]}, {$gt: [do_.broj(), "$nedostupnost.od"]}]
                    }
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
            od: DatumVreme,
            do: DatumVreme
        }
    */
    static async nastavnikRadi(kime: string, od: DatumVreme, do_: DatumVreme): Promise<any> {
        if (!od.istiDan(do_)) {
            let ret: any = await this.nastavnikRadi(kime, od, od.krajDana())
            if (ret) return ret;
            ret = await this.nastavnikRadi(kime, do_.vreme(0), do_)
            return ret
        }
        else {
            let ret: any = await korisnikModel.findOne({kime: kime, tip: "Nastavnik", radnovreme: {$exists: true}})
            if (!ret) return null;
            let radnovreme = ret.radnovreme[od.danUNedelji()];
            if (od.sirovoVreme() >= radnovreme.od && do_.sirovoVreme() <= radnovreme.do) return null;
            else return {
                od: new DatumVreme(radnovreme.od),
                do: new DatumVreme(radnovreme.do)
            };
        }
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
            { nastavnik: kime, odbijen: null, otkazan: null, $expr: {$or: [
                    {
                        $and: [{$gte: [od.broj(), "$od"]}, {$lt: [od.broj(), "$do"]}]
                    },
                    {
                        $and: [{$lte: [do_.broj(), "$do"]}, {$gt: [do_.broj(), "$od"]}]
                    }
            ]}}
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
    static async nastavnikTerminStatus(kime: string, datum: DatumVreme, slot: number, detaljno: boolean) {
        let od = datum.dodajVreme(slot*30);
        let do_ = od.dodajVreme(30);

        let ret: any = await this.nastavnikImaCas(kime, od, do_)
        if (ret) {
            let slotOd = ret.od.slotOd();
            let slotDo = ret.do.slotDo();
            if (!ret.od.istiDan(ret.do)) slotDo += 24;
            let result = {
                status: (ret.potvrdjen ? 4 : 3),
                rb: slot -slotOd + 1,
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

    static async nastavnikTerminStatusZaDan(kime: string, dan: DatumVreme, detaljno: boolean): Promise<Array<any>> {
        let result: Array<any> = [];
        let complete = 0;
        dan = dan.vreme(0);
        for (let i = 0; i < 48; i++) result.push(await this.nastavnikTerminStatus(kime, dan, i, detaljno))
        return result;
    }

    static async zakazi(nastavnik: string, ucenik: string, od: DatumVreme, do_: DatumVreme, predmet: String, opis: String): Promise<string> {
        await casModel.insertMany([
            {
                ucenik: ucenik,
                nastavnik: nastavnik,
                od: od.broj(),
                do: do_.broj(),
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
        ])
        return ret
    }

    static async otkaziCas(nastavnik: string, datum: DatumVreme, obrazlozenje: string): Promise<string> {
        let ret = await casModel.updateOne({
            nastavnik: nastavnik,
            od: datum.broj(),
            potvrdjen: {$ne: null},
            odbijen: null,
            otkazan: null
        },
        {
            $set: {otkazan: DatumVreme.sada().broj(), komentarNastavnik: obrazlozenje}
        })
        if (ret.modifiedCount > 0) return "ok"
        else return "Cas ne postoji u bazi."
    }

    static async nastavnikZahtevi(nastavnik: string): Promise<Array<any>> {
        let ret = await casModel.aggregate([
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
        ])
        return ret
    }

    static async nastavnikOdgovor(nastavnik: string, od: DatumVreme, obrazlozenje: string|null): Promise<string> {
        let vreme = DatumVreme.sada().broj()
        let set: any = obrazlozenje ? {odbijen: vreme} : {potvrdjen: vreme}
        if (obrazlozenje) set.komentarNastavnik = obrazlozenje
        let ret = await casModel.updateOne({
            nastavnik: nastavnik,
            od: od.broj(),
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
        ])
        return ret
    }

    static async nastavnikRecenzija(nastavnik: string, od: DatumVreme, ocena: number, komentar: string): Promise<string> {
        let ret = await casModel.updateOne({
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
        });
        if (ret.modifiedCount > 0) return "ok"
        else return "Nije pronadjen cas."
    }

    static async cas(nastavnik: string, od: DatumVreme): Promise<any> {
        let ret = await casModel.findOne({
            nastavnik: nastavnik,
            od: od.broj(),
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
        ])
        return ret
    }

    static async ucenikRecenzija(nastavnik: string, od: DatumVreme, ocena: number, komentar: string): Promise<string> {
        let ret = await casModel.updateOne({
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
        });
        if (ret.modifiedCount > 0) return "ok"
        else return "Nije pronadjen cas."
    }

    static async dodajObavestenje(kime: string, sadrzaj: string): Promise<string> {
        await obavestenjeModel.insertMany([{
            kime: kime,
            datumvreme: DatumVreme.sada().broj(),
            sadrzaj: sadrzaj
        }])
        return "ok"
    }

    static async obavestenja(kime: string, od: DatumVreme, do_: DatumVreme): Promise<Array<any>> {
        let ret = await obavestenjeModel.aggregate([
            {
                $match: {
                    kime: kime,
                    datumvreme: {$lt: do_.broj()}
                }
            },
            {
                $project: {
                    _id: 0,
                    datumvreme: "$datumvreme",
                    sadrzaj: "$sadrzaj",
                    novo: { $gt: ["$datumvreme", od.broj()]}
                }
            },
            {
                $sort: {
                    datumvreme: -1
                }
            },
            {
                $limit: 2
            }
        ])
        if (ret.length == 0) return ret;
        let poslednji = ret[ret.length-1].datumvreme
        let presek = await obavestenjeModel.find({datumvreme: poslednji, kime: kime})
        while(ret.length > 0 && ret[ret.length-1].datumvreme == poslednji) ret.pop()
        ret.push(...presek)
        return ret
    }

    static async prijava(kime: string): Promise<string> {
        let ret = await korisnikModel.updateOne({
            kime: kime
        }, {
            $set: {
                prijava: DatumVreme.sada().broj()
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
                    do: {$lt: do_.broj()},
                    od: {$gt: od.broj()}
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
                    od: {$gte: od.broj(), $lte: do_.broj()}
                }
            },
            {
                $project: {
                    dan: {$mod: [{$add: [{$floor: {$divide: ["$od", Math.pow(2, DatumVreme.vremeShift)]}}, 3]}, 7]}
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
                    od: {$gte: od.broj(), $lte: do_.broj()}
                }
            },
            {
                $project: {
                    sat: {$floor: {$divide: [{$mod: ["$od", Math.pow(2, DatumVreme.vremeShift)]}, 60]}}
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
                    "casovi.od": {$gte: od.broj(), $lte: do_.broj()}
                }
            },
            {
              $project: {
                    kime: "$kime",
                    ime: "$ime",
                    prezime: "$prezime",
                    mesec: {$month: {
                        $dateAdd: {
                            startDate: new Date('2020-12-31'),
                            amount: {$floor:{$divide:["$casovi.od", 4096]}},
                            unit: 'day'
                        }
                    }}
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
}