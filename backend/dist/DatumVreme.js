"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatumVreme = void 0;
/*
Klasa datum vreme je omotac oko javascript Date klase,
tako da vreme pamti kao jedinstveni trenutak u milisekundama od 1970-1-1 UTC.
*/
class DatumVreme {
    //Sve metode koriste Date metode za podrazumevnu vremensku zonu
    constructor(vrednost) {
        this.date = new Date(vrednost);
    }
    static sada() {
        return new DatumVreme(Date.now());
    }
    static datum(datum) {
        return new DatumVreme(Date.parse(datum.year.toString() + "-" + datum.month.toString() + "-" + datum.day.toString()));
    }
    vreme(vreme) {
        var _a, _b, _c, _d;
        let res = {};
        if (typeof (vreme) == 'number') {
            res.milli = vreme % 1000;
            vreme /= 1000;
            res.second = vreme % 60;
            vreme /= 60;
            res.minute = vreme % 60;
            vreme /= 60;
            res.hour = vreme % 24;
        }
        else {
            res.milli = (_a = vreme.milli) !== null && _a !== void 0 ? _a : 0;
            res.second = (_b = vreme.second) !== null && _b !== void 0 ? _b : 0;
            res.minute = (_c = vreme.minute) !== null && _c !== void 0 ? _c : 0;
            res.hour = (_d = vreme.hour) !== null && _d !== void 0 ? _d : 0;
        }
        let ret = new Date(this.date);
        ret.setMilliseconds(res.milli);
        ret.setSeconds(res.second);
        ret.setMinutes(res.minute);
        ret.setHours(res.hour);
        return new DatumVreme(ret);
    }
    pocetakDana() {
        let ret = new Date(this.date);
        ret.setHours(0);
        ret.setMinutes(0);
        ret.setSeconds(0);
        ret.setMilliseconds(0);
        return new DatumVreme(ret);
    }
    krajDana() {
        let ret = new Date(this.date);
        ret.setHours(23);
        ret.setMinutes(59);
        ret.setSeconds(59);
        ret.setMilliseconds(999);
        return new DatumVreme(ret);
    }
    neposrednoDo() {
        return new DatumVreme(this.date.getTime() - 1);
    }
    naPolaSata() {
        let min = this.date.getMinutes();
        min -= min % 30;
        let ret = new Date(this.date);
        ret.setMinutes(min);
        ret.setSeconds(0);
        ret.setMilliseconds(0);
        return new DatumVreme(ret);
    }
    //Broj proteklih milisekundi u tekucem danu, prema podrazumevanoj vremenskoj zoni
    sirovoVreme() {
        return ((this.date.getHours() * 60 + this.date.getMinutes()) * 60 + this.date.getSeconds()) * 1000 + this.date.getMilliseconds();
    }
    //Broj milisekundi of 1.1.1970 UTC
    broj() {
        return this.date.getTime();
    }
    //Operacije
    dodajDan(dana) {
        return new DatumVreme(this.date.getTime() + dana * 24 * 60 * 60 * 1000);
    }
    dodajMinut(minut) {
        return new DatumVreme(this.date.getTime() + minut * 60 * 1000);
    }
    dodajMili(mili) {
        return new DatumVreme(this.date.getTime() + mili);
    }
    //Da li trenuci predstavljaju isti datum, u podrazumevanoj vremenskoj zoni
    istiDan(dv) {
        //return dv.sirovDatum() == this.sirovDatum();
        return this.date.getFullYear() == dv.date.getFullYear() && this.date.getMonth() == dv.date.getMonth() && this.date.getDate() == dv.date.getDate();
    }
    razlikaUMinutima(dv) {
        return this.minuti() - dv.minuti();
    }
    jednako(dv) {
        return this.broj() == dv.broj();
    }
    proslost() {
        return Date.now() > this.date.getTime();
    }
    //Konverzija
    //ngb datum u podrazumevanoj vremenskoj zoni
    ngbDatum() {
        return {
            day: this.date.getDate(),
            month: this.date.getMonth() + 1,
            year: this.date.getFullYear()
        };
    }
    //ng vreme u podrazumevanoj vremenskoj zoni
    ngbVreme() {
        return {
            hour: this.date.getHours(),
            minute: this.date.getMinutes()
        };
    }
    //dan u nedelji u podrazumevanoj vremenskoj zoni
    danUNedelji() {
        return `${(this.date.getDay() + 6) % 7}`;
    }
    minuti() {
        return this.date.getTime() / (60 * 1000);
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
    datumVremeString() {
        return this.datumString() + " " + this.vremeString();
    }
    vremeString() {
        let vreme = this.ngbVreme();
        return `${this.pad(vreme.hour)}:${this.pad(vreme.minute)}`;
    }
}
exports.DatumVreme = DatumVreme;
