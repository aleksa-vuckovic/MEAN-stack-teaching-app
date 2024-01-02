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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const Korisnik_1 = __importDefault(require("./modeli/Korisnik"));
const Podatak_1 = __importDefault(require("./modeli/Podatak"));
const Cas_1 = __importDefault(require("./modeli/Cas"));
const Obavestenje_1 = __importDefault(require("./modeli/Obavestenje"));
const utils_1 = require("./utils");
const DatumVreme_1 = require("./DatumVreme");
class DB {
    static korisnikPoKime(kime) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Korisnik_1.default.findOne({ kime: kime });
        });
    }
    static korisnikPoMejlu(mejl) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Korisnik_1.default.findOne({ mejl: mejl });
        });
    }
    static dodajKorisnika(kor) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Korisnik_1.default.insertMany([kor]);
            return "ok";
        });
    }
    static promeniLozinku(kime, nova) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.updateOne({ kime: kime }, { $set: { lozinka: nova } });
            if (ret.modifiedCount > 0)
                return "ok";
            else
                return "Greska u bazi.";
        });
    }
    static sviPredmeti() {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Podatak_1.default.findOne({ podatak: "predmeti" });
            return ret.vrednosti;
        });
    }
    static brojAktivnihNastavnika() {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.aggregate([
                {
                    $match: {
                        tip: 'Nastavnik',
                        odobren: true,
                        aktivan: true
                    }
                }, {
                    $count: 'broj'
                }
            ]);
            return ret[0].broj;
        });
    }
    static brojAktivnihUcenika() {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.aggregate([
                {
                    $match: {
                        tip: 'Ucenik',
                        odobren: true,
                        aktivan: true
                    }
                }, {
                    $count: 'broj'
                }
            ]);
            return ret[0].broj;
        });
    }
    static nastavniciPretraga(pretraga, ocene = false, kime = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let upit = {};
            if (pretraga.ime && pretraga.ime != "")
                upit.ime = { $regex: new RegExp(pretraga.ime, 'i') };
            if (pretraga.prezime && pretraga.prezime != "")
                upit.prezime = { $regex: new RegExp(pretraga.prezime, 'i') };
            if (pretraga.predmet && pretraga.predmet != "")
                upit.predmeti = { $regex: new RegExp(pretraga.predmet, 'i') };
            if (pretraga.uzrast && pretraga.uzrast != "")
                upit.uzrasti = pretraga.uzrast;
            let sort = null;
            if (pretraga.sort && pretraga.sort != "") {
                sort = {};
                sort[pretraga.sort] = pretraga.opadajuce ? -1 : 1;
            }
            let projekcija = {
                ime: 1,
                prezime: 1,
                predmet: '$predmeti',
                _id: 0
            };
            if (ocene)
                projekcija.ocena = 1;
            if (kime)
                projekcija.kime = 1;
            let tmp = [
                {
                    $match: {
                        tip: 'Nastavnik',
                        odobren: true,
                        aktivan: true
                    }
                }
            ];
            if (ocene)
                tmp.push(...this.prosecnaOcenaPipeline);
            tmp.push({ $unwind: { path: '$predmeti' } });
            tmp.push({ $match: upit });
            tmp.push({ $project: projekcija });
            if (sort)
                tmp.push({ $sort: sort });
            return yield Korisnik_1.default.aggregate(tmp);
        });
    }
    static azurirajProfil(kime, podaci) {
        return __awaiter(this, void 0, void 0, function* () {
            podaci = { $set: podaci };
            let ret = yield Korisnik_1.default.updateOne({ kime: kime }, podaci);
            if (ret.modifiedCount > 0)
                return "ok";
            else
                return "Korisnik nije pronadjen u bazi.";
        });
    }
    static ucenikPodaci(kime) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield this.korisnikPoKime(kime);
            if (ret == null)
                return null;
            else
                return {
                    ime: ret.ime,
                    prezime: ret.prezime,
                    skola: ret.skola,
                    razred: ret.razred,
                    mejl: ret.mejl,
                    adresa: ret.adresa,
                    telefon: ret.telefon,
                    profil: utils_1.Utils.slikaUrl(ret.profil)
                };
        });
    }
    static nastavnikOcena(kime) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.aggregate([
                {
                    $match: {
                        nastavnik: kime,
                        ocenaUcenik: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: null,
                        ocena: {
                            $avg: "$ocenaUcenik"
                        }
                    }
                }
            ]);
            if (ret.length > 0)
                return ret[0].ocena;
            else
                return 0;
        });
    }
    static nastavnikKomentari(kime) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.aggregate([
                {
                    $match: {
                        nastavnik: kime,
                        ocenaUcenik: { $ne: null }
                    }
                },
                {
                    $lookup: {
                        from: "korisnici",
                        localField: "ucenik",
                        foreignField: "kime",
                        as: "ostalo"
                    }
                },
                {
                    $unwind: { path: "$ostalo" }
                },
                {
                    $project: {
                        _id: 0,
                        ocena: "$ocenaUcenik",
                        komentar: "$komentarUcenik",
                        kime: "$ostalo.kime",
                        profil: { $concat: [utils_1.Utils.slikaPrefiks(), "$ostalo.profil"] },
                        ime: "$ostalo.ime",
                        prezime: "$ostalo.prezime",
                        predmet: "$predmet",
                        datumvreme: "$od"
                    }
                },
                {
                    $sort: {
                        datumvreme: -1
                    }
                }
            ]);
            return ret;
        });
    }
    static nastavnikPodaci(kime) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.findOne({ kime: kime, tip: "Nastavnik" });
            if (!ret)
                return null;
            else
                return {
                    ime: ret.ime,
                    prezime: ret.prezime,
                    mejl: ret.mejl,
                    adresa: ret.adresa,
                    telefon: ret.telefon,
                    profil: utils_1.Utils.slikaUrl(ret.profil),
                    predmeti: ret.predmeti,
                    uzrasti: ret.uzrasti,
                    cv: utils_1.Utils.slikaUrl(ret.cv)
                };
        });
    }
    /*
    Ako postoji nedostupnost vraca je u obliku
    {
        od: DatumVreme,
        do: DatumVreme
    }
    */
    static nastavnikNedostupan(kime, od, do_) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.aggregate([
                {
                    $match: { kime: kime, tip: "Nastavnik", nedostupnost: { $exists: true } }
                },
                {
                    $unwind: { path: "$nedostupnost" }
                },
                {
                    $match: { $expr: { $or: [
                                {
                                    $and: [{ $gte: [od.broj(), "$nedostupnost.od"] }, { $lt: [od.broj(), "$nedostupnost.do"] }]
                                },
                                {
                                    $and: [{ $lte: [do_.broj(), "$nedostupnost.do"] }, { $gt: [do_.broj(), "$nedostupnost.od"] }]
                                }
                            ] } }
                }
            ]);
            if (ret.length > 0)
                return {
                    od: new DatumVreme_1.DatumVreme(ret[0].nedostupnost.od),
                    do: new DatumVreme_1.DatumVreme(ret[0].nedostupnost.do)
                };
            else
                return null;
        });
    }
    /*
        Ako se interval ne preklapa sa radnim vremenom, vraca radno vreme za taj dan u obliku
        {
            od: DatumVreme,
            do: DatumVreme
        }
    */
    static nastavnikRadi(kime, od, do_) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!od.istiDan(do_)) {
                let ret = yield this.nastavnikRadi(kime, od, od.krajDana());
                if (ret)
                    return ret;
                ret = yield this.nastavnikRadi(kime, do_.vreme(0), do_);
                return ret;
            }
            else {
                let ret = yield Korisnik_1.default.findOne({ kime: kime, tip: "Nastavnik", radnovreme: { $exists: true } });
                if (!ret)
                    return null;
                let radnovreme = ret.radnovreme[od.danUNedelji()];
                if (od.sirovoVreme() >= radnovreme.od && do_.sirovoVreme() <= radnovreme.do)
                    return null;
                else
                    return {
                        od: new DatumVreme_1.DatumVreme(radnovreme.od),
                        do: new DatumVreme_1.DatumVreme(radnovreme.do)
                    };
            }
        });
    }
    /*
        Ako nastavnik ima neotkazan i neodbijen cas u zadatom intervalu, vraca objekat:
        {
            ucenik: string
            od: DatumVreme
            do: DatumVreme
            predmet: string
            potvrdjen: number
        }
    */
    static nastavnikImaCas(kime, od, do_) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.findOne({ nastavnik: kime, odbijen: null, otkazan: null, $expr: { $or: [
                        {
                            $and: [{ $gte: [od.broj(), "$od"] }, { $lt: [od.broj(), "$do"] }]
                        },
                        {
                            $and: [{ $lte: [do_.broj(), "$do"] }, { $gt: [do_.broj(), "$od"] }]
                        }
                    ] } });
            if (ret)
                return {
                    ucenik: ret.ucenik,
                    od: new DatumVreme_1.DatumVreme(ret.od),
                    do: new DatumVreme_1.DatumVreme(ret.do),
                    predmet: ret.predmet,
                    potvrdjen: ret.potvrdjen
                };
            else
                return null;
        });
    }
    static nastavnikTerminStatus(kime, datum, slot, detaljno) {
        return __awaiter(this, void 0, void 0, function* () {
            let od = datum.dodajVreme(slot * 30);
            let do_ = od.dodajVreme(30);
            let ret = yield this.nastavnikImaCas(kime, od, do_);
            if (ret) {
                let slotOd = ret.od.slotOd();
                let slotDo = ret.do.slotDo();
                if (!ret.od.istiDan(ret.do))
                    slotDo += 24;
                let result = {
                    status: (ret.potvrdjen ? 4 : 3),
                    rb: slot - slotOd + 1,
                    duzina: slotDo - slotOd + 1,
                    tekst: ""
                };
                if (detaljno) {
                    let ucenik = yield DB.korisnikPoKime(ret.ucenik);
                    result.tekst = `${ucenik.ime} ${ucenik.prezime} (${ret.predmet})`;
                }
                return result;
            }
            if (od.proslost())
                return { status: 5, rb: 1, duzina: 1, tekst: "" }; //proslost
            ret = yield this.nastavnikNedostupan(kime, od, do_);
            if (ret)
                return {
                    status: 1, //Nedostupan
                    rb: 1,
                    duzina: 1,
                    tekst: ""
                };
            ret = yield this.nastavnikRadi(kime, od, do_);
            if (ret)
                return {
                    status: 2,
                    rb: 1,
                    duzina: 1,
                    tekst: ""
                };
            return {
                status: 0,
                rb: 1,
                duzina: 1,
                tekst: ""
            };
        });
    }
    static nastavnikTerminStatusZaDan(kime, dan, detaljno) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            let complete = 0;
            dan = dan.vreme(0);
            for (let i = 0; i < 48; i++)
                result.push(yield this.nastavnikTerminStatus(kime, dan, i, detaljno));
            return result;
        });
    }
    static zakazi(nastavnik, ucenik, od, do_, predmet, opis) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Cas_1.default.insertMany([
                {
                    ucenik: ucenik,
                    nastavnik: nastavnik,
                    od: od.broj(),
                    do: do_.broj(),
                    predmet: predmet,
                    opis: opis
                }
            ]);
            return "ok";
        });
    }
    static radnovreme(kime) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield DB.korisnikPoKime(kime);
            if (!ret || ret.tip != "Nastavnik" || !ret.radnovreme)
                return null;
            else
                return ret.radnovreme;
        });
    }
    static azurirajRadnovreme(kime, radnovreme) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.updateOne({ kime: kime }, { $set: { radnovreme: radnovreme } });
            if (ret.modifiedCount > 0)
                return "ok";
            else
                return "Greska u bazi.";
        });
    }
    static azurirajNedostupnost(kime, nedostupnost) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.updateOne({ kime: kime }, { $push: { nedostupnost: nedostupnost } });
            if (ret.modifiedCount > 0)
                return "ok";
            else
                return "Greska u bazi.";
        });
    }
    static nastavnikCasovi(kime, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.aggregate([
                {
                    $match: {
                        nastavnik: kime,
                        do: { $gt: DatumVreme_1.DatumVreme.sada().broj() },
                        potvrdjen: { $ne: null },
                        odbijen: null,
                        otkazan: null
                    }
                },
                {
                    $lookup: {
                        from: "korisnici",
                        localField: "ucenik",
                        foreignField: "kime",
                        as: "ucenikPodaci"
                    }
                }, {
                    $unwind: {
                        path: "$ucenikPodaci"
                    }
                },
                {
                    $limit: limit
                },
                {
                    $project: {
                        _id: 0,
                        od: "$od",
                        do: "$do",
                        predmet: "$predmet",
                        ime: "$ucenikPodaci.ime",
                        prezime: "$ucenikPodaci.prezime",
                    }
                },
                {
                    $sort: {
                        od: 1
                    }
                }
            ]);
            return ret;
        });
    }
    static otkaziCas(nastavnik, datum, obrazlozenje) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.updateOne({
                nastavnik: nastavnik,
                od: datum.broj(),
                potvrdjen: { $ne: null },
                odbijen: null,
                otkazan: null
            }, {
                $set: { otkazan: DatumVreme_1.DatumVreme.sada().broj(), komentarNastavnik: obrazlozenje }
            });
            if (ret.modifiedCount > 0)
                return "ok";
            else
                return "Cas ne postoji u bazi.";
        });
    }
    static nastavnikZahtevi(nastavnik) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.aggregate([
                {
                    $match: {
                        nastavnik: nastavnik,
                        od: { $gt: DatumVreme_1.DatumVreme.sada().broj() },
                        potvrdjen: { $eq: null },
                        odbijen: null,
                        otkazan: null
                    }
                },
                {
                    $lookup: {
                        from: "korisnici",
                        localField: "ucenik",
                        foreignField: "kime",
                        as: "ucenikPodaci"
                    }
                },
                {
                    $unwind: {
                        path: "$ucenikPodaci"
                    }
                },
                {
                    $lookup: {
                        from: "casovi",
                        localField: "ucenik",
                        foreignField: "ucenik",
                        as: "ucenikOcene"
                    }
                },
                {
                    $project: {
                        od: "$od",
                        do: "$do",
                        predmet: "$predmet",
                        ime: "$ucenikPodaci.ime",
                        prezime: "$ucenikPodaci.prezime",
                        opis: "$opis",
                        ocena: {
                            $avg: "$ucenikOcene.ocenaNastavnik"
                        },
                        brojOcena: {
                            $size: {
                                $filter: {
                                    input: "$ucenikOcene.ocenaNastavnik",
                                    as: "ucenikOcena",
                                    cond: { $ne: ["$$ucenikOcena", null] }
                                }
                            }
                        }
                    }
                }
            ]);
            return ret;
        });
    }
    static nastavnikOdgovor(nastavnik, od, obrazlozenje) {
        return __awaiter(this, void 0, void 0, function* () {
            let vreme = DatumVreme_1.DatumVreme.sada().broj();
            let set = obrazlozenje ? { odbijen: vreme } : { potvrdjen: vreme };
            if (obrazlozenje)
                set.komentarNastavnik = obrazlozenje;
            let ret = yield Cas_1.default.updateOne({
                nastavnik: nastavnik,
                od: od.broj(),
                potvrdjen: null,
                odbijen: null,
                otkazan: null
            }, {
                $set: set
            });
            if (ret.modifiedCount > 0)
                return "ok";
            else
                return "Nije pronadjen cas.";
        });
    }
    static nastavnikUcenici(nastavnik) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.aggregate([
                {
                    $match: {
                        nastavnik: nastavnik,
                        potvrdjen: { $ne: null },
                        odbijen: null,
                        otkazan: null,
                        od: { $lt: DatumVreme_1.DatumVreme.sada().broj() }
                    }
                },
                {
                    $group: {
                        _id: {
                            ucenik: "$ucenik"
                        }
                    }
                },
                {
                    $lookup: {
                        from: "korisnici",
                        localField: "_id.ucenik",
                        foreignField: "kime",
                        as: "podaci"
                    }
                },
                {
                    $unwind: {
                        path: "$podaci"
                    }
                },
                {
                    $project: {
                        kime: "$podaci.kime",
                        ime: "$podaci.ime",
                        prezime: "$podaci.prezime"
                    }
                }
            ]);
            return ret;
        });
    }
    static nastavnikDosije(nastavnik, ucenik) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.aggregate([
                {
                    $match: {
                        nastavnik: nastavnik,
                        ucenik: ucenik,
                        potvrdjen: { $ne: null },
                        odbijen: null,
                        otkazan: null,
                        do: { $lt: DatumVreme_1.DatumVreme.sada().broj() }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        predmet: "$predmet",
                        od: "$od",
                        do: "$do",
                        ocena: "$ocenaNastavnik",
                        komentar: "$komentarNastavnik"
                    }
                },
                {
                    $sort: {
                        od: -1
                    }
                }
            ]);
            return ret;
        });
    }
    static nastavnikRecenzija(nastavnik, od, ocena, komentar) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.updateOne({
                nastavnik: nastavnik,
                od: od.broj(),
                potvrdjen: { $ne: null },
                odbijen: null,
                otkazan: null,
                ocenaNastavnik: null,
                komentarNastavnik: null
            }, {
                $set: {
                    ocenaNastavnik: ocena,
                    komentarNastavnik: komentar
                }
            });
            if (ret.modifiedCount > 0)
                return "ok";
            else
                return "Nije pronadjen cas.";
        });
    }
    static cas(nastavnik, od) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.findOne({
                nastavnik: nastavnik,
                od: od.broj(),
                odbijen: null,
                otkazan: null
            });
            return ret;
        });
    }
    static ucenikCasovi(kime) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.aggregate([
                {
                    $match: {
                        ucenik: kime,
                        do: { $gt: DatumVreme_1.DatumVreme.sada().broj() },
                        potvrdjen: { $ne: null },
                        odbijen: null,
                        otkazan: null
                    }
                },
                {
                    $lookup: {
                        from: "korisnici",
                        localField: "nastavnik",
                        foreignField: "kime",
                        as: "nastavnikPodaci"
                    }
                }, {
                    $unwind: {
                        path: "$nastavnikPodaci"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        nastavnik: "$nastavnik",
                        od: "$od",
                        do: "$do",
                        predmet: "$predmet",
                        opis: "$opis",
                        ime: "$nastavnikPodaci.ime",
                        prezime: "$nastavnikPodaci.prezime",
                    }
                },
                {
                    $sort: {
                        od: 1
                    }
                }
            ]);
            return ret;
        });
    }
    static ucenikArhiva(ucenik) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.aggregate([
                {
                    $match: {
                        ucenik: ucenik,
                        potvrdjen: { $ne: null },
                        odbijen: null,
                        otkazan: null,
                        do: { $lt: DatumVreme_1.DatumVreme.sada().broj() }
                    }
                },
                {
                    $lookup: {
                        from: "korisnici",
                        localField: "nastavnik",
                        foreignField: "kime",
                        as: "nastavnikPodaci"
                    }
                },
                {
                    $unwind: {
                        path: "$nastavnikPodaci"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        nastavnik: "$nastavnik",
                        od: "$od",
                        do: "$do",
                        predmet: "$predmet",
                        ime: "$nastavnikPodaci.ime",
                        prezime: "$nastavnikPodaci.prezime",
                        komentar: "$komentarNastavnik",
                        ocenjen: { $or: [{ $ne: ["$ocenaUcenik", null] }, { $ne: ["$komentarUcenik", null] }] }
                    }
                },
                {
                    $sort: {
                        od: -1
                    }
                }
            ]);
            return ret;
        });
    }
    static ucenikRecenzija(nastavnik, od, ocena, komentar) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.updateOne({
                nastavnik: nastavnik,
                od: od.broj(),
                potvrdjen: { $ne: null },
                odbijen: null,
                otkazan: null,
                ocenaUcenik: null,
                komentarUcenik: null
            }, {
                $set: {
                    ocenaUcenik: ocena,
                    komentarUcenik: komentar
                }
            });
            if (ret.modifiedCount > 0)
                return "ok";
            else
                return "Nije pronadjen cas.";
        });
    }
    static dodajObavestenje(kime, sadrzaj) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Obavestenje_1.default.insertMany([{
                    kime: kime,
                    datumvreme: DatumVreme_1.DatumVreme.sada().broj(),
                    sadrzaj: sadrzaj
                }]);
            return "ok";
        });
    }
    static obavestenja(kime, od, do_) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Obavestenje_1.default.aggregate([
                {
                    $match: {
                        kime: kime,
                        datumvreme: { $lt: do_.broj() }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        datumvreme: "$datumvreme",
                        sadrzaj: "$sadrzaj",
                        novo: { $gt: ["$datumvreme", od.broj()] }
                    }
                },
                {
                    $sort: {
                        datumvreme: -1
                    }
                },
                {
                    $limit: 2
                }
            ]);
            if (ret.length == 0)
                return ret;
            let poslednji = ret[ret.length - 1].datumvreme;
            let presek = yield Obavestenje_1.default.find({ datumvreme: poslednji, kime: kime });
            while (ret.length > 0 && ret[ret.length - 1].datumvreme == poslednji)
                ret.pop();
            ret.push(...presek);
            return ret;
        });
    }
    static prijava(kime) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.updateOne({
                kime: kime
            }, {
                $set: {
                    prijava: DatumVreme_1.DatumVreme.sada().broj()
                }
            });
            if (ret.modifiedCount > 0)
                return "ok";
            else
                return "Greska u bazi.";
        });
    }
    static brojOdrzanihCasova(dana) {
        return __awaiter(this, void 0, void 0, function* () {
            let do_ = DatumVreme_1.DatumVreme.sada();
            let od = do_.dodajDan(-dana);
            let ret = yield Cas_1.default.aggregate([
                {
                    $match: {
                        potvrdjen: { $ne: null },
                        odbijen: null,
                        otkazan: null,
                        do: { $lt: do_.broj() },
                        od: { $gt: od.broj() }
                    }
                },
                {
                    $count: "broj"
                }
            ]);
            if (ret.length == 0)
                return 0;
            return ret[0].broj;
        });
    }
}
exports.DB = DB;
DB.prosecnaOcenaPipeline = [
    {
        $lookup: {
            from: 'casovi',
            localField: 'kime',
            foreignField: 'nastavnik',
            as: 'casovi'
        }
    },
    {
        $addFields: {
            ocena: {
                $avg: '$casovi.ocenaUcenik'
            }
        }
    }
];
