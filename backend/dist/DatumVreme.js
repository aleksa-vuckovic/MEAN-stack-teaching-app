"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatumVreme = void 0;
class DatumVreme {
    //Konstruisanje
    constructor(vrednost) {
        this.vrednost = 0;
        this.vrednost = vrednost;
    }
    static sada() {
        const currentDate = new Date();
        let datum = {
            day: currentDate.getDate(),
            month: currentDate.getMonth() + 1,
            year: currentDate.getFullYear()
        };
        let vreme = {
            hour: currentDate.getHours(),
            minute: currentDate.getMinutes()
        };
        return DatumVreme.datum(datum).vreme(vreme);
    }
    static datum(datum) {
        let dan = datum.day;
        let godina = datum.year;
        let mesec = datum.month;
        let res = (godina - 2021) * 365 + Math.floor((godina - 2021) / 4);
        let meseci = godina % 4 ? DatumVreme.prostaGodina : DatumVreme.prestupnaGodina;
        for (let i = 0; i < mesec - 1; i++)
            res += meseci[i];
        res += dan;
        return new DatumVreme(res << DatumVreme.vremeShift);
    }
    vreme(vreme) {
        let tmp = 0;
        if (typeof (vreme) != 'number') {
            tmp = vreme.hour * 60 + vreme.minute;
        }
        else
            tmp = vreme;
        return new DatumVreme((this.vrednost & ~DatumVreme.vremeMaska) + tmp);
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
    dodajDan(dana) {
        let tmp = this.vrednost;
        if (dana < 0)
            tmp -= ((-dana)) << DatumVreme.vremeShift;
        else
            tmp += (dana << DatumVreme.vremeShift);
        return new DatumVreme(tmp);
    }
    dodajVreme(broj) {
        let tmp = this.vrednost & DatumVreme.vremeMaska;
        tmp += broj;
        if (tmp > DatumVreme.ponoc) {
            tmp = tmp % DatumVreme.ponoc;
            return this.dodajDan(1).vreme(tmp);
        }
        else
            return this.vreme(tmp);
    }
    razlikaUDanima(dv) {
        return this.sirovDatum() - dv.sirovDatum();
    }
    istiDan(dv) {
        return dv.sirovDatum() == this.sirovDatum();
    }
    razlikaUMinutima(dv) {
        return this.minuti() - dv.minuti();
    }
    jednako(dv) {
        return this.broj() == dv.broj();
    }
    //Konverzija
    ngbDatum() {
        let datumvreme = (this.vrednost >> DatumVreme.vremeShift) - 1;
        let period = 365 * 3 + 366;
        let periodBroj = Math.floor(datumvreme / period);
        let godina = periodBroj * 4;
        datumvreme -= periodBroj * period;
        let godinaBroj = Math.floor(datumvreme / 365);
        if (godinaBroj == 4)
            godinaBroj--;
        godina += godinaBroj;
        datumvreme -= godinaBroj * 365;
        let meseci = godinaBroj == 3 ? DatumVreme.prestupnaGodina : DatumVreme.prostaGodina;
        let mesec = 1;
        for (let i = 0; i < 12; i++)
            if (meseci[i] <= datumvreme) {
                mesec++,
                    datumvreme -= meseci[i];
            }
            else
                break;
        let dan = datumvreme + 1;
        return {
            day: dan,
            month: mesec,
            year: godina + 2021
        };
    }
    ngbVreme() {
        return {
            hour: Math.floor((this.vrednost & DatumVreme.vremeMaska) / 60),
            minute: (this.vrednost & DatumVreme.vremeMaska) % 60
        };
    }
    danUNedelji() {
        let t = (this.vrednost >> DatumVreme.vremeShift) % 7; //1.1.2021. = petak => 1 = petak, 4 = ponedeljak
        return `${(t + 3) % 7}`;
    }
    slot() {
        return this.sirovoVreme() / 30;
    }
    minuti() {
        return this.sirovDatum() * 24 * 60 + this.sirovoVreme();
    }
    slotOd() {
        return Math.floor(this.sirovoVreme() / 30);
    }
    slotDo() {
        return Math.floor((this.sirovoVreme() - 1) / 30);
    }
    //String reprezentacije
    pad(br) {
        return String(br).padStart(2, '0');
    }
    datumString() {
        let tmp = this.ngbDatum();
        return `${tmp.year}/${this.pad(tmp.month)}/${this.pad(tmp.day)}`;
    }
    mesecString() {
        let tmp = this.ngbDatum();
        let res = "";
        switch (tmp.month) {
            case 1:
                res = "Januar";
                break;
            case 2:
                res = "Februar";
                break;
            case 3:
                res = "Mart";
                break;
            case 4:
                res = "April";
                break;
            case 5:
                res = "Maj";
                break;
            case 6:
                res = "Jun";
                break;
            case 7:
                res = "Jul";
                break;
            case 8:
                res = "Avgust";
                break;
            case 9:
                res = "Septembar";
                break;
            case 10:
                res = "Oktobar";
                break;
            case 11:
                res = "Novembar";
                break;
            default:
                res = "Decembar";
                break;
        }
        res += ` ${tmp.year}`;
        return res;
    }
    danString() {
        let tmp = this.ngbDatum();
        let tmp2 = this.danUNedelji();
        let res = '';
        switch (tmp2) {
            case "0":
                res = "Pon";
                break;
            case "1":
                res = "Uto";
                break;
            case "2":
                res = "Sre";
                break;
            case "3":
                res = "Cet";
                break;
            case "4":
                res = "Pet";
                break;
            case "5":
                res = "Sub";
                break;
            default: res = "Ned";
        }
        res = `${tmp.day}. (${res})`;
        return res;
    }
    vremeString() {
        let vreme = this.ngbVreme();
        return this.datumString() + ` ${this.pad(vreme.hour)}:${this.pad(vreme.minute)}`;
    }
}
exports.DatumVreme = DatumVreme;
DatumVreme.vremeMaska = 0xFFF;
DatumVreme.vremeShift = 12;
DatumVreme.prostaGodina = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
DatumVreme.prestupnaGodina = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
DatumVreme.ponoc = 24 * 60;
