export class Utils {
    static lozinkaRegex(): RegExp {
        return /^(?=(.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z].{5,9}$/;
    }
    static lozinkaZahtevi(): string {
        return "Lozinka mora da ima 6-10 karaktera, 3 mala slova, 1 veliko, 1 broj i 1 specijalan karakter, i mora poceti slovom.";
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