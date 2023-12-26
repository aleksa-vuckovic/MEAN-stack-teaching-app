import { DB } from "./db"
import fs from 'fs';
import path from 'path';
import imagesize from 'image-size';

let lozinkaRegex = /^(?=(.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z].{5,9}$/;
let telefonRegex = /^\+381(\d){8,9}$/;
let mejlRegex = /^[a-zA-Z\d]+(\.[a-zA-Z\d]+)*@[a-zA-Z\d]+(\.[a-zA-Z\d]+)*$/;

let tipoviSkola = ["Osnovna", "Gimnazija", "Srednja strucna", "Srednja umetnicka"]
let uzrasti = ["Osnovna 1-4", "Osnovna 5-8", "Srednja"]

export class Validacija {
    static lozinkaValidacija(lozinka: string) {
        if (!lozinkaRegex.test(lozinka)) return "Lozinka ne uspunjava uslove.";
        else return "ok";
    }

    static registracijaValidacija(kor: any): Promise<string> {
        let ret = "";
        if (!kor.kime || kor.kime == "" ||
            !kor.lozinka ||
            !kor.pitanje || kor.pitanje == "" ||
            !kor.odgovor || kor.odogovor == "" ||
            !kor.ime || kor.ime == "" ||
            !kor.prezime || kor.prezime == "" ||
            !kor.tip || kor.tip == "" ||
            !kor.pol || kor.pol=="" ||
            !kor.adresa || kor.adresa == "" ||
            !kor.telefon || kor.telefon == "" ||
            !kor.mejl || kor.mejl == "" ||
            !kor.tip || kor.tip == "") ret = "Nedostaju informacije.";
        else if (this.lozinkaValidacija(kor.lozinka) != "ok") ret = this.lozinkaValidacija(kor.lozinka);
        else if (!telefonRegex.test(kor.telefon)) ret = "Telefon ne ispunjava uslove.";
        else if (!mejlRegex.test(kor.mejl)) ret = "Mejl ne ispunjava uslove.";
        else if (kor.tip != "Ucenik" && kor.tip != "Nastavnik") ret = "Tip ne postoji.";
        else if (kor.pol != "M" && kor.pol != "Z") ret = "Pol ne postoji.";
        
        return new Promise((resolve, reject) => {
            if (ret != "") resolve(ret);
            else DB.korisnikPoKime(kor.kime).then(res => {
                if (res) resolve("Korisnicko ime vec postoji.");
                else DB.korisnikPoMejlu(kor.mejl).then(res => {
                    if (res) resolve("Mejl je zauzet.");
                    else resolve("ok");
                })
            });
        });
    }
    static profilValidacija(fajl: any) {
        if (!fajl) return "ok";
        let tip = fajl.mimetype;
        if (!tip.startsWith("image/")) return "Nedozvoljeni tip fajla.";
        tip = tip.split("/")[1]
        if (["png", "jpg", "jpeg"].indexOf(tip) == -1) return "Nedozvoljeni tip fajla.";
        let dimenzije = imagesize(fajl.buffer);
        if (dimenzije.width && dimenzije.width > 300 || dimenzije.height && dimenzije.height > 300) return "Prevelika slika."
        return "ok";
    }
    static ucenikValidacija(kor: any) {
        if (!kor.skola || kor.skola == "" ||
        !kor.razred) return "Nedostaju podaci.";

        kor.razred = parseInt(kor.razred)
        if (tipoviSkola.indexOf(kor.skola) == -1) return "Tip skole ne postoji.";
        if (kor.razred < 1 || kor.razred > 8 || kor.skola != "Osnovna" && kor.razred > 4) return "Razred izvan opsega."

        return "ok";
    }
    static nastavnikValidacija(kor: any) {
        if (!kor.predmeti) kor.predmeti = []
        else if (!Array.isArray(kor.predmeti)) kor.predmeti = [kor.predmeti];
        if (!kor.uzrasti) kor.uzrasti = []
        else if (!Array.isArray(kor.uzrasti)) kor.uzrasti = [kor.uzrasti];
        return "ok";
    }
    static cvValidacija(fajl: any) {
        if (!fajl) return "Fajl je obavezan.";
        let tip = fajl.mimetype.split("/")[1];
        if (tip != "pdf") return "Tip CV fajla mora biti pdf.";
        if (fajl.size > 3*1024*1024) return "Velicina fajla je maksimalno 3MB.";
        return "ok";
    }
}