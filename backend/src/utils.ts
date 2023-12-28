import fs from 'fs';
import path from 'path';

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
}