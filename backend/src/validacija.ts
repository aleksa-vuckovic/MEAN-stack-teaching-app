import { DB } from "./db"
import fs from 'fs';
import path from 'path';
import imagesize from 'image-size';
import { Utils } from "./utils";
import { DatumVreme } from "./DatumVreme";

let lozinkaRegex = /^(?=(.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z].{5,9}$/;
let telefonRegex = /^\+381( *\d){8,9}$/;
let mejlRegex = /^[a-zA-Z\d]+(\.[a-zA-Z\d]+)*@[a-zA-Z\d]+(\.[a-zA-Z\d]+)*$/;
let lozinkaPoruka = "Lozinka ne ispunjava uslove.";
let telefonPoruka = "Telefon ne ispunjava uslove.";
let mejlPoruka = "Mejl ne ispunjava uslove.";

let tipoviSkola = ["Osnovna", "Gimnazija", "Srednja stručna", "Srednja umetnička"]
let uzrasti = ["Osnovna 1-4", "Osnovna 5-8", "Srednja"]

export class Validacija {
    static lozinkaValidacija(lozinka: string) {
        if (!lozinkaRegex.test(lozinka)) return lozinkaPoruka;
        else return "ok";
    }
    //Proverava sva polja u registraciji OSIM fajlova, i upisuje u izlaz
    static async registracijaValidacija(ulaz: any, izlaz: any): Promise<string> {
        //Zajednicka polja
        if (!ulaz || !ulaz.kime || ulaz.kime == "" ||
            !ulaz.lozinka ||
            !ulaz.pitanje || ulaz.pitanje == "" ||
            !ulaz.odgovor || ulaz.odogovor == "" ||
            !ulaz.ime || ulaz.ime == "" ||
            !ulaz.prezime || ulaz.prezime == "" ||
            !ulaz.tip || ulaz.tip == "" ||
            !ulaz.pol || ulaz.pol=="" ||
            !ulaz.adresa || ulaz.adresa == "" ||
            !ulaz.telefon || ulaz.telefon == "" ||
            !ulaz.mejl || ulaz.mejl == "" ||
            !ulaz.tip || ulaz.tip == "") return "Nedostaju informacije.";
        else if (!lozinkaRegex.test(ulaz.lozinka)) return lozinkaPoruka;
        else if (!telefonRegex.test(ulaz.telefon)) return telefonPoruka;
        else if (!mejlRegex.test(ulaz.mejl)) return mejlPoruka;
        else if (ulaz.tip != "Ucenik" && ulaz.tip != "Nastavnik") return "Tip ne postoji.";
        else if (ulaz.pol != "M" && ulaz.pol != "Z") return "Pol ne postoji.";

        izlaz.kime = ulaz.kime; izlaz.lozinka = ulaz.lozinka;
        izlaz.pitanje = ulaz.pitanje; izlaz.odgovor = ulaz.odgovor;
        izlaz.ime = ulaz.ime; izlaz.prezime = ulaz.prezime;
        izlaz.tip = ulaz.tip; izlaz.pol = ulaz.pol;
        izlaz.adresa = ulaz.adresa; izlaz.telefon = ulaz.telefon;
        izlaz.telefon = ulaz.telefon; izlaz.mejl = ulaz.mejl;
        izlaz.tip = ulaz.tip;
        
        if (izlaz.tip == "Ucenik") {
            //Provera polja za ucenika
            ulaz.razred = parseInt(ulaz.razred);
            if (!ulaz.skola || ulaz.skola == "" ||
            !ulaz.razred || isNaN(ulaz.razred)) return "Nedostaju podaci za učenika.";
            else if (tipoviSkola.indexOf(ulaz.skola) == -1) return "Tip škole ne postoji.";
            else if (ulaz.razred < 1 || ulaz.razred > 8 || ulaz.skola != "Osnovna" && ulaz.razred > 4) return "Razred izvan opsega.";
            
            izlaz.skola = ulaz.skola; izlaz.razred = ulaz.razred;
            
        }
        else if (izlaz.tip == "Nastavnik") {
            if (!ulaz.predmeti) izlaz.predmeti = []
            else if (!Array.isArray(ulaz.predmeti)) izlaz.predmeti = [ulaz.predmeti];
            else izlaz.predmeti = ulaz.predmeti;
            if (!ulaz.uzrasti) izlaz.uzrasti = []
            else if (!Array.isArray(ulaz.uzrasti)) izlaz.uzrasti = [ulaz.uzrasti];
            else izlaz.uzrasti = ulaz.uzrasti;
            if (!ulaz.saznao) izlaz.saznao = "";
            else izlaz.saznao = ulaz.saznao;
        }

        let ret = await DB.korisnikPoKime(izlaz.kime)
        if (ret) return "Korisničko ime vec postoji.";
        ret = await DB.korisnikPoMejlu(izlaz.mejl)
        if (ret) return "Mejl je zauzet.";
        else return "ok";
    }
    static profilValidacija(fajl: any): string {
        if (!fajl) return "ok";
        let tip = fajl.mimetype;
        if (!tip.startsWith("image/")) return "Nedozvoljeni tip fajla.";
        tip = tip.split("/")[1]
        if (["png", "jpg", "jpeg"].indexOf(tip) == -1) return "Nedozvoljeni tip fajla.";
        let dimenzije = imagesize(fajl.buffer);
        if (dimenzije.width && dimenzije.width > 300 || dimenzije.height && dimenzije.height > 300) return "Prevelika slika."
        else if (dimenzije.width && dimenzije.width < 100 || dimenzije.height && dimenzije.height < 100) return "Premala slika."
        return "ok";
    }
    static cvValidacija(fajl: any): string {
        if (!fajl) return "Fajl je obavezan.";
        let tip = fajl.mimetype.split("/")[1];
        if (tip != "pdf") return "Tip CV fajla mora biti pdf.";
        if (fajl.size > 3*1024*1024) return "Veličina fajla je maksimalno 3MB.";
        return "ok";
    }


    static async profilAzuriranjeValidacija(ulaz: any, izlaz: any, kor: any): Promise<string> {
        //ime, prezime, mejl, adresa, telefon

        if (ulaz.ime && ulaz.ime != "") izlaz.ime = ulaz.ime;
        if (ulaz.prezime && ulaz.prezime != "") izlaz.prezime = ulaz.prezime;
        if (ulaz.adresa && ulaz.adresa != "") izlaz.adresa = ulaz.adresa;
        if (ulaz.telefon && ulaz.telefon != "") {
            if (!telefonRegex.test(ulaz.telefon)) return telefonPoruka;
            else izlaz.telefon = ulaz.telefon;
        }
        if (ulaz.mejl && ulaz.mejl != "") {
            if (!mejlRegex.test(ulaz.mejl)) return mejlPoruka;
            else izlaz.mejl = ulaz.mejl;
        }

        if (kor.tip == "Ucenik") {
            //skola, prelazak
            if (ulaz.prelazak && (ulaz.prelazak == true || ulaz.prelazak == "true")) ulaz.prelazak = true
            else ulaz.prelazak = false 
            if (ulaz.skola && ulaz.skola != "") {
                if (tipoviSkola.indexOf(ulaz.skola) == -1) return "Tip škole ne postoji."
                else izlaz.skola = ulaz.skola;
            } else izlaz.skola = kor.skola;
            if (izlaz.skola != kor.skola) {
                if (izlaz.skola == "Osnovna") return "Nedozvoljena promena tipa škole.";
                else if (kor.skola == "Osnovna" && (kor.razred != 8 || !ulaz.prelazak)) return "Nedozvoljena promena tipa škole.";
            }
            if (ulaz.prelazak && kor.skola != "Osnovna" && kor.razred == 4) return "Nedozvoljen prelazak u sledeći razred.";
            if (ulaz.prelazak) izlaz.razred = kor.razred % 8 + 1;
        }

        if (kor.tip == "Nastavnik") {
            //...
            if (!ulaz.predmeti) delete izlaz.predmeti
            else if (!Array.isArray(ulaz.predmeti)) izlaz.predmeti = [ulaz.predmeti];
            else izlaz.predmeti = ulaz.predmeti;
            if (!ulaz.uzrasti) delete izlaz.uzrasti
            else if (!Array.isArray(ulaz.uzrasti)) izlaz.uzrasti = [ulaz.uzrasti];
            else izlaz.uzrasti = ulaz.uzrasti;
        }

        let ret = await DB.korisnikPoMejlu(izlaz.mejl)
        if (ret != null && ret.kime != kor.kime) return "Mejl je zauzet";
        else return "ok";
    }

    static odgovaraUzrast(korisnik: any, nastavnik: any): boolean {
        let uzrast = Utils.uzrast(korisnik);
        if (nastavnik.uzrasti.indexOf(uzrast) == -1) return false;
        else return true;
    }

    static radnovremeValidacija(ulaz: any, izlaz: any): string {
        if (!ulaz) return "Fale podaci."
        let keys = ["0", "1", "2", "3", "4", "5", "6"];
        for (let key of keys) {
            if (!ulaz[key]) return "Fale podaci."
            if (ulaz[key].od > ulaz[key].do) return "Početak radnog vremena ne moze biti posle kraja."
            if (ulaz[key].od < 0) return "Nevalidan početak radnog vremena."
            if (ulaz[key].do > 24*60*60*1000) return "Nevalidan kraj radnog vremena."
            izlaz[key] = {
                od: ulaz[key].od,
                do: ulaz[key].do
            }
        }
        return "ok"
    }

    static nedostupnostValidacija(ulaz: any, izlaz: any): string {
        if (!ulaz || !ulaz.od || !ulaz.do) return "Fale podaci."
        let od = new DatumVreme(ulaz.od);
        let do_ = new DatumVreme(ulaz.do);
        if (od.date >= do_.date) return "Datum do mora biti veći od datuma od."
        izlaz.od = od.date;
        izlaz.do = do_.date;
        return "ok";
    }

    static async otkazivanjeValidacija(ulaz: any, izlaz: any): Promise<string> {
        if (!ulaz || !ulaz.id || !ulaz.obrazlozenje) return "Nedostaju podaci."
        let cas = await DB.cas(ulaz.id)
        if (cas == null) return "Čas ne postoji."
        izlaz.id = ulaz.id
        izlaz.obrazlozenje = ulaz.obrazlozenje
        let sada = DatumVreme.sada()
        if (cas.od < sada.date) return "Ne možete otkazati prošli cas."
        else if (new DatumVreme(cas.od).razlikaUMinutima(sada) < 4*60) return "Ne možete otkazati čas manje od 4 sata pre početka."
        else return "ok";
    }

    static async nastavnikRecenzijaValidacija(ulaz: any, izlaz: any, nastavnik: string): Promise<string> {
        if (!ulaz || !ulaz.id) return "Nema dovoljno podataka."
        let cas = await DB.cas(ulaz.id)
        if (cas == null) return "Čas ne postoji u bazi ili je otkazan/odbijen."
        izlaz.id = ulaz.id
        if (cas.od >= DatumVreme.sada().date) return "Ne možete oceniti cas koji se još nije završio."
        else if (cas.ocenaNastavnik || cas.komentarNastavnik) return "Čas je već ocenjen."
        if (ulaz.ocena) izlaz.ocena = ulaz.ocena;
        else izlaz.ocena = null;

        if (ulaz.komentar) izlaz.komentar = ulaz.komentar;
        else izlaz.komentar = null;
        return "ok"
    }

    static async ucenikRecenzijaValidacija(ulaz: any, izlaz: any, ucenik: string): Promise<string> {
        if (!ulaz || !ulaz.id) return "Nema dovoljno podataka."
        let cas = await DB.cas(ulaz.id)
        if (!cas) return "Traženi čas ne postoji u bazi ili je otkazan/odbijen."
        izlaz.id = ulaz.id
        if (cas.od >= DatumVreme.sada().date) return "Ne možete oceniti čas koji se još nije završio."
        else if (cas.ucenik != ucenik) return "Ne možete oceniti čas koji nije održan vama."
        else if (cas.ocenaUcenik || cas.komentarUcenik) return "Čas je već ocenjen."
        
        if (ulaz.ocena) izlaz.ocena = ulaz.ocena;
        else izlaz.ocena = null;

        if (ulaz.komentar) izlaz.komentar = ulaz.komentar;
        else izlaz.komentar = "";
        izlaz.nastavnik = ulaz.nastavnik
        return "ok"
    }
}