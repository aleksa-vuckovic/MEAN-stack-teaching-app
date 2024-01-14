"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.PrijavaKontroler = void 0;
const validacija_1 = require("../validacija");
const utils_1 = require("../utils");
const db_1 = require("../db");
const bcrypt = __importStar(require("bcrypt"));
let podrazumevanoRadnoVreme = {
    "0": {
        od: 600,
        do: 18 * 60
    },
    "1": {
        od: 600,
        do: 18 * 60
    },
    "2": {
        od: 600,
        do: 18 * 60
    },
    "3": {
        od: 600,
        do: 18 * 60
    },
    "4": {
        od: 600,
        do: 18 * 60
    },
    "5": {
        od: 0,
        do: 0
    },
    "6": {
        od: 0,
        do: 0
    }
};
class PrijavaKontroler {
    constructor() {
        this.registracija = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let ulaz = req.body;
            let izlaz = {};
            let ret = yield validacija_1.Validacija.registracijaValidacija(ulaz, izlaz);
            if (ret != "ok") {
                res.json({ poruka: ret });
                return;
            }
            izlaz.lozinka = yield utils_1.Utils.enkripcija(izlaz.lozinka);
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
            izlaz.prijava = 0;
            if (izlaz.tip == "Nastavnik") {
                let cv = files["cv"] ? files["cv"][0] : null;
                ret = validacija_1.Validacija.cvValidacija(cv);
                if (ret != "ok") {
                    res.json({ poruka: ret });
                    return;
                }
                let cvBaza = utils_1.Utils.sacuvajFajl(cv);
                izlaz.cv = cvBaza;
                izlaz.radnovreme = podrazumevanoRadnoVreme;
                izlaz.nedostupnost = [];
            }
            else {
                izlaz.odobren = true;
            }
            ret = yield db_1.DB.dodajKorisnika(izlaz);
            res.json({ poruka: ret });
        });
        this.prijava = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.body || !req.body.lozinka || !req.body.kime) {
                res.json({ poruka: "Nedostaju polja" });
            }
            let ret = yield db_1.DB.korisnikPoKime(req.body.kime);
            if (ret == null)
                res.json({ poruka: "Neispravni kredencijali." });
            else if (!(yield bcrypt.compare(req.body.lozinka, ret.lozinka)))
                res.json({ poruka: "Neispravni kredencijali." });
            else {
                let session = req.session;
                session.korisnik = ret;
                yield db_1.DB.prijava(ret.kime); //pamti se vreme poslednje prijave
                res.json({
                    poruka: "ok",
                    podaci: {
                        kime: ret.kime,
                        tip: ret.tip
                    }
                });
            }
        });
        this.promenaLozinke = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.body || !req.body.kime || !req.body.stara || !req.body.nova || !req.body.nova2) {
                res.json({ poruka: "Nedostaju polja" });
            }
            else if (validacija_1.Validacija.lozinkaValidacija(req.body.nova) != "ok")
                res.json({ poruka: validacija_1.Validacija.lozinkaValidacija(req.body.nova) });
            else if (req.body.nova != req.body.nova2)
                res.json({ poruka: "Nepodudaranje ponovljene lozinke." });
            else {
                let ret = yield db_1.DB.korisnikPoKime(req.body.kime);
                if (ret == null)
                    res.json({ poruka: "Neispravni kredencijali." });
                else if (!bcrypt.compare(req.body.stara, ret.lozinka))
                    res.json({ poruka: "Neispravni kredencijali." });
                else {
                    let ret = yield db_1.DB.promeniLozinku(req.body.kime, yield utils_1.Utils.enkripcija(req.body.nova));
                    res.json({ poruka: ret });
                }
            }
        });
        this.sigurnosnoPitanje = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let kime = req.query.kime;
            if (!kime)
                res.json({ poruka: "Nedostaje korisnicko ime." });
            else {
                let ret = yield db_1.DB.korisnikPoKime(kime);
                if (ret == null)
                    res.json({ poruka: "Korisnik ne postoji u bazi." });
                else
                    res.json({ poruka: "ok", podaci: ret.pitanje });
            }
        });
        this.sigurnosniOdgovor = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.body || !req.body.kime || !req.body.odgovor)
                res.json({ poruka: "Nedostaju polja." });
            else {
                let ret = yield db_1.DB.korisnikPoKime(req.body.kime);
                if (ret == null)
                    res.json({ poruka: "Korisnik ne postoji." });
                else if (ret.odgovor == req.body.odgovor)
                    res.json({ poruka: "ok" });
                else
                    res.json({ poruka: "Odgovor nije tacan." });
            }
        });
        this.zaboravljenaLozinka = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.body || !req.body.kime || !req.body.odgovor || !req.body.nova || !req.body.nova2)
                res.json({ poruka: "Nedostaju polja." });
            else if (validacija_1.Validacija.lozinkaValidacija(req.body.nova) != "ok")
                res.json({ poruka: validacija_1.Validacija.lozinkaValidacija(req.body.nova) });
            else if (req.body.nova != req.body.nova2)
                res.json({ poruka: "Nepodudaranje ponovljene lozinke." });
            else {
                let kor = yield db_1.DB.korisnikPoKime(req.body.kime);
                if (kor == null)
                    res.json({ poruka: "Neispravni kredencijali." });
                else if (kor.odgovor != req.body.odgovor)
                    res.json({ poruka: "Netacan odgovor." });
                else {
                    let ret = yield db_1.DB.promeniLozinku(kor.kime, yield utils_1.Utils.enkripcija(req.body.nova));
                    res.json({ poruka: ret });
                }
            }
        });
        this.sviPredmeti = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let ret = yield db_1.DB.sviPredmeti();
            res.json({ poruka: "ok", podaci: ret });
        });
        this.statistika = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let brojNastavnika = yield db_1.DB.brojAktivnihNastavnika();
            let brojUcenika = yield db_1.DB.brojAktivnihUcenika();
            let brojCasova7 = yield db_1.DB.brojOdrzanihCasova(7);
            let brojCasova30 = yield db_1.DB.brojOdrzanihCasova(30);
            res.json({
                poruka: "ok",
                podaci: {
                    brojNastavnika: brojNastavnika,
                    brojUcenika: brojUcenika,
                    brojCasova7: brojCasova7,
                    brojCasova30: brojCasova30
                }
            });
        });
        this.nastavniciPretraga = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let pretraga = {};
            if (req.body)
                pretraga = req.body;
            let ret = yield db_1.DB.nastavniciPretraga(pretraga, false);
            res.json({ poruka: "ok", podaci: ret });
        });
        this.odjava = (req, res) => {
            if (req.session)
                req.session.destroy(err => {
                });
            res.json({ poruka: "ok" });
        };
    }
}
exports.PrijavaKontroler = PrijavaKontroler;
