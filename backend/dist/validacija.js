"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validacija = void 0;
const db_1 = require("./db");
const image_size_1 = __importDefault(require("image-size"));
let lozinkaRegex = /^(?=(.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z].{5,9}$/;
let telefonRegex = /^\+381(\d){8,9}$/;
let mejlRegex = /^[a-zA-Z\d]+(\.[a-zA-Z\d]+)*@[a-zA-Z\d]+(\.[a-zA-Z\d]+)*$/;
let tipoviSkola = ["Osnovna", "Gimnazija", "Srednja strucna", "Srednja umetnicka"];
let uzrasti = ["Osnovna 1-4", "Osnovna 5-8", "Srednja"];
class Validacija {
    static registracijaValidacija(kor) {
        let ret = "";
        if (!kor.kime || kor.kime == "" ||
            !kor.lozinka ||
            !kor.pitanje || kor.pitanje == "" ||
            !kor.odgovor || kor.odogovor == "" ||
            !kor.ime || kor.ime == "" ||
            !kor.prezime || kor.prezime == "" ||
            !kor.tip || kor.tip == "" ||
            !kor.pol || kor.pol == "" ||
            !kor.adresa || kor.adresa == "" ||
            !kor.telefon || kor.telefon == "" ||
            !kor.mejl || kor.mejl == "" ||
            !kor.tip || kor.tip == "")
            ret = "Nedostaju informacije.";
        else if (!lozinkaRegex.test(kor.lozinka))
            ret = "Lozinka ne ispunjava uslove." + JSON.stringify(kor);
        else if (!telefonRegex.test(kor.telefon))
            ret = "Telefon ne ispunjava uslove.";
        else if (!mejlRegex.test(kor.mejl))
            ret = "Mejl ne ispunjava uslove.";
        else if (kor.tip != "Ucenik" && kor.tip != "Nastavnik")
            ret = "Tip ne postoji.";
        else if (kor.pol != "M" && kor.pol != "Z")
            ret = "Pol ne postoji.";
        return new Promise((resolve, reject) => {
            if (ret != "")
                resolve(ret);
            else
                db_1.DB.korisnikPoKime(kor.kime).then(res => {
                    if (res)
                        resolve("Korisnicko ime vec postoji.");
                    else
                        db_1.DB.korisnikPoMejlu(kor.mejl).then(res => {
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
    static ucenikValidacija(kor) {
        if (!kor.skola || kor.skola == "" ||
            !kor.razred)
            return "Nedostaju podaci.";
        kor.razred = parseInt(kor.razred);
        if (tipoviSkola.indexOf(kor.skola) == -1)
            return "Tip skole ne postoji.";
        if (kor.razred < 1 || kor.razred > 8 || kor.skola != "Osnovna" && kor.razred > 4)
            return "Razred izvan opsega.";
        return "ok";
    }
    static nastavnikValidacija(kor) {
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
}
exports.Validacija = Validacija;
