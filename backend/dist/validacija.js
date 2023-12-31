"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validacija = void 0;
const db_1 = require("./db");
const image_size_1 = __importDefault(require("image-size"));
const utils_1 = require("./utils");
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
        let greska = "";
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
            greska = "Nedostaju informacije.";
        else if (!lozinkaRegex.test(ulaz.lozinka))
            greska = lozinkaPoruka;
        else if (!telefonRegex.test(ulaz.telefon))
            greska = telefonPoruka;
        else if (!mejlRegex.test(ulaz.mejl))
            greska = mejlPoruka;
        else if (ulaz.tip != "Ucenik" && ulaz.tip != "Nastavnik")
            greska = "Tip ne postoji.";
        else if (ulaz.pol != "M" && ulaz.pol != "Z")
            greska = "Pol ne postoji.";
        else {
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
        }
        if (greska == "" && izlaz.tip == "Ucenik") {
            //Provera polja za ucenika
            ulaz.razred = parseInt(ulaz.razred);
            if (!ulaz.skola || ulaz.skola == "" ||
                !ulaz.razred || isNaN(ulaz.razred))
                greska = "Nedostaju podaci za ucenika.";
            else if (tipoviSkola.indexOf(ulaz.skola) == -1)
                greska = "Tip skole ne postoji.";
            else if (ulaz.razred < 1 || ulaz.razred > 8 || ulaz.skola != "Osnovna" && ulaz.razred > 4)
                greska = "Razred izvan opsega.";
            else {
                izlaz.skola = ulaz.skola;
                izlaz.razred = ulaz.razred;
            }
        }
        else if (greska == "" && izlaz.tip == "Nastavnik") {
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
        return new Promise((resolve, reject) => {
            if (greska != "")
                resolve(greska);
            else
                db_1.DB.korisnikPoKime(izlaz.kime).then(res => {
                    if (res)
                        resolve("Korisnicko ime vec postoji.");
                    else
                        db_1.DB.korisnikPoMejlu(izlaz.mejl).then(res => {
                            if (res)
                                resolve("Mejl je zauzet.");
                            else
                                resolve("ok");
                        });
                });
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
        //ime, prezime, mejl, adresa, telefon
        let greska = "";
        if (ulaz.ime && ulaz.ime != "")
            izlaz.ime = ulaz.ime;
        if (ulaz.prezime && ulaz.prezime != "")
            izlaz.prezime = ulaz.prezime;
        if (ulaz.adresa && ulaz.adresa != "")
            izlaz.adresa = ulaz.adresa;
        if (ulaz.telefon && ulaz.telefon != "") {
            if (!telefonRegex.test(ulaz.telefon))
                greska += telefonPoruka;
            else
                izlaz.telefon = ulaz.telefon;
        }
        if (ulaz.mejl && ulaz.mejl == "") {
            if (!mejlRegex.test(ulaz.mejl))
                greska += mejlPoruka;
            else
                izlaz.mejl = ulaz.mejl;
        }
        else
            izlaz.mejl = kor.mejl;
        if (greska == "" && kor.tip == "Ucenik") {
            //skola, prelazak
            if (ulaz.skola && ulaz.skola != "") {
                if (tipoviSkola.indexOf(ulaz.skola) == -1) {
                    greska += "Tip skole ne postoji. ";
                    izlaz.skola = kor.skola;
                }
                else
                    izlaz.skola = ulaz.skola;
            }
            else
                izlaz.skola = kor.skola;
            if (izlaz.skola != kor.skola) {
                if (izlaz.skola == "Osnovna")
                    greska += "Nedozvoljena promena tipa skole.";
                else if (kor.skola == "Osnovna" && (kor.razred != 8 || !ulaz.prelazak))
                    greska += "Nedozvoljena promena tipa skole.";
            }
            if (ulaz.prelazak && kor.skola != "Osnovna" && kor.razred == 4)
                greska += "Nedozvoljen prelazak u sledeci razred.";
            if (ulaz.prelazak)
                izlaz.razred = kor.razred % 8 + 1;
        }
        if (greska == "" && kor.tip == "Nastavnik") {
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
        return new Promise((resolve, reject) => {
            if (greska != "")
                resolve(greska);
            else {
                db_1.DB.korisnikPoMejlu(izlaz.mejl).then((res) => {
                    if (res != null && res.kime != kor.kime)
                        resolve("Mejl je zauzet");
                    else
                        resolve("ok");
                });
            }
        });
    }
    static odgovaraUzrast(korisnik, nastavnik) {
        let uzrast = utils_1.Utils.uzrast(korisnik);
        if (nastavnik.uzrasti.indexOf(uzrast) == -1)
            return false;
        else
            return true;
    }
    static radnovremeValidacija(radnovreme, izlaz) {
        if (!radnovreme)
            return "Fale podaci.";
        let keys = ["0", "1", "2", "3", "4", "5", "6"];
        for (let key of keys) {
            if (!radnovreme[key])
                return "Fale podaci.";
            if (radnovreme[key].od > radnovreme[key].do)
                return "Pocetak radnog vremena ne moze biti posle kraja.";
            if (radnovreme[key].od < 0)
                return "Nevalidan pocetak radnog vremena.";
            if (radnovreme[key].do > 24 * 60)
                return "Nevalidan kraj radnog vremena.";
            izlaz[key] = {
                od: radnovreme[key].od,
                do: radnovreme[key].do
            };
        }
        return "ok";
    }
}
exports.Validacija = Validacija;
