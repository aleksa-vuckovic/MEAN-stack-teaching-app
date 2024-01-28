"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        this.profilAzuriranje = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let ulaz = req.body;
            let izlaz = {};
            let ret = yield validacija_1.Validacija.profilAzuriranjeValidacija(ulaz, izlaz, kor);
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
            ret = yield db_1.DB.azurirajProfil(kor.kime, izlaz);
            if (ret != "ok") {
                res.json({ poruka: ret });
            }
            else {
                let ret = yield db_1.DB.korisnikPoKime(kor.kime);
                let session = req.session;
                session.korisnik = ret;
                ret = yield db_1.DB.ucenikPodaci(kor.kime);
                res.json({ poruka: "ok", podaci: ret });
            }
        });
        this.profilPodaci = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let ret = yield db_1.DB.ucenikPodaci(kor.kime);
            if (ret == null)
                res.json({ poruka: "Greska u bazi." });
            else
                res.json({ poruka: "ok", podaci: ret });
        });
        this.nastavniciPretraga = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let pretraga = req.body;
            if (!pretraga)
                pretraga = {};
            let ret = yield db_1.DB.nastavniciPretraga(pretraga, true, true);
            if (ret)
                res.json({ poruka: "ok", podaci: ret });
            else
                res.json({ poruka: "Greska u bazi." });
        });
        this.nastavnikProfilPodaci = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let kime = req.query.kime;
            if (!kime) {
                res.json({ poruka: "Nedostaje argument." });
                return;
            }
            let ret = yield db_1.DB.nastavnikPodaci(kime);
            if (!ret) {
                res.json({ poruka: "Nastavnik ne postoji." });
                return;
            }
            let ocena = yield db_1.DB.nastavnikOcena(kime);
            let komentari = yield db_1.DB.nastavnikKomentari(kime);
            delete ret.aktivan;
            delete ret.adresa;
            delete ret.cv; //ucenik ne bi trebalo da vidi ove podatke
            ret.komentari = komentari;
            ret.ocena = ocena;
            res.json({ poruka: "ok", podaci: ret });
        });
        this.nastavnikTermini = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body || !req.body.nastavnik || !req.body.datum) {
                res.json({ poruka: "Nedostaju argumenti." });
                return;
            }
            let ret = yield db_1.DB.korisnikPoKime(req.body.nastavnik);
            if (!ret) {
                res.json({ poruka: "Nastavnik ne postoji." });
                return;
            }
            ret = yield db_1.DB.nastavnikTerminiStatus(req.body.nastavnik, new DatumVreme_1.DatumVreme(req.body.datum), 30 * 60 * 1000, 48, false);
            res.json({ poruka: "ok", podaci: ret });
        });
        this.zakazi = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let t = req.body;
            if (!t || !t.predmet || !t.datumvreme || !t.nastavnik || !t.trajanje) {
                res.json({ poruka: "Nedostaju argumenti." });
                return;
            }
            let od = new DatumVreme_1.DatumVreme(t.datumvreme);
            let do_ = od.dodajMili(t.trajanje * 60 * 1000);
            if (od.proslost()) {
                res.json({ poruka: "Ne mozete zakazivati prosle termine." });
                return;
            }
            let ret = yield db_1.DB.korisnikPoKime(t.nastavnik);
            if (!ret || ret.tip != "Nastavnik") {
                res.json({ poruka: "Nastavnik ne postoji." });
                return;
            }
            else if (!validacija_1.Validacija.odgovaraUzrast(kor, ret)) {
                res.json({ poruka: "Izabrani nastavnik ne drzi casove ucenicima vaseg uzrasta." });
                return;
            }
            ret = yield db_1.DB.nastavnikNedostupan(t.nastavnik, od, do_);
            if (ret) {
                res.json({ poruka: "Nastavnik nije dostupan u periodu od " + ret.od.datumVremeString() + " do " + ret.do.datumVremeString() });
                return;
            }
            ret = yield db_1.DB.nastavnikRadi(t.nastavnik, od, do_);
            if (ret) {
                if (ret.od != ret.do) {
                    let od = (ret.od / (1000 * 60));
                    let do_ = (ret.do / (1000 * 60));
                    res.json({ poruka: `Radno vreme nastavnika je od ${utils_1.Utils.naSirini(od / 60, 2)}:${utils_1.Utils.naSirini(od % 60, 2)} do ${utils_1.Utils.naSirini(do_ / 60, 2)}:${utils_1.Utils.naSirini(do_ % 60, 2)}.` });
                }
                else
                    res.json({ poruka: "Odabrali ste neradan dan." });
                return;
            }
            ret = yield db_1.DB.nastavnikImaCas(t.nastavnik, od, do_);
            if (ret) {
                res.json({ poruka: "Nastavnik ima " + (ret.potvrdjen ? "potvrdjen" : "zakazan") + " cas od " + ret.od.vremeString() + " do " + ret.do.vremeString() + "." });
                return;
            }
            let ret2 = yield db_1.DB.zakazi(t.nastavnik, kor.kime, od, do_, t.predmet, t.opis ? t.opis : "");
            if (ret2 == "ok")
                res.json({ poruka: "ok" });
            else
                res.json({ poruka: ret2 });
        });
        this.casovi = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let ret = yield db_1.DB.ucenikCasovi(kor.kime);
            res.json({ poruka: "ok", podaci: ret });
        });
        this.arhiva = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let ret = yield db_1.DB.ucenikArhiva(kor.kime);
            res.json({ poruka: "ok", podaci: ret });
        });
        this.recenzija = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let izlaz = {};
            let ret = yield validacija_1.Validacija.ucenikRecenzijaValidacija(req.body, izlaz, kor.kime);
            if (ret != "ok") {
                res.json({ poruka: ret });
                return;
            }
            ret = yield db_1.DB.ucenikRecenzija(izlaz.id, izlaz.ocena, izlaz.komentar);
            res.json({ poruka: ret });
        });
        this.obavestenja = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body || !req.body.do)
                res.json({ poruka: "Nedovoljno podataka." });
            let ret = yield db_1.DB.obavestenja(kor.kime, new DatumVreme_1.DatumVreme(kor.prijava), new DatumVreme_1.DatumVreme(req.body.do));
            res.json({ poruka: "ok", podaci: ret });
        });
    }
}
exports.UcenikKontroler = UcenikKontroler;
