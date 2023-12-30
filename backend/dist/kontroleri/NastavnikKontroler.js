"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NastavnikKontroler = void 0;
const validacija_1 = require("../validacija");
const utils_1 = require("../utils");
const db_1 = require("../db");
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
                            res.json({ poruka: "ok", podaci: ret });
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
    }
}
exports.NastavnikKontroler = NastavnikKontroler;
