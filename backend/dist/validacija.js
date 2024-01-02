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
exports.Validacija = void 0;
const db_1 = require("./db");
const image_size_1 = __importDefault(require("image-size"));
const utils_1 = require("./utils");
const DatumVreme_1 = require("./DatumVreme");
let lozinkaRegex = /^(?=(.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z].{5,9}$/;
let telefonRegex = /^\+381( *\d){8,9}$/;
let mejlRegex = /^[a-zA-Z\d]+(\.[a-zA-Z\d]+)*@[a-zA-Z\d]+(\.[a-zA-Z\d]+)*$/;
let lozinkaPoruka = "Lozinka ne ispunjava uslove.";
let telefonPoruka = "Telefon ne ispunjava uslove.";
let mejlPoruka = "Mejl ne ispunjava uslove.";
let tipoviSkola = ["Osnovna", "Gimnazija", "Srednja strucna", "Srednja umetnicka"];
let uzrasti = ["Osnovna 1-4", "Osnovna 5-8", "Srednja"];
class Validacija {
    static lozinkaValidacija(lozinka) {
        if (!lozinkaRegex.test(lozinka))
            return lozinkaPoruka;
        else
            return "ok";
    }
    //Proverava sva polja u registraciji OSIM fajlova, i upisuje u izlaz
    static registracijaValidacija(ulaz, izlaz) {
        return __awaiter(this, void 0, void 0, function* () {
            //Zajednicka polja
            if (!ulaz || !ulaz.kime || ulaz.kime == "" ||
                !ulaz.lozinka ||
                !ulaz.pitanje || ulaz.pitanje == "" ||
                !ulaz.odgovor || ulaz.odogovor == "" ||
                !ulaz.ime || ulaz.ime == "" ||
                !ulaz.prezime || ulaz.prezime == "" ||
                !ulaz.tip || ulaz.tip == "" ||
                !ulaz.pol || ulaz.pol == "" ||
                !ulaz.adresa || ulaz.adresa == "" ||
                !ulaz.telefon || ulaz.telefon == "" ||
                !ulaz.mejl || ulaz.mejl == "" ||
                !ulaz.tip || ulaz.tip == "")
                return "Nedostaju informacije.";
            else if (!lozinkaRegex.test(ulaz.lozinka))
                return lozinkaPoruka;
            else if (!telefonRegex.test(ulaz.telefon))
                return telefonPoruka;
            else if (!mejlRegex.test(ulaz.mejl))
                return mejlPoruka;
            else if (ulaz.tip != "Ucenik" && ulaz.tip != "Nastavnik")
                return "Tip ne postoji.";
            else if (ulaz.pol != "M" && ulaz.pol != "Z")
                return "Pol ne postoji.";
            izlaz.kime = ulaz.kime;
            izlaz.lozinka = ulaz.lozinka;
            izlaz.pitanje = ulaz.pitanje;
            izlaz.odgovor = ulaz.odgovor;
            izlaz.ime = ulaz.ime;
            izlaz.prezime = ulaz.prezime;
            izlaz.tip = ulaz.tip;
            izlaz.pol = ulaz.pol;
            izlaz.adresa = ulaz.adresa;
            izlaz.telefon = ulaz.telefon;
            izlaz.telefon = ulaz.telefon;
            izlaz.mejl = ulaz.mejl;
            izlaz.tip = ulaz.tip;
            if (izlaz.tip == "Ucenik") {
                //Provera polja za ucenika
                ulaz.razred = parseInt(ulaz.razred);
                if (!ulaz.skola || ulaz.skola == "" ||
                    !ulaz.razred || isNaN(ulaz.razred))
                    return "Nedostaju podaci za ucenika.";
                else if (tipoviSkola.indexOf(ulaz.skola) == -1)
                    return "Tip skole ne postoji.";
                else if (ulaz.razred < 1 || ulaz.razred > 8 || ulaz.skola != "Osnovna" && ulaz.razred > 4)
                    return "Razred izvan opsega.";
                izlaz.skola = ulaz.skola;
                izlaz.razred = ulaz.razred;
            }
            else if (izlaz.tip == "Nastavnik") {
                if (!ulaz.predmeti)
                    izlaz.predmeti = [];
                else if (!Array.isArray(ulaz.predmeti))
                    izlaz.predmeti = [ulaz.predmeti];
                else
                    izlaz.predmeti = ulaz.predmeti;
                if (!ulaz.uzrasti)
                    izlaz.uzrasti = [];
                else if (!Array.isArray(ulaz.uzrasti))
                    izlaz.uzrasti = [ulaz.uzrasti];
                else
                    izlaz.uzrasti = ulaz.uzrasti;
                if (!ulaz.saznao)
                    izlaz.saznao = "";
                else
                    izlaz.saznao = ulaz.saznao;
            }
            let ret = yield db_1.DB.korisnikPoKime(izlaz.kime);
            if (ret)
                return "Korisnicko ime vec postoji.";
            ret = yield db_1.DB.korisnikPoMejlu(izlaz.mejl);
            if (ret)
                return "Mejl je zauzet.";
            else
                return "ok";
        });
    }
    static profilValidacija(fajl) {
        if (!fajl)
            return "ok";
        let tip = fajl.mimetype;
        if (!tip.startsWith("image/"))
            return "Nedozvoljeni tip fajla.";
        tip = tip.split("/")[1];
        if (["png", "jpg", "jpeg"].indexOf(tip) == -1)
            return "Nedozvoljeni tip fajla.";
        let dimenzije = (0, image_size_1.default)(fajl.buffer);
        if (dimenzije.width && dimenzije.width > 300 || dimenzije.height && dimenzije.height > 300)
            return "Prevelika slika.";
        return "ok";
    }
    static cvValidacija(fajl) {
        if (!fajl)
            return "Fajl je obavezan.";
        let tip = fajl.mimetype.split("/")[1];
        if (tip != "pdf")
            return "Tip CV fajla mora biti pdf.";
        if (fajl.size > 3 * 1024 * 1024)
            return "Velicina fajla je maksimalno 3MB.";
        return "ok";
    }
    static profilAzuriranjeValidacija(ulaz, izlaz, kor) {
        return __awaiter(this, void 0, void 0, function* () {
            //ime, prezime, mejl, adresa, telefon
            if (ulaz.ime && ulaz.ime != "")
                izlaz.ime = ulaz.ime;
            if (ulaz.prezime && ulaz.prezime != "")
                izlaz.prezime = ulaz.prezime;
            if (ulaz.adresa && ulaz.adresa != "")
                izlaz.adresa = ulaz.adresa;
            if (ulaz.telefon && ulaz.telefon != "") {
                if (!telefonRegex.test(ulaz.telefon))
                    return telefonPoruka;
                else
                    izlaz.telefon = ulaz.telefon;
            }
            if (ulaz.mejl && ulaz.mejl != "") {
                if (!mejlRegex.test(ulaz.mejl))
                    return mejlPoruka;
                else
                    izlaz.mejl = ulaz.mejl;
            }
            else
                izlaz.mejl = kor.mejl;
            if (kor.tip == "Ucenik") {
                //skola, prelazak
                if (ulaz.skola && ulaz.skola != "") {
                    if (tipoviSkola.indexOf(ulaz.skola) == -1)
                        return "Tip skole ne postoji.";
                    else
                        izlaz.skola = ulaz.skola;
                }
                else
                    izlaz.skola = kor.skola;
                if (izlaz.skola != kor.skola) {
                    if (izlaz.skola == "Osnovna")
                        return "Nedozvoljena promena tipa skole.";
                    else if (kor.skola == "Osnovna" && (kor.razred != 8 || !ulaz.prelazak))
                        return "Nedozvoljena promena tipa skole.";
                }
                if (ulaz.prelazak && kor.skola != "Osnovna" && kor.razred == 4)
                    return "Nedozvoljen prelazak u sledeci razred.";
                if (ulaz.prelazak)
                    izlaz.razred = kor.razred % 8 + 1;
            }
            if (kor.tip == "Nastavnik") {
                //...
                if (!ulaz.predmeti)
                    izlaz.predmeti = [];
                else if (!Array.isArray(ulaz.predmeti))
                    izlaz.predmeti = [ulaz.predmeti];
                else
                    izlaz.predmeti = ulaz.predmeti;
                if (!ulaz.uzrasti)
                    izlaz.uzrasti = [];
                else if (!Array.isArray(ulaz.uzrasti))
                    izlaz.uzrasti = [ulaz.uzrasti];
                else
                    izlaz.uzrasti = ulaz.uzrasti;
            }
            let ret = yield db_1.DB.korisnikPoMejlu(izlaz.mejl);
            if (ret != null && ret.kime != kor.kime)
                return "Mejl je zauzet";
            else
                return "ok";
        });
    }
    static odgovaraUzrast(korisnik, nastavnik) {
        let uzrast = utils_1.Utils.uzrast(korisnik);
        if (nastavnik.uzrasti.indexOf(uzrast) == -1)
            return false;
        else
            return true;
    }
    static radnovremeValidacija(ulaz, izlaz) {
        if (!ulaz)
            return "Fale podaci.";
        let keys = ["0", "1", "2", "3", "4", "5", "6"];
        for (let key of keys) {
            if (!ulaz[key])
                return "Fale podaci.";
            if (ulaz[key].od > ulaz[key].do)
                return "Pocetak radnog vremena ne moze biti posle kraja.";
            if (ulaz[key].od < 0)
                return "Nevalidan pocetak radnog vremena.";
            if (ulaz[key].do > 24 * 60)
                return "Nevalidan kraj radnog vremena.";
            izlaz[key] = {
                od: ulaz[key].od,
                do: ulaz[key].do
            };
        }
        return "ok";
    }
    static nedostupnostValidacija(ulaz, izlaz) {
        if (!ulaz || !ulaz.od || !ulaz.do)
            return "Fale podaci.";
        let od = new DatumVreme_1.DatumVreme(ulaz.od);
        let do_ = new DatumVreme_1.DatumVreme(ulaz.do);
        if (od.broj() >= do_.broj())
            return "Datum do mora biti veci od datuma od.";
        izlaz.od = od.broj();
        izlaz.do = do_.broj();
        return "ok";
    }
    static otkazivanjeValidacija(ulaz, izlaz) {
        if (!ulaz || !ulaz.od || !ulaz.obrazlozenje)
            return "Nedostaju podaci.";
        izlaz.od = new DatumVreme_1.DatumVreme(ulaz.od);
        izlaz.obrazlozenje = ulaz.obrazlozenje;
        let sada = DatumVreme_1.DatumVreme.sada();
        if (izlaz.od.broj() < sada.broj())
            return "Ne mozete otkazati prosli cas.";
        else if (izlaz.od.razlikaUMinutima(sada) < 4 * 60)
            return "Ne mozete otkazati cas manje od 4 sata pre pocetka.";
        else
            return "ok";
    }
    static nastavnikRecenzijaValidacija(ulaz, izlaz, nastavnik) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ulaz || !ulaz.od)
                return "Nema dovoljno podataka.";
            else if (ulaz.do >= DatumVreme_1.DatumVreme.sada().broj())
                return "Ne mozete oceniti cas koji se jos nije zavrsio.";
            let cas = yield db_1.DB.cas(nastavnik, new DatumVreme_1.DatumVreme(ulaz.od));
            if (!cas)
                return "Trazeni cas ne postoji u bazi ili je otkazan/odbijen.";
            else if (cas.ocenaNastavnik || cas.komentarNastavnik)
                return "Cas je vec ocenjen.";
            if (ulaz.ocena)
                izlaz.ocena = ulaz.ocena;
            else
                izlaz.ocena = null;
            if (ulaz.komentar)
                izlaz.komentar = ulaz.komentar;
            else
                izlaz.komentar = "";
            izlaz.od = new DatumVreme_1.DatumVreme(ulaz.od);
            return "ok";
        });
    }
    static ucenikRecenzijaValidacija(ulaz, izlaz, ucenik) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!ulaz || !ulaz.od || !ulaz.nastavnik)
                return "Nema dovoljno podataka.";
            else if (ulaz.do >= DatumVreme_1.DatumVreme.sada().broj())
                return "Ne mozete oceniti cas koji se jos nije zavrsio.";
            let res = yield db_1.DB.cas(ulaz.nastavnik, new DatumVreme_1.DatumVreme(ulaz.od));
            if (!res)
                return "Trazeni cas ne postoji u bazi ili je otkazan/odbijen.";
            else if (res.ucenik != ucenik)
                return "Ne mozete oceniti cas koji nije odrzan vama.";
            else if (res.ocenaUcenik || res.komentarUcenik)
                return "Cas je vec ocenjen.";
            if (ulaz.ocena)
                izlaz.ocena = ulaz.ocena;
            else
                izlaz.ocena = null;
            if (ulaz.komentar)
                izlaz.komentar = ulaz.komentar;
            else
                izlaz.komentar = "";
            izlaz.od = new DatumVreme_1.DatumVreme(ulaz.od);
            izlaz.nastavnik = ulaz.nastavnik;
            return "ok";
        });
    }
}
exports.Validacija = Validacija;
