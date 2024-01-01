"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UcenikKontroler = void 0;
const validacija_1 = require("../validacija");
const utils_1 = require("../utils");
const db_1 = require("../db");
const DatumVreme_1 = require("../DatumVreme");
class UcenikKontroler {
    constructor() {
        this.autorizacija = (req, res) => {
            let session = req.session;
            if (session && session.korisnik && session.korisnik.tip == "Ucenik")
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
                        db_1.DB.ucenikPodaci(kor.kime).then((ret => {
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
            db_1.DB.ucenikPodaci(kor.kime).then(ret => {
                if (ret == null)
                    res.json({ poruka: "Greska u bazi." });
                else
                    res.json({ poruka: "ok", podaci: ret });
            });
        };
        this.nastavniciPretraga = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let pretraga = req.body;
            if (!pretraga)
                pretraga = {};
            db_1.DB.nastavniciPretraga(pretraga, true, true).then(ret => {
                if (ret)
                    res.json({ poruka: "ok", podaci: ret });
                else
                    res.json({ poruka: "Greska u bazi." });
            });
        };
        this.nastavnikProfilPodaci = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let kime = req.query.kime;
            if (!kime)
                res.json({ poruka: "Nedostaje argument." });
            else
                db_1.DB.nastavnikPodaci(kime).then((ret) => {
                    if (!ret)
                        res.json({ poruka: "Nastavnik ne postoji." });
                    else
                        db_1.DB.nastavnikOcena(kime).then((retOcena) => {
                            db_1.DB.nastavnikKomentari(kime).then((retKomentari) => {
                                delete ret.adresa;
                                delete ret.cv; //ucenik ne bi trebalo da vidi ove podatke
                                ret.komentari = retKomentari;
                                ret.ocena = retOcena;
                                res.json({ poruka: "ok", podaci: ret });
                            });
                        });
                });
        };
        this.nastavnikTermini = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body || !req.body.nastavnik || !req.body.datum)
                res.json({ poruka: "Nedostaju argumenti." });
            else
                db_1.DB.korisnikPoKime(req.body.nastavnik).then((ret) => {
                    if (!ret)
                        res.json({ poruka: "Nastavnik ne postoji." });
                    else
                        db_1.DB.nastavnikTerminStatusZaDan(req.body.nastavnik, new DatumVreme_1.DatumVreme(req.body.datum), false).then((ret) => {
                            res.json({ poruka: "ok", podaci: ret });
                        });
                });
        };
        this.zakazi = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let t = req.body;
            if (!t || !t.predmet || !t.datumvreme || !t.nastavnik || !t.trajanje)
                res.json({ poruka: "Nedostaju argumenti." });
            else {
                let od = new DatumVreme_1.DatumVreme(t.datumvreme);
                let do_ = od.dodajVreme(t.trajanje);
                if (od.proslost())
                    res.json({ poruka: "Ne mozete zakazivati prosle termine." });
                else
                    db_1.DB.korisnikPoKime(t.nastavnik).then((ret) => {
                        if (!ret || ret.tip != "Nastavnik")
                            res.json({ poruka: "Nastavnik ne postoji." });
                        else if (!validacija_1.Validacija.odgovaraUzrast(kor, ret))
                            res.json({ poruka: "Izabrani nastavnik ne drzi casove ucenicima vaseg uzrasta." });
                        else
                            db_1.DB.nastavnikNedostupan(t.nastavnik, od, do_).then((ret) => {
                                if (ret)
                                    res.json({ poruka: "Nastavnik nije dostupan u periodu od " + ret.od.vremeString() + " do " + ret.do.vremeString() });
                                else
                                    db_1.DB.nastavnikRadi(t.nastavnik, od, do_).then((ret) => {
                                        if (ret) {
                                            if (ret.od.sirovoVreme() != ret.do.sirovoVreme())
                                                res.json({ poruka: "Radno vreme nastavnika je od " + ret.od.vremeString() + " do " + ret.do.vremeString() });
                                            else
                                                res.json({ poruka: "Odabrali ste neradan dan." });
                                        }
                                        else
                                            db_1.DB.nastavnikImaCas(t.nastavnik, od, do_).then((ret) => {
                                                if (ret)
                                                    res.json({ poruka: "Nastavnik ima " + (ret.potvrdjen ? "potvrdjen" : "zakazan") + " cas u odabranom terminu." });
                                                else {
                                                    //zakazi cas
                                                    db_1.DB.zakazi(t.nastavnik, kor.kime, od, do_, t.predmet, t.opis ? t.opis : "").then((ret) => {
                                                        if (ret == "ok")
                                                            res.json({ poruka: "ok" });
                                                        else
                                                            res.json({ poruka: ret });
                                                    });
                                                }
                                            });
                                    });
                            });
                    });
            }
        };
        this.casovi = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            db_1.DB.ucenikCasovi(kor.kime).then((ret) => {
                res.json({ poruka: "ok", podaci: ret });
            });
        };
        this.arhiva = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            db_1.DB.ucenikArhiva(kor.kime).then((ret) => {
                res.json({ poruka: "ok", podaci: ret });
            });
        };
        this.recenzija = (req, res) => {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let izlaz = {};
            validacija_1.Validacija.ucenikRecenzijaValidacija(req.body, izlaz, kor.kime).then((ret) => {
                if (ret != "ok")
                    res.json({ poruka: ret });
                else
                    db_1.DB.ucenikRecenzija(izlaz.nastavnik, izlaz.od, izlaz.ocena, izlaz.komentar).then((ret) => {
                        res.json({ poruka: ret });
                    });
            });
        };
    }
}
exports.UcenikKontroler = UcenikKontroler;
