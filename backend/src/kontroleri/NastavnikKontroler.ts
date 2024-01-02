import express from 'express';
import { Validacija } from "../validacija";
import { Utils } from "../utils"
import { DB } from "../db";
import { DatumVreme } from '../DatumVreme';

export class NastavnikKontroler {

    private autorizacija = (req: express.Request, res: express.Response) => {
        let session = req.session as any;
        if (session && session.korisnik && session.korisnik.tip == "Nastavnik") return session.korisnik;
        else {
            res.json({poruka: "Nautorizovan pristup."});
            return null;
        }
    }
    
    profilAzuriranje = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ulaz = req.body;
        let izlaz: any = {};
        let ret = await Validacija.profilAzuriranjeValidacija(ulaz, izlaz, kor)
        if (ret != "ok") { res.json({poruka: ret}); return; }
        let profil = req.file;
        if (profil) {
            ret = Validacija.profilValidacija(profil);
            if (ret != "ok") { res.json({poruka: ret}); return; }
            izlaz.profil = Utils.sacuvajFajl(profil);
        }
        ret = await DB.azurirajProfil(kor.kime, izlaz)
        if (ret != "ok") { res.json({poruka: ret}); return }
        let podaci = await DB.nastavnikPodaci(kor.kime)
        let ocena = await DB.nastavnikOcena(kor.kime)
        podaci.ocena = ocena;
        res.json({poruka: "ok", podaci: ret})
    }

    profilPodaci = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let podaci = await DB.nastavnikPodaci(kor.kime)
        if (!podaci) { res.json({poruka: "Greska u bazi."}); return }
        let ocena = await DB.nastavnikOcena(kor.kime)
        podaci.ocena = ocena;
        res.json({poruka: "ok", podaci: podaci})
    }

    termini = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        if (!req.body || !req.body.datum) { res.json({poruka: "Nedostaju argumenti."}); return }
        let ret = await DB.nastavnikTerminStatusZaDan(kor.kime, new DatumVreme(req.body.datum), true)
        res.json({poruka: "ok", podaci: ret})
    }

    radnovreme = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ret = await DB.radnovreme(kor.kime)
        if (!ret) res.json({poruka: "Greska u bazi."})
        else res.json({poruka: "ok", podaci: ret})
    }

    radnovremeAzuriranje = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let izlaz: any = {};
        let ret = Validacija.radnovremeValidacija(req.body, izlaz);
        if (ret != "ok") { res.json({poruka: ret}); return }
        ret = await DB.azurirajRadnovreme(kor.kime, izlaz)
        res.json({poruka: ret})
    }

    nedostupnostAzuriranje = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let izlaz: any = {}
        let ret = Validacija.nedostupnostValidacija(req.body, izlaz);
        if (ret != "ok") { res.json({poruka: ret}); return}
        ret = await DB.azurirajNedostupnost(kor.kime, izlaz)
        res.json({poruka: ret})
    }

    casovi = async (req: express.Request, res:express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let limit = 5;
        if (req.query.limit) limit = parseInt(req.query.limit as string);
        if (isNaN(limit)) limit = 5;
        let ret = await DB.nastavnikCasovi(kor.kime, limit)
        res.json({poruka: "ok", podaci: ret})
    }

    otkazi = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        if (!req.body || !req.body.od || !req.body.obrazlozenje) { res.json("Nedostaju podaci."); return; }
        let izlaz: any = {}
        let ret = Validacija.otkazivanjeValidacija(req.body, izlaz);
        if (ret != "ok") { res.json({poruka: ret}); return }
        let cas = await DB.cas(kor.kime, izlaz.od)
        ret = await  DB.otkaziCas(kor.kime, izlaz.od, izlaz.obrazlozenje)
        if (ret != "ok") { res.json({poruka: ret}); return }
        let sadrzaj = `Nastavnik ${kor.ime} ${kor.prezime} je otkazao cas zakazan za ${izlaz.od.datumVremeString()}`
        if (izlaz.obrazlozenje == "") sadrzaj += " bez obrazlozenja."
        else sadrzaj += " uz obrazlozenje: '" + izlaz.obrazlozenje + "'."
        await DB.dodajObavestenje(cas.ucenik, sadrzaj)
        res.json({poruka: "ok"})
    }

    zahtevi = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ret = await DB.nastavnikZahtevi(kor.kime)
        res.json({poruka: "ok", podaci: ret})
    }
    potvrdi = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        if (!req.body || !req.body.od) { res.json({poruka: "Nedostaju podaci."}); return; }
        let od = new DatumVreme(req.body.od);
        let ret = await DB.nastavnikOdgovor(kor.kime, od, null)
        if (ret != "ok") { res.json({poruka: ret}); return }
        let cas = await DB.cas(kor.kime, od)
        let sadrzaj = `Nastavnik ${kor.ime} ${kor.prezime} je potvrdio cas zakazan za ${od.datumVremeString()}.`
        await DB.dodajObavestenje(cas.ucenik, sadrzaj)
        res.json({poruka: "ok"})
    }
    odbij = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        if (!req.body || !req.body.od || !req.body.obrazlozenje) { res.json({poruka: "Nedostaju podaci."}); return; }
        let od = new DatumVreme(req.body.od);
        let obrazlozenje = req.body.obrazlozenje
        let cas = await DB.cas(kor.kime, od)
        let ret = await DB.nastavnikOdgovor(kor.kime, od, obrazlozenje)
        if (ret != "ok") { res.json({poruka: ret}); return }
        let sadrzaj = `Nastavnik ${kor.ime} ${kor.prezime} je odbio cas zakazan za ${od.datumVremeString()}`
        if (obrazlozenje == "") sadrzaj += " bez obrazlozenja."
        else sadrzaj += " uz obrazlozenje: '" + obrazlozenje + "'."
        await DB.dodajObavestenje(cas.ucenik, sadrzaj)
        res.json({poruka: "ok"})
    }

    ucenici = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let ret = await DB.nastavnikUcenici(kor.kime)
        res.json({poruka: "ok", podaci: ret})
    }

    dosije = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        if (!req.body || !req.body.ucenik) { res.json({poruka: "Nedovoljno podataka."}); return }
        let ret: Array<any> = await DB.nastavnikDosije(kor.kime, req.body.ucenik)
        res.json({poruka: "ok", podaci: ret})
    }

    recenzija = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        let izlaz: any = {}
        let ret = await Validacija.nastavnikRecenzijaValidacija(req.body, izlaz, kor.kime)
        if (ret != "ok") { res.json({poruka: ret}); return }
        ret = await DB.nastavnikRecenzija(kor.kime, izlaz.od, izlaz.ocena, izlaz.komentar)
        res.json({poruka: ret})
    }

    dosijeProfil = async (req: express.Request, res: express.Response) => {
        let kor = this.autorizacija(req, res);
        if (!kor) return;
        if (!req.body.ucenik) { res.json({poruka: "Nema dovoljno podataka."}); return; }
        let ret = await  DB.ucenikPodaci(req.body.ucenik)
        if (!ret) res.json({poruka: "Nije pronadjen ucenik."})
        else {
            delete ret.adresa 
            delete ret.aktivan
            res.json({poruka: "ok", podaci: ret})
        }
    }
}