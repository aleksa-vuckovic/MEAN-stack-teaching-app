"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const Korisnik_1 = __importDefault(require("./modeli/Korisnik"));
const Podatak_1 = __importDefault(require("./modeli/Podatak"));
const utils_1 = require("./utils");
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
