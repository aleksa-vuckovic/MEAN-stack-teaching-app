import express from 'express';
import { DB } from "../db";
import { DatumVreme } from '../DatumVreme';

export class AdministratorKontroler {

    private autorizacija = (req: express.Request, res: express.Response) => {
        let session = req.session as any;
        if (session && session.korisnik && session.korisnik.tip == "Administrator") return session.korisnik;
        else {
            res.json({poruka: "Nautorizovan pristup."});
            return null;
        }
    }
    
    korisniciPretraga = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let pretraga = req.body;
        if (!pretraga) pretraga = {};
        let ret = await DB.korisniciPretraga(pretraga)
        if (ret) res.json({poruka: "ok", podaci: ret});
        else res.json({poruka: "Greska u bazi."});
    }

    nastavnikPodaci = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let kime = req.query.kime as string;
        if (!kime) { res.json({poruka: "Nedostaje argument."}); return; }
        let ret = await DB.nastavnikPodaci(kime)
        if(!ret) { res.json({poruka: "Nastavnik ne postoji."}); return }
        let ocena = await DB.nastavnikOcena(kime)
        let komentari =await DB.nastavnikKomentari(kime)
        delete ret.adresa;
        ret.komentari = komentari;
        ret.ocena = ocena;
        res.json({poruka: "ok", podaci: ret});
    }

    aktivacija = async(req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let kime = req.query.kime as string
        if (!kime) {res.json({poruka: "Nedostaje argument."}); return}
        let ret = await DB.korisnikAktivacija(kime, true)
        res.json({poruka: ret})
    }

    deaktivacija = async (req: express.Request, res: express.Response) => { 
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let kime = req.query.kime as string
        if (!kime) {res.json({poruka: "Nedostaje argument."}); return}
        let ret = await DB.korisnikAktivacija(kime, false)
        res.json({poruka: ret})
    }

    ucenikPodaci = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let kime = req.query.kime as string
        if (!kime) { res.json({poruka: "Nema dovoljno podataka."}); return; }
        let ret = await  DB.ucenikPodaci(kime)
        if (!ret) res.json({poruka: "Nije pronadjen ucenik."})
        else {
            delete ret.adresa 
            res.json({poruka: "ok", podaci: ret})
        }
    }

    zahtevi = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ret = await DB.zahteviZaRegistraciju()
        res.json({poruka: "ok", podaci: ret})
    }

    odobreno = async(req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let kime = req.query.kime as string
        if (!kime) {res.json({poruka: "Nedostaje argument."}); return}
        let ret = await DB.odobrenje(kime, true)
        res.json({poruka: ret})
    }

    predlozeniPredmeti = async(req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ret = await DB.predlozeniPredmeti()
        res.json({poruka: "ok", podaci: ret})
    }

    dodajPredmet = async(req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let predmet = req.body.predmet as string
        if (!predmet) {res.json({poruka: "Nedostaju argumenti."}); return}
        else if (predmet == "") {res.json({poruka: "Predmet ne moze biti prazan string."}); return}
        let ret = await DB.dodajPredmet(predmet)
        res.json({poruka: ret})
    }

    ukloniPredmet = async(req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let predmet = req.body.predmet as string
        if (!predmet) {res.json({poruka: "Nedostaju argumenti."}); return}
        else if (predmet == "") {res.json({poruka: "Predmet ne moze biti prazan string."}); return}
        let ret = await DB.ukloniPredmet(predmet)
        res.json({poruka: ret})
    }

    //statistika
    brojNastavnikaPoPredmetu = async(req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ret = await DB.brojNastavnikaPoPredmetu();
        res.json({poruka: "ok", podaci: ret})
    }


    brojNastavnikaPoUzrastu = async(req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ret = await DB.brojNastavnikaPoUzrastu();
        res.json({poruka: "ok", podaci: ret})
    }

    brojKorisnikaPoPolu = async(req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ret = await DB.brojKorisnikaPoPolu()
        let result: any = {Ucenik: {Z: 0, M: 0}, Nastavnik: {Z: 0, M:0}}
        for (let elem of ret) result[elem.tip][elem.pol] = elem.broj
        res.json({poruka: "ok", podaci: result})
    }

    brojCasovaPoDanuNedelje = async(req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let do_ = DatumVreme.sada()
        let od = do_.dodajDan(-365)
        let ret = await DB.brojCasovaPoDanuNedelje(od, do_)
        let result: Array<number> = [0, 0, 0, 0, 0, 0, 0]
        for (let elem of ret) {
            result[elem.dan] = elem.broj
            /*
            let dan = ""
            switch(elem.dan) {
                case 0: dan = "PON"; break;
                case 1: dan = "UTO"; break;
                case 2: dan = "SRE"; break;
                case 3: dan = "CET"; break;
                case 4: dan = "PET"; break;
                case 5: dan = "SUB"; break;
                case 6: dan = "NED"; break;
            }
            elem.dan = dan*/
        }
        res.json({poruka: "ok", podaci: result})
    }

    brojCasovaPoSatu = async(req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let do_ = DatumVreme.sada()
        let od = do_.dodajDan(-365)
        let ret: any = await DB.brojCasovaPoSatu(od, do_)
        let result = Array.from({length: 24}, () => 0)
        for (let elem of ret) {
            result[elem.sat] = elem.broj
        }
        res.json({poruka: "ok", podaci: result})
    }

    angazovanjeNastavnika = async(req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let do_ = DatumVreme.sada()
        let od = do_.dodajDan(-365)
        let ret: Array<any> = await DB.angazovanjeNastavnikaPoMesecima(od, do_)
        let result = []
        for (let elem of ret) {
            let podaciPoMesecima = Array.from({length: 12}, () => 0)
            for (let podatak of elem.podaci) podaciPoMesecima[podatak.mesec - 1] = podatak.broj
            result.push({
                ime: elem.ime,
                podaci: podaciPoMesecima
            })
        }
        res.json({poruka: "ok", podaci: result})
    }

    brojCasovaPoPredmetuPoPolu = async(req: express.Request, res: express.Response) => {
        //let predmeti = ["Matematika", "Informatika", "Geografija", "Srpski jezik", "Engleski jezik", "Istorija", "Biologija", "Hemija", "Fizika"]
        let skupovi = [ ["Engleski jezik", "Francuski jezik", "Nemacki jezik", "Italijanski jezik", "Spanski jezik", "Kineski jezik"],
                        ["Srpski jezik"], ["Istorija"], ["Geografija"], ["Biologija"], ["Hemija"], ["Fizika"], ["Matematika"],
                        ["Informatika", "Programiranje", "C++", "Java"]
                    ]
        let predmeti = [    "Strani jezici",
                            "Srpski jezik", "Istorija", "Geografija", "Biologija", "Hemija", "Fizika", "Matematika",
                            "Informatika i programiranje"
                        ]
        let do_ = DatumVreme.sada()
        let od = do_.dodajDan(-365)

        let podaciM = []
        let podaciZ = []
        for (let skup of skupovi) {
            podaciM.push(await DB.brojCasovaPoPredmetuIPolu(skup, "M", od, do_))
            podaciZ.push(await DB.brojCasovaPoPredmetuIPolu(skup, "Z", od, do_))
        }

        res.json({poruka: "ok", podaci: {
            predmeti: predmeti,
            podaciM: podaciM,
            podaciZ: podaciZ
        }})
    }
}