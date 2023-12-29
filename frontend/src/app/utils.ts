import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export class Utils {
    static lozinkaRegex(): RegExp {
        return /^(?=(.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z].{5,9}$/;
    }
    static lozinkaZahtevi(): string {
        return "Lozinka mora da ima 6-10 karaktera, 3 mala slova, 1 veliko, 1 broj i 1 specijalan karakter, i mora poceti slovom.";
    }
    static telefonRegex(): RegExp {
        return /^\+381( *\d){8,9}$/;
    }
    static telefonZahtevi(): string {
        return "Telefon mora biti u formatu +381xx xxx xxx(x)";
    }
    static mejlRegex(): RegExp {
        return /^[a-zA-Z\d]+(\.[a-zA-Z\d]+)*@[a-zA-Z\d]+(\.[a-zA-Z\d]+)*$/;
    }
    static mejlZahtevi(): string {
        return 'Mejl mora biti u standardnom formatu za mejl.';
    }
    static profilFajlTipovi(): Array<string> {
        return ['png', 'jpg', 'jpeg'];
    }
    static dodajUFormu(forma: FormData, obj: any) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                forma.append(key, obj[key]);
            }
        }
    }
    static skrolDoVrha(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}