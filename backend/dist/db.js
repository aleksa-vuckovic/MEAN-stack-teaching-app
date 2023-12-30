"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const Korisnik_1 = __importDefault(require("./modeli/Korisnik"));
const Podatak_1 = __importDefault(require("./modeli/Podatak"));
const Cas_1 = __importDefault(require("./modeli/Cas"));
const utils_1 = require("./utils");
const DatumVreme_1 = require("./DatumVreme");
class DB {
    static korisnikPoKime(kime) {
        return new Promise((resolve, reject) => {
            Korisnik_1.default.findOne({ kime: kime }).then(res => {
                resolve(res); //null ako ne postoji
            }).catch((err) => {
                resolve(null);
            });
        });
    }
    static korisnikPoMejlu(mejl) {
        return new Promise((resolve, reject) => {
            Korisnik_1.default.findOne({ mejl: mejl }).then(res => {
                resolve(res); //null ako ne postoji
            }).catch((err) => {
                resolve(null);
            });
        });
    }
    static dodajKorisnika(kor) {
        return new Promise((resolve, reject) => {
            Korisnik_1.default.insertMany([kor]).then(res => {
                resolve("ok");
            }).catch(err => {
                resolve("Greska u bazi.");
            });
        });
    }
    static promeniLozinku(kime, nova) {
        return new Promise((resolve, reject) => {
            Korisnik_1.default.updateOne({ kime: kime }, { $set: { lozinka: nova } }).then(res => {
                if (res.modifiedCount > 0)
                    resolve("ok");
                else
                    resolve("Nije pronadjen korisnik.");
            }).catch(err => {
                resolve("Greska u bazi.");
            });
        });
    }
    static sviPredmeti() {
        return new Promise((resolve, reject) => {
            Podatak_1.default.findOne({ podatak: "predmeti" }).then((res) => {
                resolve(res.vrednosti);
            }).catch(err => {
                resolve([]);
            });
        });
    }
    /* Vraca {
        brojNastavnika: x
        brojUcenika: y
    }
    */
    static statistika() {
        return new Promise((resolve, reject) => {
            Korisnik_1.default.aggregate([
                {
                    $match: {
                        tip: 'Nastavnik',
                        odobren: true,
                        aktivan: true
                    }
                }, {
                    $count: 'broj'
                }
            ]).then((res) => {
                let brojNastavnika = res[0].broj;
                Korisnik_1.default.aggregate([
                    {
                        $match: {
                            tip: 'Ucenik',
                            odobren: true,
                            aktivan: true
                        }
                    }, {
                        $count: 'broj'
                    }
                ]).then((res) => {
                    let brojUcenika = res[0].broj;
                    resolve({
                        brojNastavnika: brojNastavnika,
                        brojUcenika: brojUcenika
                    });
                }).catch(err => { resolve(null); });
            }).catch(err => { resolve(null); });
        });
    }
    static nastavniciPretraga(pretraga, ocene = false, kime = false) {
        let upit = {};
        if (pretraga.ime && pretraga.ime != "")
            upit.ime = { $regex: new RegExp(pretraga.ime, 'i') };
        if (pretraga.prezime && pretraga.prezime != "")
            upit.prezime = { $regex: new RegExp(pretraga.prezime, 'i') };
        if (pretraga.predmet && pretraga.predmet != "")
            upit.predmeti = { $regex: new RegExp(pretraga.predmet, 'i') };
        if (pretraga.uzrast && pretraga.uzrast != "")
            upit.uzrasti = pretraga.uzrast;
        let sort = null;
        if (pretraga.sort) {
            sort = {};
            sort[pretraga.sort] = pretraga.opadajuce ? -1 : 1;
        }
        let projekcija = {
            ime: 1,
            prezime: 1,
            predmet: '$predmeti',
            _id: 0
        };
        if (ocene)
            projekcija.ocena = 1;
        if (kime)
            projekcija.kime = 1;
        let tmp = [
            {
                $match: {
                    tip: 'Nastavnik',
                    odobren: true,
                    aktivan: true
                }
            }
        ];
        if (ocene)
            tmp.push(...this.prosecnaOcenaPipeline);
        tmp.push({ $unwind: { path: '$predmeti' } });
        tmp.push({ $match: upit });
        tmp.push({ $project: projekcija });
        if (sort)
            tmp.push({ $sort: sort });
        return new Promise((resolve, reject) => {
            Korisnik_1.default.aggregate(tmp).then(res => {
                resolve(res);
            }).catch(err => {
                resolve([]);
            });
        });
    }
    static azurirajProfil(kime, podaci) {
        podaci = { $set: podaci };
        return new Promise((resolve, reject) => {
            Korisnik_1.default.updateOne({ kime: kime }, podaci).then(res => {
                if (res.modifiedCount > 0)
                    resolve("ok");
                else
                    resolve("Korisnik nije pronadjen u bazi.");
            }).catch(err => {
                resolve("Greska u bazi.");
            });
        });
    }
    static ucenikProfilPodaci(kime) {
        //ime, prezime, skola, razred, mejl, adresa, telefon
        return new Promise((resolve, reject) => {
            this.korisnikPoKime(kime).then((res) => {
                if (res == null)
                    resolve(null);
                else
                    resolve({
                        ime: res.ime,
                        prezime: res.prezime,
                        skola: res.skola,
                        razred: res.razred,
                        mejl: res.mejl,
                        adresa: res.adresa,
                        telefon: res.telefon,
                        profil: utils_1.Utils.slikaUrl(res.profil)
                    });
            });
        });
    }
    static nastavnikProfilPodaci(kime) {
        //ime, prezime, profil, mejl, telefon, predmeti, ocene i komentari
        return new Promise((resolve, reject) => {
            Korisnik_1.default.findOne({ kime: kime }).then(res => {
                if (!res)
                    resolve(null);
                else {
                    Cas_1.default.aggregate([
                        {
                            $match: {
                                nastavnik: kime,
                                ocenaUcenik: { $ne: null }
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
                            $unwind: { path: "$ostalo" }
                        },
                        {
                            $project: {
                                _id: 0,
                                ocena: "$ocenaUcenik",
                                komentar: "$komentarUcenik",
                                kime: "$ostalo.kime",
                                profil: { $concat: [utils_1.Utils.slikaPrefiks(), "$ostalo.profil"] },
                                ime: "$ostalo.ime",
                                prezime: "$ostalo.prezime"
                            }
                        }
                    ]).then((res2) => {
                        if (!res2)
                            resolve(null);
                        else
                            Cas_1.default.aggregate([
                                {
                                    $match: {
                                        nastavnik: kime,
                                        ocenaUcenik: { $ne: null }
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
                            ]).then((res3) => {
                                resolve({
                                    ime: res.ime,
                                    prezime: res.prezime,
                                    profil: utils_1.Utils.slikaUrl(res.profil),
                                    mejl: res.mejl,
                                    telefon: res.telefon,
                                    predmeti: res.predmeti,
                                    ocena: res3[0].ocena,
                                    komentari: res2
                                });
                            });
                    });
                }
            });
        });
    }
    /*
    Ako postoji nedostupnost vraca je u obliku
    {
        od: DatumVreme,
        do: DatumVreme
    }
    */
    static nastavnikNedostupan(kime, od, do_) {
        return new Promise((resolve, reject) => {
            Korisnik_1.default.aggregate([
                {
                    $match: { kime: kime, tip: "Nastavnik", nedostupnost: { $exists: true } }
                },
                {
                    $unwind: { path: "$nedostupnost" }
                },
                {
                    $match: { $expr: { $or: [
                                {
                                    $and: [{ $gte: [od.broj(), "$nedostupnost.od"] }, { $lt: [od.broj(), "$nedostupnost.do"] }]
                                },
                                {
                                    $and: [{ $lte: [do_.broj(), "$nedostupnost.do"] }, { $gt: [do_.broj(), "$nedostupnost.od"] }]
                                }
                            ] } }
                }
            ]).then((res) => {
                if (res.length > 0)
                    resolve({
                        od: new DatumVreme_1.DatumVreme(res[0].nedostupnost.od),
                        do: new DatumVreme_1.DatumVreme(res[0].nedostupnost.do)
                    });
                else
                    resolve(null);
            });
        });
    }
    /*
        Ako se interval ne preklapa sa radnim vremenom, vraca radno vreme za taj dan u obliku
        {
            od: DatumVreme,
            do: DatumVreme
        }
    */
    static nastavnikRadi(kime, od, do_) {
        return new Promise((resolve, reject) => {
            if (!od.istiDan(do_)) {
                this.nastavnikRadi(kime, od, od.krajDana()).then((res) => {
                    if (res)
                        resolve(res);
                    else
                        this.nastavnikRadi(kime, do_.vreme(0), do_).then((res) => {
                            if (res)
                                resolve(res);
                            else
                                resolve(null);
                        });
                });
            }
            else {
                Korisnik_1.default.findOne({ kime: kime, tip: "Nastavnik", radnovreme: { $exists: true } }).then((res) => {
                    if (!res)
                        resolve(null);
                    else {
                        let radnovreme = res.radnovreme[od.danUNedelji()];
                        if (od.sirovoVreme() >= radnovreme.od && do_.sirovoVreme() <= radnovreme.do)
                            resolve(null);
                        else
                            resolve({
                                od: new DatumVreme_1.DatumVreme(radnovreme.od),
                                do: new DatumVreme_1.DatumVreme(radnovreme.do)
                            });
                    }
                });
            }
        });
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
    static nastavnikImaCas(kime, od, do_) {
        return new Promise((resolve, reject) => {
            Cas_1.default.findOne({ nastavnik: kime, odbijen: null, otkazan: null, $expr: { $or: [
                        {
                            $and: [{ $gte: [od.broj(), "$od"] }, { $lt: [od.broj(), "$do"] }]
                        },
                        {
                            $and: [{ $lte: [do_.broj(), "$do"] }, { $gt: [do_.broj(), "$od"] }]
                        }
                    ] } }).then((res) => {
                if (res)
                    resolve({
                        ucenik: res.ucenik,
                        od: new DatumVreme_1.DatumVreme(res.od),
                        do: new DatumVreme_1.DatumVreme(res.do),
                        predmet: res.predmet,
                        potvrdjen: res.potvrdjen
                    });
                else
                    resolve(null);
            });
        });
    }
    static nastavnikTerminStatus(kime, datum, slot, detaljno) {
        let od = datum.dodajVreme(slot * 30);
        let do_ = od.dodajVreme(30);
        return new Promise((resolve, reject) => {
            if (od.proslost())
                resolve({ status: 5, rb: 1, duzina: 1, tekst: "" });
            else
                this.nastavnikNedostupan(kime, od, do_).then((res) => {
                    if (res) {
                        resolve({
                            status: 1, //Nedostupan
                            rb: 1,
                            duzina: 1,
                            tekst: ""
                        });
                    }
                    else {
                        this.nastavnikRadi(kime, od, do_).then((res) => {
                            if (res) {
                                resolve({
                                    status: 2,
                                    rb: 1,
                                    duzina: 1,
                                    tekst: ""
                                });
                            }
                            else {
                                this.nastavnikImaCas(kime, od, do_).then((res) => {
                                    if (res) {
                                        let slotOd = res.od.slotOd();
                                        let slotDo = res.do.slotDo();
                                        if (!res.od.istiDan(res.do))
                                            slotDo += 24;
                                        let ret = {
                                            status: (res.potvrdjen ? 4 : 3),
                                            rb: slot - slotOd + 1,
                                            duzina: slotDo - slotOd + 1,
                                            tekst: ""
                                        };
                                        if (detaljno)
                                            DB.korisnikPoKime(res.ucenik).then((res) => {
                                                ret.tekst = `${res.ime} ${res.prezime} (${res.predmet})`;
                                                resolve(ret);
                                            });
                                        else
                                            resolve(ret);
                                    }
                                    else {
                                        resolve({
                                            status: 0,
                                            rb: 1,
                                            duzina: 1,
                                            tekst: ""
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
        });
    }
    static nastavnikTerminStatusZaDan(kime, dan, detaljno) {
        let ret = Array(48);
        let complete = 0;
        dan = dan.vreme(0);
        return new Promise((resolve, reject) => {
            for (let i = 0; i < 48; i++) {
                this.nastavnikTerminStatus(kime, dan, i, detaljno).then((res) => {
                    ret[i] = res;
                    if (++complete == 48)
                        resolve(ret);
                });
            }
        });
    }
    static zakazi(nastavnik, ucenik, od, do_, predmet, opis) {
        return new Promise((resolve, reject) => {
            Cas_1.default.insertMany([
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
                resolve("Greska u bazi.");
            });
        });
    }
}
exports.DB = DB;
DB.prosecnaOcenaPipeline = [
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
