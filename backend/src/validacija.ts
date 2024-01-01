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

let tipoviSkola = ["Osnovna", "Gimnazija", "Srednja strucna", "Srednja umetnicka"]
let uzrasti = ["Osnovna 1-4", "Osnovna 5-8", "Srednja"]

export class Validacija {
    static lozinkaValidacija(lozinka: string) {
        if (!lozinkaRegex.test(lozinka)) return lozinkaPoruka;
        else return "ok";
    }
    //Proverava sva polja u registraciji OSIM fajlova, i upisuje u izlaz
    static registracijaValidacija(ulaz: any, izlaz: any): Promise<string> {
        let greska = "";
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
            !ulaz.tip || ulaz.tip == "") greska = "Nedostaju informacije.";
        else if (!lozinkaRegex.test(ulaz.lozinka)) greska = lozinkaPoruka;
        else if (!telefonRegex.test(ulaz.telefon)) greska = telefonPoruka;
        else if (!mejlRegex.test(ulaz.mejl)) greska = mejlPoruka;
        else if (ulaz.tip != "Ucenik" && ulaz.tip != "Nastavnik") greska = "Tip ne postoji.";
        else if (ulaz.pol != "M" && ulaz.pol != "Z") greska = "Pol ne postoji.";
        else {
            izlaz.kime = ulaz.kime; izlaz.lozinka = ulaz.lozinka;
            izlaz.pitanje = ulaz.pitanje; izlaz.odgovor = ulaz.odgovor;
            izlaz.ime = ulaz.ime; izlaz.prezime = ulaz.prezime;
            izlaz.tip = ulaz.tip; izlaz.pol = ulaz.pol;
            izlaz.adresa = ulaz.adresa; izlaz.telefon = ulaz.telefon;
            izlaz.telefon = ulaz.telefon; izlaz.mejl = ulaz.mejl;
            izlaz.tip = ulaz.tip;
        }
        
        if (greska == "" && izlaz.tip == "Ucenik") {
            //Provera polja za ucenika
            ulaz.razred = parseInt(ulaz.razred);
            if (!ulaz.skola || ulaz.skola == "" ||
            !ulaz.razred || isNaN(ulaz.razred)) greska = "Nedostaju podaci za ucenika.";
            else if (tipoviSkola.indexOf(ulaz.skola) == -1) greska = "Tip skole ne postoji.";
            else if (ulaz.razred < 1 || ulaz.razred > 8 || ulaz.skola != "Osnovna" && ulaz.razred > 4) greska = "Razred izvan opsega.";
            else {
                izlaz.skola = ulaz.skola; izlaz.razred = ulaz.razred;
            }
        }
        else if (greska == "" && izlaz.tip == "Nastavnik") {
            if (!ulaz.predmeti) izlaz.predmeti = []
            else if (!Array.isArray(ulaz.predmeti)) izlaz.predmeti = [ulaz.predmeti];
            else izlaz.predmeti = ulaz.predmeti;
            if (!ulaz.uzrasti) izlaz.uzrasti = []
            else if (!Array.isArray(ulaz.uzrasti)) izlaz.uzrasti = [ulaz.uzrasti];
            else izlaz.uzrasti = ulaz.uzrasti;
            if (!ulaz.saznao) izlaz.saznao = "";
            else izlaz.saznao = ulaz.saznao;
        }

        return new Promise((resolve, reject) => {
            if (greska != "") resolve(greska);
            else DB.korisnikPoKime(izlaz.kime).then(res => {
                if (res) resolve("Korisnicko ime vec postoji.");
                else DB.korisnikPoMejlu(izlaz.mejl).then(res => {
                    if (res) resolve("Mejl je zauzet.");
                    else resolve("ok");
                })
            });
        });
    }
    static profilValidacija(fajl: any): string {
        if (!fajl) return "ok";
        let tip = fajl.mimetype;
        if (!tip.startsWith("image/")) return "Nedozvoljeni tip fajla.";
        tip = tip.split("/")[1]
        if (["png", "jpg", "jpeg"].indexOf(tip) == -1) return "Nedozvoljeni tip fajla.";
        let dimenzije = imagesize(fajl.buffer);
        if (dimenzije.width && dimenzije.width > 300 || dimenzije.height && dimenzije.height > 300) return "Prevelika slika."
        return "ok";
    }
    static cvValidacija(fajl: any): string {
        if (!fajl) return "Fajl je obavezan.";
        let tip = fajl.mimetype.split("/")[1];
        if (tip != "pdf") return "Tip CV fajla mora biti pdf.";
        if (fajl.size > 3*1024*1024) return "Velicina fajla je maksimalno 3MB.";
        return "ok";
    }


    static profilAzuriranjeValidacija(ulaz: any, izlaz: any, kor: any): Promise<string> {
        //ime, prezime, mejl, adresa, telefon
        let greska = "";

        if (ulaz.ime && ulaz.ime != "") izlaz.ime = ulaz.ime;
        if (ulaz.prezime && ulaz.prezime != "") izlaz.prezime = ulaz.prezime;
        if (ulaz.adresa && ulaz.adresa != "") izlaz.adresa = ulaz.adresa;
        if (ulaz.telefon && ulaz.telefon != "") {
            if (!telefonRegex.test(ulaz.telefon)) greska += telefonPoruka;
            else izlaz.telefon = ulaz.telefon;
        }
        if (ulaz.mejl && ulaz.mejl == "") {
            if (!mejlRegex.test(ulaz.mejl)) greska += mejlPoruka;
            else izlaz.mejl = ulaz.mejl;
        } else izlaz.mejl = kor.mejl;

        if (greska == "" && kor.tip == "Ucenik") {
            //skola, prelazak
            if (ulaz.skola && ulaz.skola != "") {
                if (tipoviSkola.indexOf(ulaz.skola) == -1) { greska += "Tip skole ne postoji. "; izlaz.skola = kor.skola; }
                else izlaz.skola = ulaz.skola;
            } else izlaz.skola = kor.skola;
            if (izlaz.skola != kor.skola) {
                if (izlaz.skola == "Osnovna") greska += "Nedozvoljena promena tipa skole.";
                else if (kor.skola == "Osnovna" && (kor.razred != 8 || !ulaz.prelazak)) greska += "Nedozvoljena promena tipa skole.";
            }
            if (ulaz.prelazak && kor.skola != "Osnovna" && kor.razred == 4) greska += "Nedozvoljen prelazak u sledeci razred.";
            if (ulaz.prelazak) izlaz.razred = kor.razred % 8 + 1;
        }

        if (greska == "" && kor.tip == "Nastavnik") {
            //...
            if (!ulaz.predmeti) izlaz.predmeti = []
            else if (!Array.isArray(ulaz.predmeti)) izlaz.predmeti = [ulaz.predmeti];
            else izlaz.predmeti = ulaz.predmeti;
            if (!ulaz.uzrasti) izlaz.uzrasti = []
            else if (!Array.isArray(ulaz.uzrasti)) izlaz.uzrasti = [ulaz.uzrasti];
            else izlaz.uzrasti = ulaz.uzrasti;
        }

        return new Promise((resolve, reject) => {
            if (greska != "") resolve(greska);
            else {
                DB.korisnikPoMejlu(izlaz.mejl).then((res: any) => {
                    if (res != null && res.kime != kor.kime) resolve("Mejl je zauzet");
                    else resolve("ok");
                })
            }
        })
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
            if (ulaz[key].od > ulaz[key].do) return "Pocetak radnog vremena ne moze biti posle kraja."
            if (ulaz[key].od < 0) return "Nevalidan pocetak radnog vremena."
            if (ulaz[key].do > 24*60) return "Nevalidan kraj radnog vremena."
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
        if (od.broj() >= do_.broj()) return "Datum do mora biti veci od datuma od."
        izlaz.od = od.broj();
        izlaz.do = do_.broj();
        return "ok";
    }

    static otkazivanjeValidacija(od: DatumVreme): string {
        let sada = DatumVreme.sada()
        if (od.broj() < sada.broj()) return "Ne mozete otkazati prosli cas."
        else if (od.razlikaUMinutima(sada) < 4*60) return "Ne mozete otkazati cas manje od 4 sata pre pocetka."
        else return "ok";
    }

    static nastavnikRecenzijaValidacija(ulaz: any, izlaz: any, nastavnik: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!ulaz || !ulaz.od) resolve("Nema dovoljno podataka.")
            else if (ulaz.do >= DatumVreme.sada().broj()) resolve("Ne mozete oceniti cas koji se jos nije zavrsio.")
            else DB.cas(nastavnik, new DatumVreme(ulaz.od)).then((res: any) => {
                if (!res) resolve("Trazeni cas ne postoji u bazi ili je otkazan/odbijen.")
                else if (res.ocenaNastavnik || res.komentarNastavnik) resolve("Cas je vec ocenjen.")
                else {
                    if (ulaz.ocena) izlaz.ocena = ulaz.ocena;
                    else izlaz.ocena = null;

                    if (ulaz.komentar) izlaz.komentar = ulaz.komentar;
                    else izlaz.komentar = "";

                    izlaz.od = new DatumVreme(ulaz.od)
                    resolve("ok")
                }
            })
        })
    }

    static ucenikRecenzijaValidacija(ulaz: any, izlaz: any, ucenik: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!ulaz || !ulaz.od || !ulaz.nastavnik) resolve("Nema dovoljno podataka.")
            else if (ulaz.do >= DatumVreme.sada().broj()) resolve("Ne mozete oceniti cas koji se jos nije zavrsio.")
            else DB.cas(ulaz.nastavnik, new DatumVreme(ulaz.od)).then((res: any) => {
                if (!res) resolve("Trazeni cas ne postoji u bazi ili je otkazan/odbijen.")
                else if (res.ucenik != ucenik) resolve("Ne mozete oceniti cas koji nije odrzan vama.")
                else if (res.ocenaUcenik || res.komentarUcenik) resolve("Cas je vec ocenjen.")
                else {
                    if (ulaz.ocena) izlaz.ocena = ulaz.ocena;
                    else izlaz.ocena = null;

                    if (ulaz.komentar) izlaz.komentar = ulaz.komentar;
                    else izlaz.komentar = "";

                    izlaz.od = new DatumVreme(ulaz.od)
                    izlaz.nastavnik = ulaz.nastavnik
                    resolve("ok")
                }
            })
        })
    }
}