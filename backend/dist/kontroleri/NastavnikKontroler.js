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
                return;
            }
            let podaci = yield db_1.DB.nastavnikPodaci(kor.kime);
            let ocena = yield db_1.DB.nastavnikOcena(kor.kime);
            podaci.ocena = ocena;
            res.json({ poruka: "ok", podaci: ret });
        });
        this.profilPodaci = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let podaci = yield db_1.DB.nastavnikPodaci(kor.kime);
            if (!podaci) {
                res.json({ poruka: "Greska u bazi." });
                return;
            }
            let ocena = yield db_1.DB.nastavnikOcena(kor.kime);
            podaci.ocena = ocena;
            res.json({ poruka: "ok", podaci: podaci });
        });
        this.termini = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body || !req.body.datum) {
                res.json({ poruka: "Nedostaju argumenti." });
                return;
            }
            let ret = yield db_1.DB.nastavnikTerminiStatus(kor.kime, new DatumVreme_1.DatumVreme(req.body.datum), 30 * 60 * 1000, 48, true);
            res.json({ poruka: "ok", podaci: ret });
        });
        this.radnovreme = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let ret = yield db_1.DB.radnovreme(kor.kime);
            if (!ret)
                res.json({ poruka: "Greska u bazi." });
            else
                res.json({ poruka: "ok", podaci: ret });
        });
        this.radnovremeAzuriranje = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let izlaz = {};
            let ret = validacija_1.Validacija.radnovremeValidacija(req.body, izlaz);
            if (ret != "ok") {
                res.json({ poruka: ret });
                return;
            }
            ret = yield db_1.DB.azurirajRadnovreme(kor.kime, izlaz);
            res.json({ poruka: ret });
        });
        this.nedostupnostAzuriranje = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let izlaz = {};
            let ret = validacija_1.Validacija.nedostupnostValidacija(req.body, izlaz);
            if (ret != "ok") {
                res.json({ poruka: ret });
                return;
            }
            ret = yield db_1.DB.azurirajNedostupnost(kor.kime, izlaz);
            res.json({ poruka: ret });
        });
        this.casovi = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let limit = 5;
            if (req.query.limit)
                limit = parseInt(req.query.limit);
            if (isNaN(limit))
                limit = 5;
            let ret = yield db_1.DB.nastavnikCasovi(kor.kime, limit);
            res.json({ poruka: "ok", podaci: ret });
        });
        this.otkazi = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body || !req.body.od || !req.body.obrazlozenje) {
                res.json("Nedostaju podaci.");
                return;
            }
            let izlaz = {};
            let ret = yield validacija_1.Validacija.otkazivanjeValidacija(req.body, izlaz);
            if (ret != "ok") {
                res.json({ poruka: ret });
                return;
            }
            let cas = yield db_1.DB.cas(izlaz.id);
            ret = yield db_1.DB.otkaziCas(izlaz.id, izlaz.obrazlozenje);
            if (ret != "ok") {
                res.json({ poruka: ret });
                return;
            }
            let sadrzaj = `Nastavnik ${kor.ime} ${kor.prezime} je otkazao cas zakazan za ${new DatumVreme_1.DatumVreme(cas.od).datumVremeString()}`;
            if (izlaz.obrazlozenje == "")
                sadrzaj += " bez obrazlozenja.";
            else
                sadrzaj += " uz obrazlozenje: '" + izlaz.obrazlozenje + "'.";
            yield db_1.DB.dodajObavestenje(cas.ucenik, sadrzaj);
            res.json({ poruka: "ok" });
        });
        this.zahtevi = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let ret = yield db_1.DB.nastavnikZahtevi(kor.kime);
            res.json({ poruka: "ok", podaci: ret });
        });
        this.potvrdi = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body || !req.body.id) {
                res.json({ poruka: "Nedostaju podaci." });
                return;
            }
            let ret = yield db_1.DB.nastavnikOdgovor(req.body.id, null);
            if (ret != "ok") {
                res.json({ poruka: ret });
                return;
            }
            let cas = yield db_1.DB.cas(req.body.id);
            let sadrzaj = `Nastavnik ${kor.ime} ${kor.prezime} je potvrdio cas zakazan za ${new DatumVreme_1.DatumVreme(cas.od).datumVremeString()}.`;
            yield db_1.DB.dodajObavestenje(cas.ucenik, sadrzaj);
            res.json({ poruka: "ok" });
        });
        this.odbij = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body || !req.body.id || !req.body.obrazlozenje) {
                res.json({ poruka: "Nedostaju podaci." });
                return;
            }
            let id = req.body.id;
            let obrazlozenje = req.body.obrazlozenje;
            let cas = yield db_1.DB.cas(id);
            let ret = yield db_1.DB.nastavnikOdgovor(id, obrazlozenje);
            if (ret != "ok") {
                res.json({ poruka: ret });
                return;
            }
            let sadrzaj = `Nastavnik ${kor.ime} ${kor.prezime} je odbio cas zakazan za ${new DatumVreme_1.DatumVreme(cas.od).datumVremeString()}`;
            if (obrazlozenje == "")
                sadrzaj += " bez obrazlozenja.";
            else
                sadrzaj += " uz obrazlozenje: '" + obrazlozenje + "'.";
            yield db_1.DB.dodajObavestenje(cas.ucenik, sadrzaj);
            res.json({ poruka: "ok" });
        });
        this.ucenici = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let ret = yield db_1.DB.nastavnikUcenici(kor.kime);
            res.json({ poruka: "ok", podaci: ret });
        });
        this.dosije = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body || !req.body.ucenik) {
                res.json({ poruka: "Nedovoljno podataka." });
                return;
            }
            let ret = yield db_1.DB.nastavnikDosije(kor.kime, req.body.ucenik);
            res.json({ poruka: "ok", podaci: ret });
        });
        this.recenzija = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let izlaz = {};
            let ret = yield validacija_1.Validacija.nastavnikRecenzijaValidacija(req.body, izlaz, kor.kime);
            if (ret != "ok") {
                res.json({ poruka: ret });
                return;
            }
            ret = yield db_1.DB.nastavnikRecenzija(izlaz.id, izlaz.ocena, izlaz.komentar);
            res.json({ poruka: ret });
        });
        this.dosijeProfil = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            if (!req.body.ucenik) {
                res.json({ poruka: "Nema dovoljno podataka." });
                return;
            }
            let ret = yield db_1.DB.ucenikPodaci(req.body.ucenik);
            if (!ret)
                res.json({ poruka: "Nije pronadjen ucenik." });
            else {
                delete ret.adresa;
                delete ret.aktivan;
                res.json({ poruka: "ok", podaci: ret });
            }
        });
    }
}
exports.NastavnikKontroler = NastavnikKontroler;
