export class Utils {
    static lozinkaRegex(): RegExp {
        return /^(?=(.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z].{5,9}$/;
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