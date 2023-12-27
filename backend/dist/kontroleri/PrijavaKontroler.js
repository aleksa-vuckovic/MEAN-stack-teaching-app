"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrijavaKontroler = void 0;
const validacija_1 = require("../validacija");
const utils_1 = require("../utils");
const db_1 = require("../db");
class PrijavaKontroler {
    constructor() {
        this.registracija = (req, res) => {
            let ulaz = req.body;
            let izlaz = {};
            validacija_1.Validacija.registracijaValidacija(ulaz, izlaz).then(ret => {
                if (ret != "ok") {
                    res.json({ poruka: ret });
                    return;
                }
                const files = req.files;
                let profil = files["profil"] ? files["profil"][0] : null;
                ret = validacija_1.Validacija.profilValidacija(profil);
                if (ret != "ok") {
                    res.json({ poruka: ret });
                    return;
                }
                let profilBaza = utils_1.Utils.podrazumevanaProfilna();
                if (profil != null)
                    profilBaza = utils_1.Utils.sacuvajFajl(profil);
                izlaz.profil = profilBaza;
                izlaz.odobren = false;
                izlaz.aktivan = true;
                if (izlaz.tip == "Nastavnik") {
                    let cv = files["cv"] ? files["cv"][0] : null;
                    ret = validacija_1.Validacija.cvValidacija(cv);
                    if (ret != "ok") {
                        res.json({ poruka: ret });
                        return;
                    }
                    let cvBaza = utils_1.Utils.sacuvajFajl(cv);
                    izlaz.cv = cvBaza;
                }
                else {
                    izlaz.odobren = true;
                }
                db_1.DB.dodajKorisnika(izlaz).then(ret => {
                    res.json({ poruka: ret });
                });
            });
        };
        this.prijava = (req, res) => {
            if (!req.body || !req.body.lozinka || !req.body.kime) {
                res.json({ poruka: "Nedostaju polja" });
            }
            db_1.DB.korisnikPoKime(req.body.kime).then((ret) => {
                if (ret == null)
                    res.json({ poruka: "Neispravni kredencijali." });
                else if (ret.lozinka != req.body.lozinka)
                    res.json({ poruka: "Neispravni kredencijali." });
                else {
                    let session = req.session;
                    session.korisnik = ret;
                    res.json({
                        poruka: "ok",
                        podaci: {
                            kime: ret.kime,
                            tip: ret.tip
                        }
                    });
                }
            });
        };
        this.promenaLozinke = (req, res) => {
            if (!req.body || !req.body.kime || !req.body.stara || !req.body.nova || !req.body.nova2) {
                res.json({ poruka: "Nedostaju polja" });
            }
            else if (validacija_1.Validacija.lozinkaValidacija(req.body.nova) != "ok")
                res.json({ poruka: validacija_1.Validacija.lozinkaValidacija(req.body.nova) });
            else if (req.body.nova != req.body.nova2)
                res.json({ poruka: "Nepodudaranje ponovljene lozinke." });
            else
                db_1.DB.korisnikPoKime(req.body.kime).then((ret) => {
                    if (ret == null)
                        res.json({ poruka: "Neispravni kredencijali." });
                    else if (ret.lozinka != req.body.stara)
                        res.json({ poruka: "Neispravni kredencijali." });
                    else {
                        db_1.DB.promeniLozinku(req.body.kime, req.body.nova).then(ret => {
                            res.json({ poruka: ret });
                        });
                    }
                });
        };
        this.sigurnosnoPitanje = (req, res) => {
            let kime = req.query.kime;
            if (!kime)
                res.json({ poruka: "Nedostaje korisnicko ime." });
            else
                db_1.DB.korisnikPoKime(kime).then((ret) => {
                    if (ret == null)
                        res.json({ poruka: "Korisnik ne postoji u bazi." });
                    else
                        res.json({ poruka: "ok", podaci: ret.pitanje });
                });
        };
        this.sigurnosniOdgovor = (req, res) => {
            if (!req.body || !req.body.kime || !req.body.odgovor)
                res.json({ poruka: "Nedostaju polja." });
            else
                db_1.DB.korisnikPoKime(req.body.kime).then((ret) => {
                    if (ret == null)
                        res.json({ poruka: "Korisnik ne postoji." });
                    else if (ret.odgovor == req.body.odgovor)
                        res.json({ poruka: "ok" });
                    else
                        res.json({ poruka: "Odgovor nije tacan." });
                });
        };
        this.zaboravljenaLozinka = (req, res) => {
            if (!req.body || !req.body.kime || !req.body.odgovor || !req.body.nova || !req.body.nova2)
                res.json({ poruka: "Nedostaju polja." });
            else if (validacija_1.Validacija.lozinkaValidacija(req.body.nova) != "ok")
                res.json({ poruka: validacija_1.Validacija.lozinkaValidacija(req.body.nova) });
            else if (req.body.nova != req.body.nova2)
                res.json({ poruka: "Nepodudaranje ponovljene lozinke." });
            else
                db_1.DB.korisnikPoKime(req.body.kime).then((ret) => {
                    if (ret == null)
                        res.json({ poruka: "Neispravni kredencijali." });
                    else if (ret.odgovor != req.body.odgovor)
                        res.json({ poruka: "Netacan odgovor." });
                    else {
                        db_1.DB.promeniLozinku(ret.kime, req.body.nova).then(ret => {
                            res.json({ poruka: ret });
                        });
                    }
                });
        };
        this.sviPredmeti = (req, res) => {
            db_1.DB.sviPredmeti().then(ret => {
                res.json({ poruka: "ok", podaci: ret });
            });
        };
        this.statistika = (req, res) => {
            db_1.DB.statistika().then((ret) => {
                if (ret)
                    res.json({ poruka: "ok", podaci: ret });
                else
                    res.json({ poruka: "Greska u bazi.", podaci: { brojNastavnika: 0, brojUcenika: 0 } });
            });
        };
        this.nastavniciPretraga = (req, res) => {
            let pretraga = {};
            if (req.body)
                pretraga = req.body;
            db_1.DB.nastavniciPretraga(pretraga, false).then(ret => {
                res.json({ poruka: "ok", podaci: ret });
            });
        };
        this.odjava = (req, res) => {
            if (req.session)
                req.session.destroy(err => {
                });
            res.json({ poruka: "ok" });
        };
    }
}
exports.PrijavaKontroler = PrijavaKontroler;
