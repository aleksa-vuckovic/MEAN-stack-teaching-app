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
                res.json({ message: "Nedostaju polja." });
                return;
            }
            validacija_1.Validacija.registracijaValidacija(body).then(ret => {
                if (ret != "ok") {
                    res.json({ message: ret });
                    return;
                }
                const files = req.files;
                let profil = files["profil"] ? files["profil"][0] : null;
                ret = validacija_1.Validacija.profilValidacija(profil);
                if (ret != "ok") {
                    res.json({ message: ret });
                    return;
                }
                let profilBaza = utils_1.Utils.podrazumevanaProfilna();
                if (profil != null)
                    profilBaza = utils_1.Utils.sacuvajFajl(profil);
                body["profil"] = profilBaza;
                if (req.body.tip == "Ucenik") {
                    ret = validacija_1.Validacija.ucenikValidacija(body);
                    if (ret != "ok") {
                        res.json({ message: ret });
                        return;
                    }
                    body["odobren"] = true;
                    body["aktivan"] = true;
                    db_1.DB.dodajKorisnika(body).then(ret => {
                        res.json({ message: ret });
                    });
                }
                else {
                    ret = validacija_1.Validacija.nastavnikValidacija(body);
                    if (ret != "ok") {
                        res.json({ message: ret });
                        return;
                    }
                    let cv = files["cv"] ? files["cv"][0] : null;
                    ret = validacija_1.Validacija.cvValidacija(cv);
                    if (ret != "ok") {
                        res.json({ message: ret });
                        return;
                    }
                    let cvBaza = utils_1.Utils.sacuvajFajl(cv);
                    body["cv"] = cvBaza;
                    body["odobren"] = false;
                    body["aktivan"] = true;
                    //insert into database
                    db_1.DB.dodajKorisnika(body).then(ret => {
                        res.json({ message: ret });
                    });
                }
            });
        };
        this.prijava = (req, res) => {
            if (!req.body || !req.body.lozinka || !req.body.kime) {
                res.json({ message: "Nedostaju polja" });
            }
            db_1.DB.korisnikPoKime(req.body.kime).then((ret) => {
                if (ret == null)
                    res.json({ message: "Neispravni kredencijali." });
                else if (ret.lozinka != req.body.lozinka)
                    res.json({ message: "Neispravni kredencijali." });
                else {
                    let session = req.session;
                    session.korisnik = ret;
                    res.json({
                        message: "ok",
                        data: {
                            kime: ret.kime,
                            tip: ret.tip
                        }
                    });
                }
            });
        };
    }
}
exports.PrijavaController = PrijavaController;
