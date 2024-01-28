import fs from 'fs';
import path from 'path';
import { DatumVreme } from './DatumVreme';
import * as bcrypt from 'bcrypt'

export class Utils {
    static jedinstvenoFajlIme(fajl: any) {
        let tip = fajl.mimetype.split('/')[1]
        return `${fajl.fieldname}-${Date.now()}.${tip}`
    }
    static sacuvajFajl(fajl: any) {
        let ime = this.jedinstvenoFajlIme(fajl)
        let putanja = path.join(__dirname, "..", "uploads", ime)
        let baza = "/uploads/" + ime;
        fs.writeFileSync(putanja, fajl.buffer);
        return baza;
    }
    static podrazumevanaProfilna() {
        return "/uploads/default-profile.jpeg"; 
    }
    static slikaUrl(slika: string) {
        return "http://localhost:4000" + slika;
    }
    static slikaPrefiks() {
        return "http://localhost:4000";
    }
    static uzrast(korisnik: any) {
        if (korisnik.skola != "Osnovna") return "Srednja";
        else if (korisnik.razred > 4) return "Osnovna 5-8";
        else return "Osnovna 1-4";
    }

    static async enkripcija(lozinka: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(lozinka, salt);
        return hash;
    }

    static naSirini(broj: number, sirina: number) {
        let res =broj.toString()
        for (let i = res.length; i < sirina; i++) res = "0" + res
        return res
    }

}