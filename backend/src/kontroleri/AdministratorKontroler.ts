import express from 'express';
import { Validacija } from "../validacija";
import { Utils } from "../utils"
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
}