"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const Korisnik_1 = __importDefault(require("./modeli/Korisnik"));
const Podatak_1 = __importDefault(require("./modeli/Podatak"));
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
    static sviNastavnici(pretraga) {
        let upit = {};
        if (pretraga.ime && pretraga.ime != "")
            upit.ime = { $regex: new RegExp(pretraga.ime, 'i') };
        if (pretraga.prezime && pretraga.prezime != "")
            upit.prezime = { $regex: new RegExp(pretraga.prezime, 'i') };
        if (pretraga.predmet && pretraga.predmet != "")
            upit.predmet = { $regex: new RegExp(pretraga.predmet, 'i') };
        let sort = null;
        if (pretraga.sort) {
            sort = {};
            sort[pretraga.sort] = pretraga.opadajuce ? -1 : 1;
        }
        let tmp = [
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
        if (sort)
            tmp.push({ $sort: sort });
        console.log(tmp);
        return new Promise((resolve, reject) => {
            Korisnik_1.default.aggregate(tmp).then(res => {
                resolve(res);
            }).catch(err => {
                resolve([]);
            });
        });
    }
}
exports.DB = DB;
