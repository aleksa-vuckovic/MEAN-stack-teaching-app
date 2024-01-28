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
            return "ok";
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
                    profil: utils_1.Utils.slikaUrl(ret.profil),
                    aktivan: ret.aktivan
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
            let ret = yield Korisnik_1.default.findOne({ kime: kime, tip: "Nastavnik", odobren: true });
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
                    cv: utils_1.Utils.slikaUrl(ret.cv),
                    aktivan: ret.aktivan
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
                    $match: { $expr: { $and: [
                                { $gt: [do_.date, "$nedostupnost.od"] },
                                { $lt: [od.date, "$nedostupnost.do"] }
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
            od: vreme u milisekundama,
            do: vreme u milisekundama
        }
    */
    static nastavnikRadi(kime, od, do_) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.findOne({ kime: kime, tip: "Nastavnik", radnovreme: { $exists: true } });
            if (!ret)
                return null;
            let radnovreme = ret.radnovreme;
            do_ = do_.neposrednoDo();
            while (!od.istiDan(do_)) {
                let sati = radnovreme[od.danUNedelji()];
                if (od.sirovoVreme() < sati.od || sati.do < 24 * 60 * 60 * 1000)
                    return {
                        od: sati.od,
                        do: sati.do
                    };
                od = od.dodajDan(1).pocetakDana();
            }
            let sati = radnovreme[od.danUNedelji()];
            if (od.sirovoVreme() < sati.od || do_.sirovoVreme() >= sati.do)
                return {
                    od: sati.od,
                    do: sati.do
                };
            return null;
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
            let ret = yield Cas_1.default.findOne({
                nastavnik: kime,
                odbijen: null,
                otkazan: null,
                $expr: { $and: [
                        { $gt: [do_.date, "$od"] },
                        { $lt: [od.date, "$do"] }
                    ] }
            });
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
    //provarava status termina koji pocinje u "od" i koji traje "trajanje" milisekundi
    static nastavnikTerminStatus(kime, od, trajanje, detaljno) {
        return __awaiter(this, void 0, void 0, function* () {
            let do_ = od.dodajMili(trajanje);
            let ret = yield this.nastavnikImaCas(kime, od, do_);
            if (ret) {
                let slotOd = Math.floor((ret.od.broj() - od.broj()) / trajanje);
                let slotDo = Math.floor((ret.do.broj() - 1 - od.broj()) / trajanje);
                let result = {
                    status: (ret.potvrdjen ? 4 : 3),
                    rb: -slotOd + 1,
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
    static nastavnikTerminiStatus(kime, od, trajanje, broj, detaljno) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            for (let i = 0; i < broj; i++)
                result.push(yield this.nastavnikTerminStatus(kime, od.dodajMili(i * trajanje), trajanje, detaljno));
            return result;
        });
    }
    static zakazi(nastavnik, ucenik, od, do_, predmet, opis) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Cas_1.default.insertMany([
                {
                    ucenik: ucenik,
                    nastavnik: nastavnik,
                    od: od.date,
                    do: do_.date,
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
                        do: { $gt: DatumVreme_1.DatumVreme.sada().date },
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
                        _id: 1,
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
    static otkaziCas(id, obrazlozenje) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.updateOne({
                _id: id,
                potvrdjen: { $ne: null },
                odbijen: null,
                otkazan: null
            }, {
                $set: { otkazan: DatumVreme_1.DatumVreme.sada().date, komentarNastavnik: obrazlozenje }
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
                        od: { $gt: DatumVreme_1.DatumVreme.sada().date },
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
                        _id: 1,
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
    static nastavnikOdgovor(id, obrazlozenje) {
        return __awaiter(this, void 0, void 0, function* () {
            let vreme = DatumVreme_1.DatumVreme.sada().date;
            let set = obrazlozenje ? { odbijen: vreme } : { potvrdjen: vreme };
            if (obrazlozenje)
                set.komentarNastavnik = obrazlozenje;
            let ret = yield Cas_1.default.updateOne({
                _id: id,
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
                        od: { $lt: DatumVreme_1.DatumVreme.sada().date }
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
                        do: { $lt: DatumVreme_1.DatumVreme.sada().date }
                    }
                },
                {
                    $project: {
                        _id: 1,
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
    static nastavnikRecenzija(id, ocena, komentar) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.updateOne({
                _id: id,
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
    static cas(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.findOne({
                _id: id,
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
                        do: { $gt: DatumVreme_1.DatumVreme.sada().date },
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
                        do: { $lt: DatumVreme_1.DatumVreme.sada().date }
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
                        _id: 1,
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
    static ucenikRecenzija(id, ocena, komentar) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.updateOne({
                _id: id,
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
                    datumvreme: DatumVreme_1.DatumVreme.sada().date,
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
                        datumvreme: { $lt: do_.date }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        datumvreme: "$datumvreme",
                        sadrzaj: "$sadrzaj",
                        novo: { $gt: ["$datumvreme", od.date] }
                    }
                },
                {
                    $sort: {
                        datumvreme: -1
                    }
                },
                {
                    $limit: 5
                }
            ]);
            return ret;
            /*
            if (ret.length == 0) return ret;
            let poslednji = ret[ret.length-1].datumvreme
            let presek = await obavestenjeModel.find({datumvreme: poslednji, kime: kime})
            while(ret.length > 0 && ret[ret.length-1].datumvreme == poslednji) ret.pop()
            ret.push(...presek)
            return ret
            */
        });
    }
    static prijava(kime) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.updateOne({
                kime: kime
            }, {
                $set: {
                    prijava: DatumVreme_1.DatumVreme.sada().date
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
                        do: { $lt: do_.date },
                        od: { $gt: od.date }
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
    static korisniciPretraga(pretraga) {
        return __awaiter(this, void 0, void 0, function* () {
            let upit = {
                tip: { $in: ['Ucenik', 'Nastavnik'] },
                odobren: true
            };
            if (pretraga.ime && pretraga.ime != "")
                upit.ime = { $regex: new RegExp(pretraga.ime, 'i') };
            if (pretraga.prezime && pretraga.prezime != "")
                upit.prezime = { $regex: new RegExp(pretraga.prezime, 'i') };
            if (pretraga.mejl && pretraga.mejl != "")
                upit.mejl = { $regex: new RegExp(pretraga.mejl, 'i') };
            let sort = null;
            if (pretraga.sort && pretraga.sort != "") {
                sort = {};
                sort[pretraga.sort] = pretraga.opadajuce ? -1 : 1;
            }
            let projekcija = {
                tip: 1,
                kime: 1,
                ime: 1,
                prezime: 1,
                mejl: 1,
                _id: 0
            };
            let tmp = [
                {
                    $match: upit
                },
                {
                    $project: projekcija
                }
            ];
            if (sort)
                tmp.push({ $sort: sort });
            return yield Korisnik_1.default.aggregate(tmp);
        });
    }
    static korisnikAktivacija(kime, aktivan) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.updateOne({ kime: kime }, { $set: { aktivan: aktivan } });
            if (ret.modifiedCount > 0)
                return "ok";
            return "Greska u bazi.";
        });
    }
    static zahteviZaRegistraciju() {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.aggregate([
                {
                    $match: {
                        tip: "Nastavnik",
                        odobren: false,
                        aktivan: true
                    }
                },
                {
                    $project: {
                        _id: 0,
                        kime: 1,
                        ime: 1,
                        prezime: 1,
                        pol: 1,
                        telefon: 1,
                        mejl: 1,
                        profil: { $concat: [utils_1.Utils.slikaPrefiks(), "$profil"] },
                        predmeti: 1,
                        uzrasti: 1,
                        saznao: 1,
                        cv: { $concat: [utils_1.Utils.slikaPrefiks(), "$cv"] }
                    }
                }
            ]);
            return ret;
        });
    }
    static odobrenje(kime, odobren) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.updateOne({ kime: kime }, { $set: { odobren: odobren } });
            if (ret.modifiedCount > 0)
                return "ok";
            else
                return "Greska u bazi.";
        });
    }
    static predlozeniPredmeti() {
        return __awaiter(this, void 0, void 0, function* () {
            let predmeti = yield DB.sviPredmeti();
            let ret = yield Korisnik_1.default.aggregate([
                {
                    $unwind: { path: "$predmeti" }
                },
                {
                    $group: {
                        _id: "$predmeti"
                    }
                },
                {
                    $match: {
                        _id: { $nin: predmeti }
                    }
                }
            ]);
            let result = [];
            for (let elem of ret)
                result.push(elem._id);
            return result;
        });
    }
    static dodajPredmet(predmet) {
        return __awaiter(this, void 0, void 0, function* () {
            let predmeti = yield DB.sviPredmeti();
            if (predmeti.indexOf(predmet) != -1)
                return "Predmet vec postoji u bazi.";
            let ret = yield Podatak_1.default.updateOne({ podatak: "predmeti" }, { $push: { vrednosti: predmet } });
            if (ret.modifiedCount > 0)
                return "ok";
            else
                return "Greska u bazi.";
        });
    }
    static ukloniPredmet(predmet) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Podatak_1.default.updateOne({ podatak: "predmeti" }, { $pull: { vrednosti: predmet } });
            if (ret.modifiedCount > 0)
                return "ok";
            else
                return "Greska u bazi.";
        });
    }
    //Statistika
    static brojNastavnikaPoPredmetu() {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.aggregate([
                {
                    $match: {
                        tip: 'Nastavnik',
                        odobren: true,
                        aktivan: true
                    }
                },
                {
                    $unwind: { path: "$predmeti" }
                },
                {
                    $group: {
                        _id: "$predmeti",
                        broj: {
                            $count: {}
                        }
                    }
                },
                {
                    $project: {
                        predmet: "$_id",
                        broj: 1
                    }
                },
                {
                    $sort: {
                        broj: -1
                    }
                }
            ]);
            return ret;
        });
    }
    static brojNastavnikaPoUzrastu() {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.aggregate([
                {
                    $match: {
                        tip: 'Nastavnik',
                        odobren: true,
                        aktivan: true
                    }
                },
                {
                    $unwind: { path: "$uzrasti" }
                },
                {
                    $group: {
                        _id: "$uzrasti",
                        broj: {
                            $count: {}
                        }
                    }
                },
                {
                    $project: {
                        uzrast: "$_id",
                        broj: 1
                    }
                },
                {
                    $sort: {
                        broj: -1
                    }
                }
            ]);
            return ret;
        });
    }
    static brojKorisnikaPoPolu() {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.aggregate([
                {
                    $match: {
                        odobren: true,
                        aktivan: true
                    }
                },
                {
                    $group: {
                        _id: {
                            pol: "$pol",
                            tip: "$tip"
                        },
                        broj: {
                            $count: {}
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        pol: "$_id.pol",
                        tip: "$_id.tip",
                        broj: 1
                    }
                }
            ]);
            return ret;
        });
    }
    static brojCasovaPoDanuNedelje(od, do_) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.aggregate([
                {
                    $match: {
                        potvrdjen: { $ne: null },
                        odbijen: null,
                        otkazan: null,
                        od: { $gte: od.date, $lte: do_.date }
                    }
                },
                {
                    $project: {
                        //dan: {$mod: [{$add: [{$floor: {$divide: ["$od", Math.pow(2, DatumVreme.vremeShift)]}}, 3]}, 7]}
                        dan: { $mod: [{ $add: [{ $dayOfWeek: "$od" }, 2] }, 7] }
                    }
                },
                {
                    $group: {
                        _id: "$dan",
                        broj: {
                            $count: {}
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        dan: "$_id",
                        broj: 1
                    }
                },
                {
                    $sort: {
                        dan: 1
                    }
                }
            ]);
            return ret;
        });
    }
    static brojCasovaPoSatu(od, do_) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.aggregate([
                {
                    $match: {
                        potvrdjen: { $ne: null },
                        odbijen: null,
                        otkazan: null,
                        od: { $gte: od.date, $lte: do_.date }
                    }
                },
                {
                    $project: {
                        //sat: {$floor: {$divide: [{$mod: ["$od", Math.pow(2, DatumVreme.vremeShift)]}, 60]}}
                        sat: { $hour: { date: "$od", timezone: "+01" } }
                    }
                },
                {
                    $group: {
                        _id: "$sat",
                        broj: {
                            $count: {}
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        sat: "$_id",
                        broj: 1
                    }
                }
            ]);
            return ret;
        });
    }
    static angazovanjeNastavnikaPoMesecima(od, do_) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Korisnik_1.default.aggregate([
                {
                    $match: {
                        tip: "Nastavnik",
                        odobren: true,
                        aktivan: true
                    }
                },
                {
                    $lookup: {
                        from: "casovi",
                        localField: "kime",
                        foreignField: "nastavnik",
                        as: "casovi"
                    }
                },
                {
                    $unwind: { path: "$casovi" }
                },
                {
                    $match: {
                        "casovi.od": { $gte: od.date, $lte: do_.date },
                        "casovi.potvrdjen": { $ne: null },
                        "casovi.odbijen": null,
                        "casovi.otkazan": null
                    }
                },
                {
                    $project: {
                        kime: "$kime",
                        ime: "$ime",
                        prezime: "$prezime",
                        mesec: { $month: "$casovi.od" }
                        /*
                        mesec: {$month: {
                            $dateAdd: {
                                startDate: new Date('2020-12-31'),
                                amount: {$floor:{$divide:["$casovi.od", 4096]}},
                                unit: 'day'
                            }
                        }}
                        */
                    }
                },
                {
                    $group: {
                        _id: {
                            kime: "$kime",
                            ime: "$ime",
                            prezime: "$prezime",
                            mesec: "$mesec"
                        },
                        broj: { $count: {} }
                    }
                },
                {
                    $group: {
                        _id: {
                            kime: "$_id.kime",
                            ime: "$_id.ime",
                            prezime: "$_id.prezime"
                        },
                        podaci: {
                            $push: {
                                mesec: "$_id.mesec",
                                broj: "$broj"
                            }
                        },
                        ukupno: { $sum: "$broj" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        ime: { $concat: ["$_id.ime", " ", "$_id.prezime"] },
                        podaci: "$podaci",
                        ukupno: "$ukupno"
                    }
                },
                {
                    $sort: {
                        ukupno: -1
                    }
                },
                {
                    $limit: 10
                }
            ]);
            return ret;
        });
    }
    static brojCasovaPoPredmetuIPolu(predmeti, pol, od, do_) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield Cas_1.default.aggregate([
                {
                    $match: {
                        od: { $gte: od.date, $lte: do_.date },
                        potvrdjen: { $ne: null },
                        odbijen: null,
                        otkazan: null,
                        predmet: { $in: predmeti }
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
                    $unwind: { path: "$ucenikPodaci" }
                },
                {
                    $match: {
                        "ucenikPodaci.pol": pol
                    }
                },
                {
                    $count: "broj"
                }
            ]);
            if (ret.length > 0)
                return ret[0].broj;
            else
                return 0;
        });
    }
    /*
    static async fixDates(): Promise<string> {
        await obavestenjeModel.updateMany({
            datumvreme: {$ne: null}
        },
        [{
            $set: {
                datumvreme: {
                    $dateAdd: {
                        startDate: {
                            $dateAdd: {
                                startDate: new Date('2020-12-31T00:00+01:00'),
                                amount: {$floor:{$divide:["$datumvreme", 4096]}},
                                unit: 'day'
                            }
                        },
                        amount: {$mod: ["$datumvreme", 4096]},
                        unit: 'minute'
                    }
                }
            }
        }])
        return "ok"
    }*/
    static nastavniciOtkazivanjeOdbijanje() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Korisnik_1.default.aggregate([
                {
                    $match: {
                        tip: "Nastavnik",
                        aktivan: true,
                        odobren: true
                    }
                },
                {
                    $lookup: {
                        from: "casovi",
                        let: { kime: "$kime" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$nastavnik", "$$kime"] },
                                            { $lt: ["$do", new Date()] }
                                        ]
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    otkazano: {
                                        $sum: {
                                            $cond: {
                                                if: { $ne: ["$otkazan", null] },
                                                then: 1,
                                                else: 0
                                            }
                                        }
                                    },
                                    odbijeno: {
                                        $sum: {
                                            $cond: {
                                                if: { $ne: ["$odbijen", null] },
                                                then: 1,
                                                else: 0
                                            }
                                        }
                                    },
                                    odrzano: {
                                        $sum: {
                                            $cond: {
                                                if: { $and: [
                                                        { $ne: ["$potvrdjen", null] },
                                                        { $eq: ["$otkazan", null] }
                                                    ] },
                                                then: 1,
                                                else: 0
                                            }
                                        }
                                    }
                                }
                            }
                        ],
                        as: "podaci"
                    }
                },
                {
                    $unwind: { path: "$podaci" }
                },
                {
                    $project: {
                        kime: "$kime",
                        ime: "$ime",
                        prezime: "$prezime",
                        otkazano: "$podaci.otkazano",
                        odbijeno: "$podaci.odbijeno",
                        odrzano: "$podaci.odrzano",
                        procenat: {
                            $divide: ["$podaci.otkazano", { $add: ["$podaci.otkazano", "$podaci.odrzano"] }]
                        }
                    }
                },
                {
                    $sort: {
                        procenat: -1
                    }
                },
                {
                    $limit: 5
                }
            ]);
        });
    }
    static nastavnikOtkazivanja(kime) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Cas_1.default.aggregate([
                {
                    $match: {
                        nastavnik: kime,
                        otkazan: { $ne: null }
                    }
                },
                {
                    $project: {
                        x: "$otkazan",
                        y: {
                            $dateDiff: {
                                startDate: "$otkazan",
                                endDate: "$od",
                                unit: "minute"
                            }
                        }
                    }
                },
                {
                    $sort: {
                        x: 1
                    }
                }
            ]);
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
    },
    {
        $addFields: {
            ocena: {
                $cond: {
                    if: { $eq: ["$ocena", null] },
                    then: 0,
                    else: "$ocena"
                }
            }
        }
    }
];
