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
exports.AdministratorKontroler = void 0;
const db_1 = require("../db");
class AdministratorKontroler {
    constructor() {
        this.autorizacija = (req, res) => {
            let session = req.session;
            if (session && session.korisnik && session.korisnik.tip == "Administrator")
                return session.korisnik;
            else {
                res.json({ poruka: "Nautorizovan pristup." });
                return null;
            }
        };
        this.korisniciPretraga = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let pretraga = req.body;
            if (!pretraga)
                pretraga = {};
            let ret = yield db_1.DB.korisniciPretraga(pretraga);
            if (ret)
                res.json({ poruka: "ok", podaci: ret });
            else
                res.json({ poruka: "Greska u bazi." });
        });
        this.nastavnikPodaci = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
            delete ret.adresa;
            ret.komentari = komentari;
            ret.ocena = ocena;
            res.json({ poruka: "ok", podaci: ret });
        });
        this.aktivacija = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let kime = req.query.kime;
            if (!kime) {
                res.json({ poruka: "Nedostaje argument." });
                return;
            }
            let ret = yield db_1.DB.korisnikAktivacija(kime, true);
            res.json({ poruka: ret });
        });
        this.deaktivacija = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let kime = req.query.kime;
            if (!kime) {
                res.json({ poruka: "Nedostaje argument." });
                return;
            }
            let ret = yield db_1.DB.korisnikAktivacija(kime, false);
            res.json({ poruka: ret });
        });
        this.ucenikPodaci = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let kime = req.query.kime;
            if (!kime) {
                res.json({ poruka: "Nema dovoljno podataka." });
                return;
            }
            let ret = yield db_1.DB.ucenikPodaci(kime);
            if (!ret)
                res.json({ poruka: "Nije pronadjen ucenik." });
            else {
                delete ret.adresa;
                res.json({ poruka: "ok", podaci: ret });
            }
        });
        this.zahtevi = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let ret = yield db_1.DB.zahteviZaRegistraciju();
            res.json({ poruka: "ok", podaci: ret });
        });
        this.odobreno = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let kime = req.query.kime;
            if (!kime) {
                res.json({ poruka: "Nedostaje argument." });
                return;
            }
            let ret = yield db_1.DB.odobrenje(kime, true);
            res.json({ poruka: ret });
        });
        this.predlozeniPredmeti = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let ret = yield db_1.DB.predlozeniPredmeti();
            res.json({ poruka: "ok", podaci: ret });
        });
        this.dodajPredmet = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let predmet = req.body.predmet;
            if (!predmet) {
                res.json({ poruka: "Nedostaju argumenti." });
                return;
            }
            else if (predmet == "") {
                res.json({ poruka: "Predmet ne moze biti prazan string." });
                return;
            }
            let ret = yield db_1.DB.dodajPredmet(predmet);
            res.json({ poruka: ret });
        });
        this.ukloniPredmet = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kor = this.autorizacija(req, res);
            if (!kor)
                return;
            let predmet = req.body.predmet;
            if (!predmet) {
                res.json({ poruka: "Nedostaju argumenti." });
                return;
            }
            else if (predmet == "") {
                res.json({ poruka: "Predmet ne moze biti prazan string." });
                return;
            }
            let ret = yield db_1.DB.ukloniPredmet(predmet);
            res.json({ poruka: ret });
        });
    }
}
exports.AdministratorKontroler = AdministratorKontroler;
