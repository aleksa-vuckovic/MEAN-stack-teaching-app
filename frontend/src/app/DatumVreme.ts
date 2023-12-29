

export class DatumVreme {

    private static vremeMaska = 0xFFF;
    private static vremeShift = 12;
    private static prostaGodina = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    private static prestupnaGodina = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    private static ponoc = 24*60;
    private vrednost: number = 0;
    //Konstruisanje
    constructor(vrednost: number) {
        this.vrednost = vrednost;
    }
    static sada(): DatumVreme {
        const currentDate = new Date();
        let datum = {
            day: currentDate.getDate(),
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear()
        }
        let vreme = {
            hour: currentDate.getHours(),
            minute: currentDate.getMinutes()
        }
        return DatumVreme.datum(datum).vreme(vreme);
    }
    static datum(datum: {day: number, year: number, month: number}): DatumVreme {
        let dan = datum.day;
        let godina = datum.year
        let mesec = datum.month;
        let res = (godina-2021)*365 + Math.floor((godina-2021)/4);
        let meseci = godina % 4 ? DatumVreme.prostaGodina : DatumVreme.prestupnaGodina;
        for (let i = 0; i < mesec - 1; i++) res+=meseci[i];
        res += dan;
        return new DatumVreme(res << DatumVreme.vremeShift);
    }
    vreme(vreme: {hour: number, minute: number} | number): DatumVreme {
        let tmp: number = 0;
        if (typeof(vreme) != 'number') {
            tmp = vreme.hour * 60 + vreme.minute
        } else tmp = vreme;
        return new DatumVreme((this.vrednost & ~DatumVreme.vremeMaska) + tmp)
    }
    krajDana() {
        return this.vreme(DatumVreme.ponoc);
    }

    //Sirovi podaci
    sirovoVreme() {
        return this.vrednost & DatumVreme.vremeMaska;
    }
    sirovDatum() {
        return this.vrednost >> DatumVreme.vremeShift;
    }
    broj() {
        return this.vrednost;
    }

    //Operacije
    dodajDan(dana: number) {
        let tmp = this.vrednost + (dana<<DatumVreme.vremeShift);
        return new DatumVreme(tmp);
    }
    dodajVreme(broj: number) {
        let tmp = this.vrednost & DatumVreme.vremeMaska;
        tmp += broj;
        if (tmp > DatumVreme.ponoc) {
            tmp = tmp % DatumVreme.ponoc;
            return this.dodajDan(1).vreme(tmp);
        }
        else return this.vreme(tmp);
    }
    razlikaUDanima(dv: DatumVreme) {
        return this.sirovDatum() - dv.sirovDatum();
    }
    istiDan(dv: DatumVreme) {
        return dv.sirovDatum() == this.sirovDatum();
    }
    razlikaUMinutima(dv: DatumVreme) {
        return this.minuti() - dv.minuti();
    }

    
    

    //Konverzija
    ngbDatum(): {day: number, year: number, month: number} {
        let datumvreme = (this.vrednost >> DatumVreme.vremeShift) - 1;
        let period = 365*3 + 366;
        let periodBroj = Math.floor(datumvreme/period);
        let godina = periodBroj*4;
        datumvreme -= periodBroj*period;
        let godinaBroj = Math.floor(datumvreme/365);
        if (godinaBroj == 4) godinaBroj--;
        godina += godinaBroj;
        datumvreme -= godinaBroj*365;

        let meseci = godinaBroj==3 ? DatumVreme.prestupnaGodina: DatumVreme.prostaGodina;
        let mesec = 1;
        for (let i = 0; i < 12; i++)
            if (meseci[i] <= datumvreme) {
                mesec++,
                datumvreme-=meseci[i];
            } else break;
        let dan = datumvreme + 1;

        return {
            day: dan,
            month: mesec,
            year: godina + 2021
        }
    }
    ngbVreme(): {hour: number, minute: number} {
        return {
            hour: Math.floor((this.vrednost&DatumVreme.vremeMaska)/60),
            minute: (this.vrednost&DatumVreme.vremeMaska)%60
        }
    }
    danUNedelji(): string {
        let t = (this.vrednost>>DatumVreme.vremeShift) % 7; //1.1.2021. = petak => 1 = petak, 4 = ponedeljak
        return `${(t + 3) % 7}`;
    }
    slot(): number {
        return this.sirovoVreme() / 30;
    }
    minuti(): number {
        return this.sirovDatum() * 24 * 60 + this.sirovoVreme();
    }

    //String reprezentacije
    private pad(br: number) {
        return String(br).padStart(2, '0');
    }
    datumString(): string {
        let tmp = this.ngbDatum();
        return `${tmp.year}/${this.pad(tmp.month)}/${this.pad(tmp.day)}`;
    }
    mesecString(): string {
        let tmp = this.ngbDatum();
        let res = "";
        switch(tmp.month) {
            case 1: res = "Januar"; break;
            case 2: res = "Februar"; break;
            case 3: res = "Mart"; break;
            case 4: res = "April"; break;
            case 5: res = "Maj"; break;
            case 6: res = "Jun"; break;
            case 7: res = "Jul"; break;
            case 8: res = "Avgust"; break;
            case 9: res = "Septembar"; break;
            case 10: res = "Oktobar"; break;
            case 11: res = "Novembar"; break;
            default: res = "Decembar"; break;
        }
        res += ` ${tmp.year}`;
        return res;
    }
    danString(): string {
        let tmp = this.ngbDatum();
        let tmp2: string = this.danUNedelji();
        let res = '';
        switch(tmp2) {
            case "0": res = "Pon"; break;
            case "1": res = "Uto"; break;
            case "2": res = "Sre"; break;
            case "3": res = "Cet"; break;
            case "4": res = "Pet"; break;
            case "5": res = "Sub"; break;
            default: res = "Ned";
        }
        res = `${tmp.day}. (${res})`;
        return res;
    }
    vremeString(): string {
        let vreme = this.ngbVreme();
        return this.datumString() + ` ${this.pad(vreme.hour)}:${this.pad(vreme.minute)}`;
    }
}