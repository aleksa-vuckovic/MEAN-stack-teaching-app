export class Utils {
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