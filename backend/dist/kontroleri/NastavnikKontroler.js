"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NastavnikKontroler = void 0;
const validacija_1 = require("../validacija");
const utils_1 = require("../utils");
const db_1 = require("../db");
const DatumVreme_1 = require("../DatumVreme");
class NastavnikKontroler {
    constructor() {
        this.autorizacija = (req, res) => {
            let session = req.session;
            if (session && session.korisnik && session.korisnik.tip == "Nastavnik")
                return session.korisnik;
            else {
                res.json({ poruka: "Nautorizovan pristup." });
                return null;
            }
        };
        this.profilAzuriranje = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let ulaz = req.body;
            let izlaz = {};
            validacija_1.Validacija.profilAzuriranjeValidacija(ulaz, izlaz, kor).then(ret => {
                if (ret != "ok") {
                    res.json({ poruka: ret });
                    return;
                }
                let profil = req.file;
                if (profil) {
                    ret = validacija_1.Validacija.profilValidacija(profil);
                    if (ret != "ok") {
                        res.json({ poruka: ret });
                        return;
                    }
                    izlaz.profil = utils_1.Utils.sacuvajFajl(profil);
                }
                db_1.DB.azurirajProfil(kor.kime, izlaz).then(ret => {
                    if (ret != "ok") {
                        res.json({ poruka: ret });
                    }
                    else {
                        db_1.DB.nastavnikPodaci(kor.kime).then((ret => {
                            db_1.DB.nastavnikOcena(kor.kime).then((retOcena) => {
                                ret.ocena = retOcena;
                                res.json({ poruka: "ok", podaci: ret });
                            });
                        }));
                    }
                });
            });
        };
        this.profilPodaci = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            db_1.DB.nastavnikPodaci(kor.kime).then(ret => {
                if (!ret)
                    res.json({ poruka: "Greska u bazi." });
                else {
                    db_1.DB.nastavnikOcena(kor.kime).then((retOcena) => {
                        ret.ocena = retOcena;
                        res.json({ poruka: "ok", podaci: ret });
                    });
                }
            });
        };
        this.termini = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body || !req.body.datum)
                res.json({ poruka: "Nedostaju argumenti." });
            else
                db_1.DB.nastavnikTerminStatusZaDan(kor.kime, new DatumVreme_1.DatumVreme(req.body.datum), true).then((ret) => {
                    res.json({ poruka: "ok", podaci: ret });
                });
        };
        this.radnovreme = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            db_1.DB.radnovreme(kor.kime).then((ret) => {
                if (!ret)
                    res.json({ poruka: "Greska u bazi." });
                else
                    res.json({ poruka: "ok", podaci: ret });
            });
        };
        this.radnovremeAzuriranje = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let izlaz = {};
            let ret = validacija_1.Validacija.radnovremeValidacija(req.body, izlaz);
            if (ret != "ok")
                res.json({ poruka: ret });
            else
                db_1.DB.azurirajRadnovreme(kor.kime, izlaz).then((ret) => {
                    res.json({ poruka: ret });
                });
        };
        this.nedostupnostAzuriranje = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let izlaz = {};
            let ret = validacija_1.Validacija.nedostupnostValidacija(req.body, izlaz);
            if (ret != "ok")
                res.json({ poruka: ret });
            else
                db_1.DB.azurirajNedostupnost(kor.kime, izlaz).then((ret) => {
                    res.json({ poruka: ret });
                });
        };
        this.casovi = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let limit = 5;
            if (req.query.limit)
                limit = parseInt(req.query.limit);
            if (isNaN(limit))
                limit = 5;
            db_1.DB.nastavnikCasovi(kor.kime, limit).then((ret) => {
                res.json({ poruka: "ok", podaci: ret });
            });
        };
        this.otkazi = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body || !req.body.od || !req.body.obrazlozenje) {
                res.json("Nedostaju podaci.");
                return;
            }
            let od = new DatumVreme_1.DatumVreme(req.body.od);
            let ret = validacija_1.Validacija.otkazivanjeValidacija(od);
            if (ret != "ok")
                res.json({ poruka: ret });
            else
                db_1.DB.otkaziCas(kor.kime, od, req.body.obrazlozenje).then((ret) => {
                    res.json({ poruka: ret });
                });
        };
        this.zahtevi = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            db_1.DB.nastavnikZahtevi(kor.kime).then((ret) => {
                res.json({ poruka: "ok", podaci: ret });
            });
        };
        this.potvrdi = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body || !req.body.od) {
                res.json({ poruka: "Nedostaju podaci." });
                return;
            }
            let od = new DatumVreme_1.DatumVreme(req.body.od);
            db_1.DB.nastavnikOdgovor(kor.kime, od, null).then((ret) => {
                res.json({ poruka: ret });
            });
        };
        this.odbij = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body || !req.body.od || !req.body.obrazlozenje) {
                res.json({ poruka: "Nedostaju podaci." });
                return;
            }
            let od = new DatumVreme_1.DatumVreme(req.body.od);
            let obrazlozenje = req.body.obrazlozenje;
            db_1.DB.nastavnikOdgovor(kor.kime, od, obrazlozenje).then((ret) => {
                res.json({ poruka: ret });
            });
        };
        this.ucenici = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            db_1.DB.nastavnikUcenici(kor.kime).then((ret) => {
                res.json({ poruka: "ok", podaci: ret });
            });
        };
        this.dosije = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body || !req.body.ucenik)
                res.json({ poruka: "Nedovoljno podataka." });
            else
                db_1.DB.nastavnikDosije(kor.kime, req.body.ucenik).then((ret) => {
                    res.json({ poruka: "ok", podaci: ret });
                });
        };
        this.recenzija = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let izlaz = {};
            validacija_1.Validacija.nastavnikRecenzijaValidacija(req.body, izlaz, kor.kime).then((ret) => {
                if (ret != "ok")
                    res.json({ poruka: ret });
                else
                    db_1.DB.nastavnikRecenzija(kor.kime, izlaz.od, izlaz.ocena, izlaz.komentar).then((ret) => {
                        res.json({ poruka: ret });
                    });
            });
        };
        this.dosijeProfil = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body.ucenik)
                res.json({ poruka: "Nema dovoljno podataka." });
            else
                db_1.DB.ucenikPodaci(req.body.ucenik).then((ret) => {
                    if (!ret)
                        res.json({ poruka: "Nije pronadjen ucenik." });
                    else {
                        delete ret.adresa;
                        res.json({ poruka: "ok", podaci: ret });
                    }
                });
        };
    }
}
exports.NastavnikKontroler = NastavnikKontroler;
