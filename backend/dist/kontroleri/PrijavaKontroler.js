"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrijavaController = void 0;
const validacija_1 = require("../validacija");
const utils_1 = require("../utils");
const db_1 = require("../db");
class PrijavaController {
    constructor() {
        this.registracija = (req, res) => {
            let body = req.body;
            if (!body) {
                res.json({ poruka: "Nedostaju polja." });
                return;
            }
            validacija_1.Validacija.registracijaValidacija(body).then(ret => {
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
                body["profil"] = profilBaza;
                if (req.body.tip == "Ucenik") {
                    ret = validacija_1.Validacija.ucenikValidacija(body);
                    if (ret != "ok") {
                        res.json({ poruka: ret });
                        return;
                    }
                    body["odobren"] = true;
                    body["aktivan"] = true;
                    db_1.DB.dodajKorisnika(body).then(ret => {
                        res.json({ poruka: ret });
                    });
                }
                else {
                    ret = validacija_1.Validacija.nastavnikValidacija(body);
                    if (ret != "ok") {
                        res.json({ poruka: ret });
                        return;
                    }
                    let cv = files["cv"] ? files["cv"][0] : null;
                    ret = validacija_1.Validacija.cvValidacija(cv);
                    if (ret != "ok") {
                        res.json({ poruka: ret });
                        return;
                    }
                    let cvBaza = utils_1.Utils.sacuvajFajl(cv);
                    body["cv"] = cvBaza;
                    body["odobren"] = false;
                    body["aktivan"] = true;
                    //insert into database
                    db_1.DB.dodajKorisnika(body).then(ret => {
                        res.json({ poruka: ret });
                    });
                }
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
                        data: {
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
                        db_1.DB.promeniLozinku(ret.kime, req.body.nova).then(ret => {
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
                        res.json({ poruka: "ok", data: ret.pitanje });
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
                res.json({ poruka: "ok", data: ret });
            });
        };
        this.statistika = (req, res) => {
            db_1.DB.statistika().then((ret) => {
                if (ret)
                    res.json({ poruka: "ok", data: ret });
                else
                    res.json({ poruka: "Greska u bazi.", data: { brojNastavnika: 0, brojUcenika: 0 } });
            });
        };
        this.sviNastavnici = (req, res) => {
            if (!req.body)
                req.body = {};
            db_1.DB.sviNastavnici(req.body).then(ret => {
                res.json({ poruka: "ok", data: ret });
            });
        };
    }
}
exports.PrijavaController = PrijavaController;
