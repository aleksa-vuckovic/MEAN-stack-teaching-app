import fs from 'fs';

export class Utils {
    static jedinstvenoFajlIme(fajl: any) {
        let tip = fajl.mimetype.split('/')[1]
        return `${fajl.fieldname}-${Date.now()}.${tip}`
    }
    static sacuvajFajl(fajl: any) {
        let ime = this.jedinstvenoFajlIme(fajl)
        let putanja = "D:\\7\\PIA\\Projekat\\backend\\uploads\\" + ime;
        let baza = "/uploads/" + ime;
        fs.writeFileSync(putanja, fajl.buffer);
        return baza;
    }
    static podrazumevanaProfilna() {
        return "/uploads/default-profile"; 
    }
}