/*
Klasa datum vreme je omotac oko javascript Date klase,
tako da vreme pamti kao jedinstveni trenutak u milisekundama od 1970-1-1 UTC.
*/
export class DatumVreme {

    public date: Date
    
    //Sve metode koriste Date metode za podrazumevnu vremensku zonu
    constructor(vrednost: number | Date | string) {
        this.date = new Date(vrednost)
    }
    static sada(): DatumVreme {
        return new DatumVreme(Date.now())
    }
    static datum(datum: {day: number, year: number, month: number}): DatumVreme {
        return new DatumVreme(Date.parse(datum.year.toString() + "-" + datum.month.toString() + "-" + datum.day.toString()))
    }
    vreme(vreme: {hour ?: number, minute ?: number, second ?: number, milli ?: number} | number): DatumVreme {
        let res: any = {}
        if (typeof(vreme) == 'number') {
            res.milli = vreme % 1000
            vreme /= 1000
            res.second = vreme % 60
            vreme /= 60
            res.minute = vreme % 60
            vreme /= 60
            res.hour = vreme % 24
        } else {
            res.milli = vreme.milli ?? 0
            res.second = vreme.second ?? 0
            res.minute = vreme.minute ?? 0
            res.hour = vreme.hour ?? 0
        }
        let ret = new Date(this.date)
        ret.setMilliseconds(res.milli)
        ret.setSeconds(res.second)
        ret.setMinutes(res.minute)
        ret.setHours(res.hour)
        return new DatumVreme(ret)
    }
    pocetakDana(): DatumVreme {
        let ret = new Date(this.date)
        ret.setHours(0)
        ret.setMinutes(0)
        ret.setSeconds(0)
        ret.setMilliseconds(0)
        return new DatumVreme(ret)
    }
    krajDana(): DatumVreme {
        let ret = new Date(this.date)
        ret.setHours(23)
        ret.setMinutes(59)
        ret.setSeconds(59)
        ret.setMilliseconds(999)
        return new DatumVreme(ret)
    }
    neposrednoDo(): DatumVreme {
        return new DatumVreme(this.date.getTime() - 1)
    }
    naPolaSata(): DatumVreme {
        let min = this.date.getMinutes()
        min -= min % 30
        let ret = new Date(this.date)
        ret.setMinutes(min)
        ret.setSeconds(0)
        ret.setMilliseconds(0)
        return new DatumVreme(ret)
    }


    //Broj proteklih milisekundi u tekucem danu, prema podrazumevanoj vremenskoj zoni
    sirovoVreme(): number {
        return ((this.date.getHours() * 60 + this.date.getMinutes()) * 60 + this.date.getSeconds()) * 1000 + this.date.getMilliseconds()
    }
    //Broj milisekundi of 1.1.1970 UTC
    broj() {
        return this.date.getTime();
    }

    //Operacije
    dodajDan(dana: number) {
        return new DatumVreme(this.date.getTime() + dana*24*60*60*1000)
    }
    dodajMinut(minut: number) {
        return new DatumVreme(this.date.getTime() + minut*60*1000)
    }
    dodajMili(mili: number) {
        return new DatumVreme(this.date.getTime() + mili)
    }
    //Da li trenuci predstavljaju isti datum, u podrazumevanoj vremenskoj zoni
    istiDan(dv: DatumVreme) {
        //return dv.sirovDatum() == this.sirovDatum();
        return this.date.getFullYear() == dv.date.getFullYear() && this.date.getMonth() == dv.date.getMonth() && this.date.getDate() == dv.date.getDate()
    }
    razlikaUMinutima(dv: DatumVreme) {
        return this.minuti() - dv.minuti();
    }
    jednako(dv: DatumVreme): boolean {
        return this.broj() == dv.broj();
    }
    proslost(): boolean {
        return Date.now() > this.date.getTime()
    }

    
    

    //Konverzija
    //ngb datum u podrazumevanoj vremenskoj zoni
    ngbDatum(): {day: number, year: number, month: number} {
        return {
            day: this.date.getDate(),
            month: this.date.getMonth() + 1 ,
            year: this.date.getFullYear()
        }
    }
    //ng vreme u podrazumevanoj vremenskoj zoni
    ngbVreme(): {hour: number, minute: number} {
        return {
            hour: this.date.getHours(),
            minute: this.date.getMinutes()
        }
    }
    //dan u nedelji u podrazumevanoj vremenskoj zoni
    danUNedelji(): string {
        return `${(this.date.getDay() + 6)%7}`
    }
    minuti(): number {
        return this.date.getTime() / (60*1000)
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
    datumVremeString(): string {
        return this.datumString() + " " + this.vremeString();
    }
    vremeString(): string {
        let vreme = this.ngbVreme();
        return `${this.pad(vreme.hour)}:${this.pad(vreme.minute)}`
    }
}